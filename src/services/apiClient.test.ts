import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient, ErroDeApi, enderecoDaApi, estadoDoServidor, type OpcoesDeRepeticao } from "./apiClient";

/** Relógio e espera simulados: o teste "passa" 90 s sem esperar nada. */
function relogioFalso() {
  let agora = 0;
  const opcoes: OpcoesDeRepeticao = {
    limiteMs: 90_000,
    atrasoInicialMs: 1_000,
    atrasoMaximoMs: 15_000,
    agora: () => agora,
    dormir: async (ms) => {
      agora += ms;
    },
  };
  return { opcoes, passou: () => agora };
}

const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

/** Servidor simulado: responde 503 até `acordaAposMs` e depois 200. */
function servidorQueAcorda(relogio: { passou: () => number }, acordaAposMs: number) {
  return vi.fn(async () => (relogio.passou() < acordaAposMs ? new Response("", { status: 503 }) : json({ ok: true })));
}

beforeEach(() => {
  estadoDoServidor.reiniciar();
  localStorage.clear();
});

describe("ApiClient e cold start", () => {
  it("repete até o backend acordar em 10 s e devolve o dado, sem erro", async () => {
    const relogio = relogioFalso();
    const buscar = servidorQueAcorda(relogio, 10_000);
    const cliente = new ApiClient("http://api.teste/api", relogio.opcoes, buscar as unknown as typeof fetch);

    const resposta = await cliente.requisitar<{ ok: boolean }>("/public/status");

    expect(resposta.ok).toBe(true);
    expect(relogio.passou()).toBeGreaterThanOrEqual(10_000);
    expect(buscar.mock.calls.length).toBeGreaterThan(3);
  });

  it("marca o servidor como acordando durante a espera e limpa o estado ao responder", async () => {
    const relogio = relogioFalso();
    const observado: Array<number | null> = [];
    estadoDoServidor.assinar(() => observado.push(estadoDoServidor.obterDesde()));
    const cliente = new ApiClient("http://api.teste/api", relogio.opcoes, servidorQueAcorda(relogio, 5_000) as unknown as typeof fetch);

    await cliente.requisitar("/public/status");

    expect(observado[0]).not.toBeNull();
    expect(observado[observado.length - 1]).toBeNull();
    expect(estadoDoServidor.obterDesde()).toBeNull();
  });

  it("nunca acordando: só depois de ~90 s aparece o erro final", async () => {
    const relogio = relogioFalso();
    const buscar = vi.fn(async () => new Response("", { status: 503 }));
    const cliente = new ApiClient("http://api.teste/api", relogio.opcoes, buscar as unknown as typeof fetch);

    const erro = (await cliente.requisitar("/public/status").catch((e) => e)) as ErroDeApi;

    expect(erro).toBeInstanceOf(ErroDeApi);
    expect(erro.ehDeRede).toBe(true);
    expect(relogio.passou()).toBeGreaterThan(60_000);
    expect(relogio.passou()).toBeLessThanOrEqual(90_000);
    expect(estadoDoServidor.obterDesde()).toBeNull();
  });

  it("erro de rede em leitura também é repetido", async () => {
    const relogio = relogioFalso();
    let tentativas = 0;
    const buscar = vi.fn(async () => {
      tentativas += 1;
      if (tentativas < 4) throw new TypeError("Failed to fetch");
      return json({ ok: true });
    });
    const cliente = new ApiClient("http://api.teste/api", relogio.opcoes, buscar as unknown as typeof fetch);

    await expect(cliente.requisitar("/public/status")).resolves.toEqual({ ok: true });
    expect(tentativas).toBe(4);
  });

  it("erro de rede numa escrita comum NÃO é repetido (evita gravar em dobro)", async () => {
    const relogio = relogioFalso();
    const buscar = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    const cliente = new ApiClient("http://api.teste/api", relogio.opcoes, buscar as unknown as typeof fetch);

    await expect(cliente.requisitar("/admin/teams", { metodo: "POST", corpo: { nome: "A" } })).rejects.toBeInstanceOf(ErroDeApi);
    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it("escrita marcada como repetível (resultado com Idempotency-Key) repete erro de rede", async () => {
    const relogio = relogioFalso();
    let tentativas = 0;
    const buscar = vi.fn(async () => {
      tentativas += 1;
      if (tentativas < 3) throw new TypeError("Failed to fetch");
      return json({ id: "p1" });
    });
    const cliente = new ApiClient("http://api.teste/api", relogio.opcoes, buscar as unknown as typeof fetch);

    await expect(
      cliente.requisitar("/admin/matches/p1/result", { metodo: "PUT", corpo: {}, repetir: "sempre", cabecalhos: { "Idempotency-Key": "k" } }),
    ).resolves.toEqual({ id: "p1" });
    expect(tentativas).toBe(3);
  });

  it("erro de regra (4xx) é imediato, sem repetir, e traz código e extras", async () => {
    const relogio = relogioFalso();
    const buscar = vi.fn(async () =>
      json({ codigo: "CONFIG_CONGELADA", detail: "A configuração está congelada.", partidasFinalizadas: 3, status: 409, title: "x", type: "about:blank" }, 409),
    );
    const cliente = new ApiClient("http://api.teste/api", relogio.opcoes, buscar as unknown as typeof fetch);

    const erro = (await cliente.requisitar("/admin/championships/1/config", { metodo: "PUT", corpo: {}, autenticada: true }).catch((e) => e)) as ErroDeApi;

    expect(buscar).toHaveBeenCalledTimes(1);
    expect(erro.status).toBe(409);
    expect(erro.codigo).toBe("CONFIG_CONGELADA");
    expect(erro.extras.partidasFinalizadas).toBe(3);
    expect(erro.ehDeRede).toBe(false);
    expect(relogio.passou()).toBe(0);
  });

  it("401 com token limpa a sessão e avisa quem escuta", async () => {
    const relogio = relogioFalso();
    const buscar = vi.fn(async () => json({ codigo: "X", detail: "Sessão" }, 401));
    const cliente = new ApiClient("http://api.teste/api", relogio.opcoes, buscar as unknown as typeof fetch);
    cliente.definirToken("token-velho");
    const aviso = vi.fn();
    cliente.aoExpirarSessao(aviso);

    await cliente.requisitar("/admin/users", { autenticada: true }).catch(() => undefined);

    expect(aviso).toHaveBeenCalledTimes(1);
    expect(cliente.temToken()).toBe(false);
    expect(localStorage.getItem("rks_token")).toBeNull();
  });

  it("envia o token só nas requisições autenticadas", async () => {
    const relogio = relogioFalso();
    const buscar = vi.fn(async (_url: string, _init?: RequestInit) => json({}));
    const cliente = new ApiClient("http://api.teste/api", relogio.opcoes, buscar as unknown as typeof fetch);
    cliente.definirToken("abc");

    await cliente.requisitar("/public/seasons");
    await cliente.requisitar("/admin/users", { autenticada: true });

    expect((buscar.mock.calls[0][1]?.headers as Record<string, string>).Authorization).toBeUndefined();
    expect((buscar.mock.calls[1][1]?.headers as Record<string, string>).Authorization).toBe("Bearer abc");
  });

  it("resposta 204 devolve undefined", async () => {
    const relogio = relogioFalso();
    const buscar = vi.fn(async () => new Response(null, { status: 204 }));
    const cliente = new ApiClient("http://api.teste/api", relogio.opcoes, buscar as unknown as typeof fetch);

    await expect(cliente.requisitar("/admin/teams/1", { metodo: "DELETE", autenticada: true })).resolves.toBeUndefined();
  });
});

describe("endereço da API", () => {
  it("em produção ignora endereço absoluto (como o do Railway desligado) e usa /api", () => {
    expect(enderecoDaApi("https://rks-arena-backend-production.up.railway.app", true)).toBe("/api");
    expect(enderecoDaApi(undefined, true)).toBe("/api");
    expect(enderecoDaApi("", true)).toBe("/api");
  });
  it("em produção aceita caminho relativo", () => {
    expect(enderecoDaApi("/api", true)).toBe("/api");
    expect(enderecoDaApi("/v2/api", true)).toBe("/v2/api");
  });
  it("fora de produção respeita VITE_API_URL", () => {
    expect(enderecoDaApi("http://localhost:8082/api", false)).toBe("http://localhost:8082/api");
    expect(enderecoDaApi(undefined, false)).toBeUndefined();
  });
});
