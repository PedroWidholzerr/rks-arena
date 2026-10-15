// Cliente HTTP tolerante a cold start (AD-20, NFR-4). O backend gratuito dorme e leva cerca de 1 minuto
// para acordar: erro de rede e respostas 502, 503 e 504 são repetidos com recuo exponencial por até ~90 s,
// e o estado "acordando" fica disponível para a interface. Erro de regra (4xx) é imediato.

export interface ProblemaDaApi {
  codigo?: string;
  detail?: string;
  title?: string;
  [chave: string]: unknown;
}

/** Erro definitivo de uma requisição (depois das repetições, quando couberem). */
export class ErroDeApi extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string | undefined,
    mensagem: string,
    public readonly extras: Record<string, unknown> = {},
  ) {
    super(mensagem);
    this.name = "ErroDeApi";
  }

  /** Falha de infraestrutura (sem resposta ou gateway), diferente de erro de regra. */
  get ehDeRede(): boolean {
    return this.status === 0 || this.status === 502 || this.status === 503 || this.status === 504;
  }
}

export interface OpcoesDeRepeticao {
  /** Tempo total máximo tentando, em ms (padrão 90 s). */
  limiteMs: number;
  atrasoInicialMs: number;
  atrasoMaximoMs: number;
  dormir: (ms: number) => Promise<void>;
  agora: () => number;
}

export const REPETICAO_PADRAO: OpcoesDeRepeticao = {
  limiteMs: 90_000,
  atrasoInicialMs: 1_000,
  atrasoMaximoMs: 15_000,
  dormir: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  agora: () => Date.now(),
};

const STATUS_DE_GATEWAY = new Set([502, 503, 504]);

/** Estado compartilhado de "servidor acordando": a interface só observa, nunca decide repetições. */
class EstadoDoServidor {
  private ouvintes = new Set<() => void>();
  private ativas = 0;
  private desde: number | null = null;

  assinar = (ouvinte: () => void): (() => void) => {
    this.ouvintes.add(ouvinte);
    return () => this.ouvintes.delete(ouvinte);
  };

  /** Instante em que a primeira falha repetível começou, ou null se o servidor está respondendo. */
  obterDesde = (): number | null => this.desde;

  comecarEspera(agora: number): void {
    this.ativas += 1;
    if (this.desde === null) {
      this.desde = agora;
      this.avisar();
    }
  }

  terminarEspera(): void {
    this.ativas = Math.max(0, this.ativas - 1);
    if (this.ativas === 0 && this.desde !== null) {
      this.desde = null;
      this.avisar();
    }
  }

  reiniciar(): void {
    this.ativas = 0;
    this.desde = null;
    this.avisar();
  }

  private avisar(): void {
    this.ouvintes.forEach((o) => o());
  }
}

export const estadoDoServidor = new EstadoDoServidor();

export interface Requisicao {
  metodo?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  corpo?: unknown;
  /** Corpo multipart (upload de imagem); o navegador define o Content-Type. */
  formulario?: FormData;
  cabecalhos?: Record<string, string>;
  /** Envia o token do admin. */
  autenticada?: boolean;
  /** "sempre" repete também erro de rede (use só em requisição segura de repetir); o padrão de escrita é só gateway. */
  repetir?: "sempre" | "so-gateway";
}

function resolverBase(bruta?: string): string {
  const limpa = (bruta ?? "").trim().replace(/\/+$/, "");
  if (!limpa) return "http://localhost:8081/api";
  return limpa.endsWith("/api") ? limpa : `${limpa}/api`;
}

export class ApiClient {
  private token: string | null = null;
  private aoSessaoExpirar: (() => void) | null = null;

