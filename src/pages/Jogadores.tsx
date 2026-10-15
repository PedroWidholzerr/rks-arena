import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { EstadoDaConsulta, Vazio } from "@/components/estados/Estados";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJogadorPublico, useJogadoresPublicos } from "@/hooks/dados";
import { iniciais } from "@/lib/formato";

export function ListaDeJogadores() {
  const [busca, setBusca] = useState("");
  const [termo, setTermo] = useState("");
  // Espera o visitante parar de digitar antes de buscar no servidor.
  useEffect(() => {
    const espera = setTimeout(() => setTermo(busca.trim()), 300);
    return () => clearTimeout(espera);
  }, [busca]);
  const consulta = useJogadoresPublicos(termo);
  return (
    <>
      <CabecalhoDePagina titulo="Jogadores" descricao="Busque pelo Riot ID." />
      <div className="mb-4 flex max-w-formulario flex-col gap-1.5">
        <Label htmlFor="busca-jogador">Buscar por Riot ID</Label>
        <Input id="busca-jogador" type="search" className="min-h-11 text-base" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nick ou tag" />
      </div>
      <EstadoDaConsulta
        consulta={consulta}
        rotulo="os Jogadores"
        atualizadoEm={(r) => r.atualizadoEm}
        vazio={{ quando: (r) => r.dados.itens.length === 0, titulo: termo ? "Nenhum Jogador encontrado." : "Ainda não há Jogadores." }}
      >
        {(resposta) => (
          <>
            <ul className="grid gap-2 sm:grid-cols-2">
              {resposta.dados.itens.map((j) => (
                <li key={j.id}>
                  <Link to={`/jogadores/${j.id}`} className="block">
                    <div className="esports-card flex items-center gap-3 p-5 transition-all hover:scale-[1.02]">
                      <Avatar src={j.fotoUrl} texto={iniciais(j.nick)} tamanho={40} />
                      <span className="min-w-0">
                        <span className="block truncate font-display text-base font-bold tracking-tight text-foreground">{j.nick}</span>
                        <span className="tag-badge">{j.tag}</span>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {resposta.dados.total > resposta.dados.itens.length ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Mostrando <span className="numero">{resposta.dados.itens.length}</span> de <span className="numero">{resposta.dados.total}</span>. Refine a busca.
              </p>
            ) : null}
          </>
        )}
      </EstadoDaConsulta>
    </>
  );
}

export function DetalheDoJogador() {
  const { id = "" } = useParams();
  const consulta = useJogadorPublico(id);
  return (
    <EstadoDaConsulta consulta={consulta} rotulo="o Jogador" atualizadoEm={(r) => r.atualizadoEm}>
      {({ dados }) => (
        <>
          <div className="mb-6 flex items-center gap-4">
            <Avatar src={dados.fotoUrl} texto={iniciais(dados.nick)} tamanho={96} />
            <CabecalhoDePagina titulo={dados.riotId} descricao="Riot ID" />
          </div>
          <section aria-labelledby="partidas-do-jogador">
            <h2 id="partidas-do-jogador" className="mb-4 font-display text-2xl font-bold uppercase tracking-tighter text-foreground">
              Desempenho
            </h2>
            <Vazio titulo="Sem Partidas registradas." texto="As estatísticas aparecem quando o Administrador as registrar." />
          </section>
        </>
      )}
    </EstadoDaConsulta>
  );
}
