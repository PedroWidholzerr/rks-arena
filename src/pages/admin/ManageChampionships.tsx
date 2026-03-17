import { useState } from "react";
import { Championship } from "@/types";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { useChampionships, useSaveChampionshipMutation, useDeleteChampionship, useChampionshipTeamIds, useSetChampionshipTeams } from "@/hooks/useChampionships";
import { useSeasons } from "@/hooks/useSeasons";
import { useTeams } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

function TeamManager({ championshipId }: { championshipId: string }) {
  const { data: allTeams = [] } = useTeams();
  const { data: selectedTeamIds = [], isLoading } = useChampionshipTeamIds(championshipId);
  const setTeamsMutation = useSetChampionshipTeams();

  const toggleTeam = (teamId: string) => {
    const newIds = selectedTeamIds.includes(teamId)
      ? selectedTeamIds.filter(id => id !== teamId)
      : [...selectedTeamIds, teamId];
    setTeamsMutation.mutate({ championshipId, teamIds: newIds });
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-2">
      {allTeams.map(team => (
        <label
          key={team.id}
          className="flex items-center gap-3 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-secondary/50"
        >
          <Checkbox
            checked={selectedTeamIds.includes(team.id)}
            onCheckedChange={() => toggleTeam(team.id)}
            disabled={setTeamsMutation.isPending}
          />
          <span className="text-sm font-medium text-foreground">{team.name}</span>
          <span className="text-xs text-muted-foreground">[{team.tag}]</span>
        </label>
      ))}
      {allTeams.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum time cadastrado.</p>
      )}
    </div>
  );
}

export default function ManageChampionships() {
  const { data: items = [], isLoading } = useChampionships();
  const { data: seasons = [] } = useSeasons();
  const { data: allTeams = [] } = useTeams();
  const saveMutation = useSaveChampionshipMutation();
  const deleteMutation = useDeleteChampionship();
  const [openDialog, setOpenDialog] = useState(false);
  const [teamsDialogId, setTeamsDialogId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    seasonId: seasons[0]?.id || "",
    status: "upcoming" as const,
  });

  const handleOpenDialog = (item?: Championship) => {
    if (item) {
      const { id, ...rest } = item;
      setFormData({
        ...rest,
        status: item.status as any,
      });
      setEditingId(item.id);
    } else {
      setFormData({
        name: "",
        description: "",
        seasonId: seasons[0]?.id || "",
        status: "upcoming",
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    
    await saveMutation.mutateAsync({
      id: editingId || undefined,
      data: formData,
    });
    setOpenDialog(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tighter text-foreground">Campeonatos</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" /> Novo Campeonato
        </button>
      </div>

      <div className="esports-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Nome</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Descrição</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="h-12 border-b border-border last:border-0 hover:bg-[hsl(0_0%_100%/0.03)]">
                <td className="px-4 py-2 font-display text-sm font-semibold text-foreground">{item.name}</td>
                <td className="px-4 py-2 font-mono text-sm text-muted-foreground">{item.description}</td>
                <td className="px-4 py-2 font-mono text-xs">
                  <span className={`rounded px-2 py-1 ${item.status === "ongoing" ? "bg-green-500/20 text-green-400" : item.status === "finished" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {item.status === "ongoing" ? "Em andamento" : item.status === "finished" ? "Finalizado" : "Próximo"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setTeamsDialogId(item.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      title="Gerenciar Times"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDialog(item)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog para criar/editar campeonato */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Campeonato" : "Novo Campeonato"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do campeonato"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição"
              />
            </div>
            <div>
              <Label htmlFor="season">Temporada</Label>
              <Select value={formData.seasonId || undefined} onValueChange={(value) => setFormData({ ...formData, seasonId: value })}>
                <SelectTrigger id="season">
                  <SelectValue placeholder="Selecione a temporada" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map(season => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name} ({season.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Próximo</SelectItem>
                  <SelectItem value="ongoing">Em andamento</SelectItem>
                  <SelectItem value="finished">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para gerenciar times do campeonato */}
      <Dialog open={!!teamsDialogId} onOpenChange={(open) => { if (!open) setTeamsDialogId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Gerenciar Times — {items.find(i => i.id === teamsDialogId)?.name}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Selecione os times que participam deste campeonato. As classificações serão criadas automaticamente.
          </p>
          {teamsDialogId && <TeamManager championshipId={teamsDialogId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
