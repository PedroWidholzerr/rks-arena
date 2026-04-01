import { useState } from "react";
import { Team } from "@/types";
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam, useUploadTeamLogo } from "@/hooks/useTeams";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeamLogo } from "@/components/teams/TeamCard";
import { resolveTeamLogoUrl } from "@/services/teams";


interface TeamFormData {
  name: string;
  tag: string;
  description: string;
  logoUrl?: string;
}

const initialFormData: TeamFormData = {
  name: "",
  tag: "",
  description: "",
  logoUrl: undefined,
};

export default function ManageTeams() {
  const { data: teams = [], isLoading } = useTeams();
  const createMutation = useCreateTeam();
  const deleteMutation = useDeleteTeam();
  const uploadLogoMutation = useUploadTeamLogo();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>(initialFormData);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const isEditing = selectedTeam !== null;
  // O hook de update não deve ser condicional
  const updateMutation = useUpdateTeam(selectedTeam?.id || "");
  const isSubmitting = createMutation.isPending || updateMutation.isPending || uploadLogoMutation.isPending || logoUploading;

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setSelectedTeam(team);
      setFormData({
        name: team.name || "",
        tag: team.tag || "",
        description: team.description || "",
        logoUrl: team.logoUrl,
      });
      setLogoFile(null);
    } else {
      setSelectedTeam(null);
      setFormData(initialFormData);
      setLogoFile(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTeam(null);
    setFormData(initialFormData);
    setLogoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.tag.trim()) {
      return;
    }
    let team: Team | undefined;
    if (isEditing && selectedTeam) {
      team = await updateMutation.mutateAsync(formData);
    } else {
      team = await createMutation.mutateAsync(formData);
    }
    // Upload do logo se houver arquivo selecionado
    if (team && logoFile) {
      setLogoUploading(true);
      try {
        const updatedTeam = await uploadLogoMutation.mutateAsync({ id: team.id, file: logoFile });
        team = updatedTeam;
        setFormData((current) => ({ ...current, logoUrl: updatedTeam.logoUrl }));
      } catch (err) {
        // Erro tratado pelo hook
      }
      setLogoUploading(false);
    }
    handleCloseDialog();
  };

  const handleDelete = async () => {
    if (selectedTeam) {
      await deleteMutation.mutateAsync(selectedTeam.id);
      setIsDeleteDialogOpen(false);
      setSelectedTeam(null);
    }
  };

  const handleOpenDeleteDialog = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tighter text-foreground">Times</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" /> Novo Time
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando times...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum time encontrado</p>
        </div>
      ) : (
        <div className="esports-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Time
                </th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Tag
                </th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Descrição
                </th>
                <th className="px-4 py-3 text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr
                  key={team.id}
                  className="h-12 border-b border-border last:border-0 hover:bg-[hsl(0_0%_100%/0.03)]"
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <TeamLogo team={team} size="sm" />
                      <span className="font-display text-sm font-semibold text-foreground">
                        {team.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="tag-badge">{team.tag}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-muted-foreground truncate max-w-xs">
                    {team.description}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(team)}
                        className="p-1.5"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDeleteDialog(team)}
                        className="p-1.5 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Time" : "Criar Novo Time"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Atualizar informações do time" : "Adicionar novo time ao sistema"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Time *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Shadow Wolves"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <Label htmlFor="tag">Tag do Time *</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) =>
                  setFormData({ ...formData, tag: e.target.value.toUpperCase() })
                }
                placeholder="SHW"
                maxLength={4}
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição do time"
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo do Time</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setLogoFile(e.target.files[0]);
                  } else {
                    setLogoFile(null);
                  }
                }}
                disabled={isSubmitting}
              />
              {formData.logoUrl && !logoFile && (
                <div className="mt-2">
                  <img src={resolveTeamLogoUrl(formData.logoUrl)} alt="Logo atual" className="h-16 rounded" />
                  <div className="text-xs text-muted-foreground">Logo atual</div>
                </div>
              )}
              {logoFile && (
                <div className="mt-2">
                  <img src={URL.createObjectURL(logoFile)} alt="Prévia do logo" className="h-16 rounded" />
                  <div className="text-xs text-muted-foreground">Prévia do novo logo</div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Time</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar "{selectedTeam?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
