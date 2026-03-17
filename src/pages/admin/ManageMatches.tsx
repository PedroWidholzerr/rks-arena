import { useState } from "react";
import { Match } from "@/types";
import { Plus, Pencil, Trash2, Award } from "lucide-react";
import { format } from "date-fns";
import { useMatches, useSaveMatchMutation, useDeleteMatch } from "@/hooks/useMatches";
import { useChampionships } from "@/hooks/useChampionships";
import { useTeams } from "@/hooks/useTeams";
import { usePlayers } from "@/hooks/usePlayersHook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ManageMatches() {
  const { data: items = [], isLoading } = useMatches();
  const { data: championships = [] } = useChampionships();
  const { data: teams = [] } = useTeams();
  const { data: players = [] } = usePlayers();
  const saveMutation = useSaveMatchMutation();
  const deleteMutation = useDeleteMatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    championshipId: "",
    teamAId: "",
    teamBId: "",
    scheduledAt: new Date().toISOString(),
    scoreA: 0,
    scoreB: 0,
    mvpPlayerId: "",
    comment: "",
  });

  const handleOpenDialog = (item?: Match) => {
    if (item) {
      setFormData({
        championshipId: item.championshipId,
        teamAId: item.teamAId,
        teamBId: item.teamBId,
        scheduledAt: item.scheduledAt,
        scoreA: item.scoreA,
        scoreB: item.scoreB,
        mvpPlayerId: item.mvpPlayerId || "",
        comment: item.comment || "",
      });
      setEditingId(item.id);
    } else {
      setFormData({
        championshipId: "",
        teamAId: "",
        teamBId: "",
        scheduledAt: new Date().toISOString(),
        scoreA: 0,
        scoreB: 0,
        mvpPlayerId: "",
        comment: "",
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.championshipId || !formData.teamAId || !formData.teamBId) return;
    
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
        <h1 className="font-display text-3xl font-bold uppercase tracking-tighter text-foreground">Partidas</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" /> Nova Partida
        </button>
      </div>

      <div className="esports-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Campeonato</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Partida</th>
              <th className="px-4 py-3 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">Placar</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Data</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">MVP</th>
              <th className="px-4 py-3 text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const teamA = teams.find(t => t.id === item.teamAId);
              const teamB = teams.find(t => t.id === item.teamBId);
              const champ = championships.find(c => c.id === item.championshipId);
              const mvp = item.mvpPlayerId ? players.find(p => p.id === item.mvpPlayerId) : null;
              const isPlayed = item.scoreA > 0 || item.scoreB > 0;
              return (
                <tr key={item.id} className="h-12 border-b border-border last:border-0 hover:bg-[hsl(0_0%_100%/0.03)]">
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{champ?.name}</td>
                  <td className="px-4 py-2">
                    <span className="font-display text-sm text-foreground">{teamA?.tag}</span>
                    <span className="text-muted-foreground mx-1">vs</span>
                    <span className="font-display text-sm text-foreground">{teamB?.tag}</span>
                  </td>
                  <td className="px-4 py-2 text-center font-mono text-sm">
                    {isPlayed ? (
                      <>
                        <span className={item.scoreA > item.scoreB ? "text-green-400" : "text-red-400"}>{item.scoreA}</span>
                        <span className="text-muted-foreground mx-1">-</span>
                        <span className={item.scoreB > item.scoreA ? "text-green-400" : "text-red-400"}>{item.scoreB}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                    {format(new Date(item.scheduledAt), "MMM dd, HH:mm")}
                  </td>
                  <td className="px-4 py-2">
                    {mvp && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Award className="h-3 w-3" /> {mvp.nickname}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
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
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Partida" : "Nova Partida"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="championship">Campeonato</Label>
              <Select value={formData.championshipId || undefined} onValueChange={(value) => setFormData({ ...formData, championshipId: value })}>
                <SelectTrigger id="championship">
                  <SelectValue placeholder="Selecione o campeonato" />
                </SelectTrigger>
                <SelectContent>
                  {championships.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamA">Time A</Label>
                <Select value={formData.teamAId || undefined} onValueChange={(value) => setFormData({ ...formData, teamAId: value })}>
                  <SelectTrigger id="teamA">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teamB">Time B</Label>
                <Select value={formData.teamBId || undefined} onValueChange={(value) => setFormData({ ...formData, teamBId: value })}>
                  <SelectTrigger id="teamB">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scoreA">Placar A</Label>
                <Input
                  id="scoreA"
                  type="number"
                  value={formData.scoreA}
                  onChange={(e) => setFormData({ ...formData, scoreA: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="scoreB">Placar B</Label>
                <Input
                  id="scoreB"
                  type="number"
                  value={formData.scoreB}
                  onChange={(e) => setFormData({ ...formData, scoreB: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="scheduledAt">Data & Hora</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt.slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, scheduledAt: new Date(e.target.value).toISOString() })}
              />
            </div>
            <div>
              <Label htmlFor="mvp">Jogador MVP</Label>
              <Select value={formData.mvpPlayerId || "__none__"} onValueChange={(value) => setFormData({ ...formData, mvpPlayerId: value === "__none__" ? "" : value })}>
                <SelectTrigger id="mvp">
                  <SelectValue placeholder="Selecione MVP (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhum</SelectItem>
                  {players.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nickname}
                    </SelectItem>
                  ))}
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
    </div>
  );
}
