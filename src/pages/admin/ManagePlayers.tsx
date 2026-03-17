import { useState } from "react";
import { Player } from "@/types";
import { Plus, Pencil, Trash2, Crown } from "lucide-react";
import { usePlayers, useSavePlayerMutation, useDeletePlayer } from "@/hooks/usePlayersHook";
import { useTeams } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ManagePlayers() {
  const { data: items = [], isLoading } = usePlayers();
  const { data: teams = [] } = useTeams();
  const saveMutation = useSavePlayerMutation();
  const deleteMutation = useDeletePlayer();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nickname: "",
    tag: "",
    teamId: teams[0]?.id || "",
    isCaptain: false,
    notes: "",
  });

  const handleOpenDialog = (item?: Player) => {
    if (item) {
      // Não passar 'id' para o formData e garantir que 'notes' sempre exista
      const { id, notes, ...rest } = item;
      setFormData({
        ...rest,
        notes: notes ?? ""
      });
      setEditingId(item.id);
    } else {
      setFormData({
        nickname: "",
        tag: "",
        teamId: teams[0]?.id || "",
        isCaptain: false,
        notes: "",
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.nickname.trim() || !formData.tag.trim()) return;
    
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
        <h1 className="font-display text-3xl font-bold uppercase tracking-tighter text-foreground">Jogadores</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" /> Novo Jogador
        </button>
      </div>

      <div className="esports-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Apelido</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Tag</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Time</th>
              <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">Papel</th>
              <th className="px-4 py-3 text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const team = teams.find(t => t.id === item.teamId);
              return (
                <tr key={item.id} className="h-12 border-b border-border last:border-0 hover:bg-[hsl(0_0%_100%/0.03)]">
                  <td className="px-4 py-2 font-display text-sm font-semibold text-foreground">{item.nickname}</td>
                  <td className="px-4 py-2"><span className="tag-badge">{item.tag}</span></td>
                  <td className="px-4 py-2 font-mono text-sm text-muted-foreground">{team?.name}</td>
                  <td className="px-4 py-2">
                    {item.isCaptain && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Crown className="h-3 w-3" /> Capitão
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Jogador" : "Novo Jogador"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nickname">Nick</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="Nick do jogador"
              />
            </div>
            <div>
              <Label htmlFor="tag">Tag</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="Tag do jogador"
              />
            </div>
            <div>
              <Label htmlFor="team">Time</Label>
              <Select value={formData.teamId || undefined} onValueChange={(value) => setFormData({ ...formData, teamId: value })}>
                <SelectTrigger id="team">
                  <SelectValue placeholder="Selecione o time" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas opcionais"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="captain"
                checked={formData.isCaptain}
                onCheckedChange={(checked) => setFormData({ ...formData, isCaptain: checked as boolean })}
              />
              <Label htmlFor="captain" className="cursor-pointer">É Capitão?</Label>
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
