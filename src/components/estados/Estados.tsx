import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Inbox, Loader2, LogOut, RefreshCw } from "lucide-react";
import { Alerta } from "@/components/Alerta";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useServidorAcordando } from "@/hooks/useServidorAcordando";
import { hora } from "@/lib/formato";
import { ErroDeApi } from "@/services/apiClient";

/** Esqueleto com a altura final das linhas, para a página não pular quando o dado chega. */
export function EsqueletoDeLista({ linhas = 6, altura = "h-12" }: { linhas?: number; altura?: string }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: linhas }, (_, i) => (
        <Skeleton key={i} className={`${altura} w-full`} />
      ))}
    </div>
  );
}

/** "Acordando o servidor…": aviso `warning`, nunca erro, com o tempo decorrido depois de 15 s. */
export function AvisoAcordando() {
  const { acordando, segundos, mostrarTempo } = useServidorAcordando();
  if (!acordando) return null;
  return (
    <Alerta variante="aviso" titulo="Acordando o servidor…">
      <p className="flex items-center gap-2">
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />
        <span>Isso pode levar cerca de 1 minuto. Você não precisa recarregar a página.</span>
      </p>
      {mostrarTempo ? <p className="mt-1 numero">Aguardando há {segundos} s.</p> : null}
    </Alerta>
  );
}

/** Faixa que acompanha o dado em cache enquanto o servidor acorda. */
export function FaixaDadoSalvo({ atualizadoEm }: { atualizadoEm?: string }) {
  const { acordando } = useServidorAcordando();
  if (!acordando) return null;
  return (
    <p role="status" className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
      Mostrando a última versão salva; atualizando…{atualizadoEm ? <span className="numero"> Dado de {hora(atualizadoEm)}.</span> : null}
    </p>
  );
}

interface VazioProps {
  titulo: string;
  /** Texto de apoio: por que está vazio e o que fazer. Aceita também como filhos. */
  texto?: ReactNode;
  children?: ReactNode;
  acao?: ReactNode;
}

/** Estado vazio: diz por que está vazio e o que fazer (sem ilustração; ícone neutro de 24 px). */
export function Vazio({ titulo, texto, children, acao }: VazioProps) {
  const apoio = texto ?? children;
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border-strong px-4 py-10 text-center">
      <Inbox aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
      <p className="font-semibold">{titulo}</p>
      {apoio ? <p className="max-w-prose text-sm text-muted-foreground">{apoio}</p> : null}
      {acao ? <div className="mt-2">{acao}</div> : null}
    </div>
  );
}

/** 403 (conta desativada ou sem papel): página dedicada, sem revelar o que existe. */
export function SemPermissao() {
  const { sair } = useAuth();
  return (
    <div className="mx-auto max-w-formulario py-10">
      <Alerta
        variante="info"
        titulo="Você não tem acesso a esta área"
        acao={
          <Button variant="secondary" onClick={sair} asChild>
            <Link to="/entrar">
              <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
              Sair
            </Link>
          </Button>
        }
      >
        Entre com uma conta de Administrador ativa para continuar.
      </Alerta>
    </div>
  );
}

interface ErroProps {
  rotulo: string;
  erro: unknown;
  aoTentarDeNovo?: () => void;
}

/** Erro só depois de esgotadas as tentativas (rede/gateway) ou na hora (regra 4xx), sempre com "Tentar de novo". */
export function BlocoDeErro({ rotulo, erro, aoTentarDeNovo }: ErroProps) {
  if (erro instanceof ErroDeApi && (erro.status === 401 || erro.status === 403)) return <SemPermissao />;
  const regra = erro instanceof ErroDeApi && !erro.ehDeRede;
  const naoEncontrado = erro instanceof ErroDeApi && erro.status === 404;
  const titulo = naoEncontrado ? `Não encontramos ${rotulo}` : `Não foi possível carregar ${rotulo}`;
  return (
    <Alerta
      variante="erro"
      titulo={titulo}
      acao={
        aoTentarDeNovo && !naoEncontrado ? (
          <Button variant="secondary" size="sm" onClick={aoTentarDeNovo}>
            <RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />
            Tentar de novo
          </Button>
        ) : undefined
      }
    >
      {regra && erro instanceof ErroDeApi ? erro.message : "Verifique sua conexão e tente de novo."}
    </Alerta>
  );
}

interface EstadoDaConsultaProps<T> {
  consulta: UseQueryResult<T>;
  /** Nome do que está sendo carregado, em português ("a classificação"). */
  rotulo: string;
  vazio?: { quando: (dados: T) => boolean; titulo: string; texto?: ReactNode; acao?: ReactNode };
  esqueleto?: ReactNode;
  /** Quando o dado traz `atualizadoEm`, a faixa de dado salvo o mostra. */
  atualizadoEm?: (dados: T) => string | undefined;
  children: (dados: T) => ReactNode;
}

/**
 * Família única de estados de tela: carregando (esqueleto + aviso de servidor acordando), vazio, erro e,
 * havendo dado em cache, ele fica visível com a faixa "Mostrando a última versão salva; atualizando…".
 */
export function EstadoDaConsulta<T>({ consulta, rotulo, vazio, esqueleto, atualizadoEm, children }: EstadoDaConsultaProps<T>) {
  const dados = consulta.data;
  if (dados !== undefined) {
    return (
      <div aria-busy={consulta.isFetching} className="space-y-3">
        {consulta.isFetching ? <FaixaDadoSalvo atualizadoEm={atualizadoEm?.(dados)} /> : null}
        {consulta.isError ? <BlocoDeErro rotulo={rotulo} erro={consulta.error} aoTentarDeNovo={() => void consulta.refetch()} /> : null}
        {vazio?.quando(dados) ? <Vazio titulo={vazio.titulo} acao={vazio.acao}>{vazio.texto}</Vazio> : children(dados)}
      </div>
    );
  }
  if (consulta.isError) {
    return <BlocoDeErro rotulo={rotulo} erro={consulta.error} aoTentarDeNovo={() => void consulta.refetch()} />;
  }
  return (
    <div aria-busy="true" className="space-y-3">
      <AvisoAcordando />
      {esqueleto ?? <EsqueletoDeLista />}
    </div>
  );
}