  constructor(
    // Em produção a API é a rota /api da própria Vercel (rewrite para o Render); VITE_API_URL só muda isso se existir.
    private readonly base: string = resolverBase(import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "/api" : undefined)),
    private readonly repeticao: OpcoesDeRepeticao = REPETICAO_PADRAO,
    private readonly buscar: typeof fetch = (entrada, init) => fetch(entrada, init),
  ) {
    try {
      this.token = localStorage.getItem("rks_token");
    } catch {
      this.token = null;
    }
  }

  definirToken(token: string | null): void {
    this.token = token;
    try {
      if (token) localStorage.setItem("rks_token", token);
      else localStorage.removeItem("rks_token");
    } catch {
      // armazenamento bloqueado (janela privada): a sessão vale só até recarregar
    }
  }

  temToken(): boolean {
    return this.token !== null;
  }

  /** O contexto de autenticação registra aqui o que fazer quando a sessão expira (401). */
  aoExpirarSessao(acao: (() => void) | null): void {
    this.aoSessaoExpirar = acao;
  }

  async requisitar<T>(caminho: string, opcoes: Requisicao = {}): Promise<T> {
    const metodo = opcoes.metodo ?? "GET";
    const repetirSempre = (opcoes.repetir ?? (metodo === "GET" ? "sempre" : "so-gateway")) === "sempre";
    const cabecalhos: Record<string, string> = { Accept: "application/json", ...(opcoes.cabecalhos ?? {}) };
    let corpo: BodyInit | undefined;
    if (opcoes.formulario) {
      corpo = opcoes.formulario;
    } else if (opcoes.corpo !== undefined) {
      cabecalhos["Content-Type"] = "application/json";
      corpo = JSON.stringify(opcoes.corpo);
    }
    if (opcoes.autenticada && this.token) cabecalhos.Authorization = `Bearer ${this.token}`;

    const resposta = await this.comRepeticao(`${this.base}${caminho}`, { method: metodo, headers: cabecalhos, body: corpo }, repetirSempre);

    if (resposta.status === 401 && opcoes.autenticada && this.token) {
      this.definirToken(null);
      this.aoSessaoExpirar?.();
    }
    if (!resposta.ok) throw await this.lerErro(resposta);
    if (resposta.status === 204) return undefined as T;
    return (await resposta.json()) as T;
  }

  private async comRepeticao(url: string, init: RequestInit, repetirSempre: boolean): Promise<Response> {
    const { limiteMs, atrasoInicialMs, atrasoMaximoMs, dormir, agora } = this.repeticao;
    const inicio = agora();
    let atraso = atrasoInicialMs;
    let esperando = false;
    try {
      for (;;) {
        let falha: ErroDeApi;
        try {
          const resposta = await this.buscar(url, init);
          if (!STATUS_DE_GATEWAY.has(resposta.status)) return resposta;
          falha = await this.lerErro(resposta);
        } catch (erro) {
          if (erro instanceof ErroDeApi) throw erro;
          // Falha de rede: só repete quando é seguro (leitura, ou escrita marcada como repetível).
          if (!repetirSempre) {
            throw new ErroDeApi(0, undefined, "Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.");
          }
          falha = new ErroDeApi(0, undefined, "Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.");
        }
        if (agora() - inicio + atraso > limiteMs) throw falha;
        if (!esperando) {
          estadoDoServidor.comecarEspera(agora());
          esperando = true;
        }
        await dormir(atraso);
        atraso = Math.min(atraso * 2, atrasoMaximoMs);
      }
    } finally {
      if (esperando) estadoDoServidor.terminarEspera();
    }
  }

  private async lerErro(resposta: Response): Promise<ErroDeApi> {
    let problema: ProblemaDaApi = {};
    try {
      problema = (await resposta.json()) as ProblemaDaApi;
    } catch {
      // corpo vazio ou que não é JSON (página de erro do gateway)
    }
    const { codigo, detail, title: _titulo, type: _tipo, status: _status, instance: _instancia, ...extras } = problema;
    return new ErroDeApi(resposta.status, codigo, detail ?? "A operação não foi concluída.", extras);
  }
}

export const apiClient = new ApiClient();
