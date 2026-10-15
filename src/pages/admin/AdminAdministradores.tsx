import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Copy, Download, Plus } from "lucide-react";
import { Alerta } from "@/components/Alerta";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { DialogoDeConfirmacao } from "@/components/admin/DialogoDeConfirmacao";
import { ErroDaOperacao } from "@/components/admin/ErroDaOperacao";
import { EstadoDaConsulta } from "@/components/estados/Estados";
import { Selo } from "@/components/SeloEstado";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminChaves, mensagemDeErro, useAdminAdministradores, useMutacao } from "@/hooks/dados";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/services/api";
import type { Administrador } from "@/types";

const LIMITE = 3;

function DialogoDeNovoAdministrador({ aoFechar }: { aoFechar: () => void }) {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [temporaria, setTemporaria] = useState<{ email: string; senha: string } | null>(null);
  const criar = useMutacao(() => adminApi.criarAdministrador(email, nome.trim()), {
    invalidar: [adminChaves.administradores],
    aoConcluir: (r) => setTemporaria({ email: r.administrador.email, senha: r.senhaTemporaria }),
  });
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    criar.mutate(undefined);
  };
  const copiar = async () => {
    if (!temporaria) return;
    try {
      await navigator.clipboard.writeText(temporaria.senha);
      toast.success("Senha temporária copiada.");
    } catch {
      toast.error("Não foi possível copiar. Selecione a senha e copie à mão.");
    }
  };
  return (
    <Dialog open onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DialogContent className="max-w-formulario shadow-flutuante">
        <DialogHeader>
          <DialogTitle>{temporaria ? "Administrador criado" : "Novo Administrador"}</DialogTitle>
          <DialogDescription>O sistema permite até {LIMITE} Administradores ativos.</DialogDescription>
        </DialogHeader>
        {temporaria ? (
          <div className="space-y-4">
            <Alerta variante="aviso" titulo="Anote a senha temporária agora">
              Ela aparece só desta vez e nunca fica gravada em texto. Entregue a <strong>{temporaria.email}</strong>; no primeiro acesso a troca é obrigatória.
            </Alerta>
            <div className="flex items-center gap-2">
              <code className="numero flex-1 select-all rounded-md border border-border bg-surface-muted px-3 py-3 text-lg">{temporaria.senha}</code>
              <Button type="button" variant="secondary" className="min-h-toque" onClick={() => void copiar()}>
                <Copy aria-hidden="true" className="mr-2 h-4 w-4" /> Copiar
              </Button>
            </div>
            <div className="flex justify-end">
              <Button className="min-h-toque" onClick={aoFechar}>
                Concluir
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-4" aria-busy={criar.isPending}>
            <ErroDaOperacao erro={criar.error} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="novo-admin-nome">Nome</Label>
              <Input id="novo-admin-nome" maxLength={120} className="min-h-11 text-base" value={nome} onChange={(e) => setNome(e.target.value)} />
              <p className="text-sm text-muted-foreground">Como o painel vai chamar a pessoa. Opcional: sem nome, aparece o e-mail.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="novo-admin-email">E-mail (obrigatório)</Label>
              <Input id="novo-admin-email" type="email" required className="min-h-11 text-base" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex justify-between gap-2">
              <Button type="button" variant="ghost" className="min-h-toque" onClick={aoFechar}>
                Cancelar
              </Button>
              <Button type="submit" className="min-h-toque" disabled={criar.isPending}>
                {criar.isPending ? "Criando…" : "Criar Administrador"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Cada administrador define como o painel o chama. */
function MeuPerfil() {
  const { nome, email, definirNome } = useAuth();
  const [texto, setTexto] = useState(nome ?? "");
  const salvar = useMutacao(() => adminApi.definirMeuNome(texto), {
    invalidar: [adminChaves.administradores],
    sucesso: "Nome salvo.",
    aoConcluir: (r) => definirNome(r.nome),
  });
  return (
    <section id="perfil" aria-labelledby="meu-perfil" className="space-y-3 rounded-md border border-border bg-card p-4">
      <h2 id="meu-perfil" className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
        Meu nome
      </h2>
      <p className="text-sm text-muted-foreground">É assim que o painel chama você. Sem nome, aparece o e-mail ({email}).</p>
      <ErroDaOperacao erro={salvar.error} />
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          salvar.mutate(undefined);
        }}
      >
        <div className="flex min-w-[14rem] flex-1 flex-col gap-1.5">
          <Label htmlFor="meu-nome">Nome</Label>
          <Input id="meu-nome" maxLength={120} className="min-h-11 text-base" value={texto} onChange={(e) => setTexto(e.target.value)} />
        </div>
        <Button type="submit" className="min-h-toque" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar nome"}
        </Button>
      </form>
    </section>
  );
}

export function AdminAdministradores() {
  const consulta = useAdminAdministradores();
  const [criando, setCriando] = useState(false);
  const [desativando, setDesativando] = useState<Administrador | null>(null);
  const alternar = useMutacao((a: { admin: Administrador; ativo: boolean }) => adminApi.definirAtivo(a.admin.id, a.ativo), {
    invalidar: [adminChaves.administradores],
    sucesso: (_r, a) => (a.ativo ? "Administrador reativado." : "Administrador desativado."),
  });
  const exportar = useMutacao(() => adminApi.exportar(), { sucesso: "Exportação gerada." });

  const baixar = async () => {
    try {
      const dados = await exportar.mutateAsync(undefined);
      const arquivo = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(arquivo);
      const ancora = document.createElement("a");
      ancora.href = url;
      ancora.download = `rks-arena-${new Date().toISOString().slice(0, 10)}.json`;
      ancora.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(mensagemDeErro(e).texto);
    }
  };

  return (
    <>
      <CabecalhoDePagina
        titulo="Administradores"
        descricao="Até 3 ativos. Os desativados ficam para auditoria e nunca são excluídos."
        acoes={
          <Button className="min-h-toque" onClick={() => setCriando(true)}>
            <Plus aria-hidden="true" className="mr-1 h-4 w-4" /> Novo Administrador
          </Button>
        }
      />
      <div className="space-y-6">
        <ErroDaOperacao erro={alternar.error} />
        <EstadoDaConsulta consulta={consulta} rotulo="os Administradores">
          {(lista) => (
            <ul className="divide-y divide-border rounded-md border border-border bg-card">
              {lista.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{a.nome || a.email}</span>
                    {a.nome ? <span className="block truncate font-mono text-xs text-muted-foreground">{a.email}</span> : null}
                  </span>
                  {a.trocarSenha ? <Selo tom="info">Aguardando troca de senha</Selo> : null}
                  <Selo tom={a.ativo ? "sucesso" : "neutro"}>{a.ativo ? "Ativo" : "Desativado"}</Selo>
                  {a.ativo ? (
                    <Button variant="ghost" className="min-h-toque text-danger" onClick={() => setDesativando(a)}>
                      Desativar
                    </Button>
                  ) : (
                    <Button variant="secondary" className="min-h-toque" disabled={alternar.isPending} onClick={() => alternar.mutate({ admin: a, ativo: true })}>
                      Reativar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </EstadoDaConsulta>

        <section aria-labelledby="exportar" className="space-y-2 rounded-md border border-border bg-card p-4">
          <h2 id="exportar" className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
            Exportar dados
          </h2>
          <p className="text-sm text-muted-foreground">
            Baixa um arquivo JSON completo (Temporadas, Campeonatos, Times, Jogadores, Elencos e Partidas). Guarde-o fora do sistema. Ele não inclui senhas.
          </p>
          <Button variant="secondary" className="min-h-toque" disabled={exportar.isPending} onClick={() => void baixar()}>
            <Download aria-hidden="true" className="mr-2 h-4 w-4" />
            {exportar.isPending ? "Gerando…" : "Exportar dados"}
          </Button>
        </section>

        <MeuPerfil />

        <section aria-labelledby="senha" className="space-y-2 rounded-md border border-border bg-card p-4">
          <h2 id="senha" className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
            Sua senha
          </h2>
          <Button asChild variant="secondary" className="min-h-toque">
            <Link to="/troque-sua-senha">Trocar senha</Link>
          </Button>
        </section>
      </div>
      {criando ? <DialogoDeNovoAdministrador aoFechar={() => setCriando(false)} /> : null}
      <DialogoDeConfirmacao
        aberto={desativando !== null}
        aoMudar={(aberto) => !aberto && setDesativando(null)}
        titulo={`Desativar ${desativando?.email ?? "o Administrador"}?`}
        afetados={desativando ? [`${desativando.email} perde o acesso na hora, mesmo com a sessão aberta`] : []}
        consequencia="O último Administrador ativo nunca pode ser desativado. Você pode reativá-lo depois."
        rotuloDaAcao="Desativar Administrador"
        aoConfirmar={() => (desativando ? alternar.mutateAsync({ admin: desativando, ativo: false }).catch(() => undefined) : undefined)}
      />
    </>
  );
}
