import { useState } from "react";
import { Match } from "@/types";
import { Plus, Pencil, Trash2, Award, CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMatches, useSaveMatchMutation, useDeleteMatch } from "@/hooks/useMatches";
import { useChampionships } from "@/hooks/useChampionships";
import { useTeams } from "@/hooks/useTeams";
import { usePlayers } from "@/hooks/usePlayersHook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * O backend usa LocalDateTime com @JsonFormat "yyyy-MM-dd'T'HH:mm:ss[.SSS]'Z'"
 * O 'Z' é literal — não é timezone. Precisamos tratar como hora local.
 */
function parseScheduledAt(iso: string): { date: Date; hour: number; minute: number } {
  // Remove trailing Z/z (literal, not timezone) and any milliseconds
  const clean = iso.replace(/\.?\d*[Zz]$/, "");
  // Parse as "YYYY-MM-DDTHH:mm:ss" → local time parts
  const parts = clean.split("T");
  const dateParts = parts[0].split("-");
  const timeParts = (parts[1] || "00:00:00").split(":");
  return {
    date: new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2])
    ),
    hour: parseInt(timeParts[0]) || 0,
    minute: parseInt(timeParts[1]) || 0,
  };
}

/** Formata para o padrão que o backend espera: "2026-04-28T17:30:00Z" (Z literal) */
function formatScheduledAt(date: Date, hour: number, minute: number): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}:00Z`;
}

/** Formata para exibição na tabela */
function displayScheduledAt(iso: string): string {
  const { date, hour, minute } = parseScheduledAt(iso);
  date.setHours(hour, minute);
  return format(date, "dd MMM, HH:mm", { locale: ptBR });
}

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
    scoreA: 0,
    scoreB: 0,
    mvpPlayerId: "",
    comment: "",
  });
  // Estado separado para data/hora — evita conversões de timezone
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState(20);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const handleOpenDialog = (item?: Match) => {
    if (item) {
      const parsed = parseScheduledAt(item.scheduledAt);
      setFormData({
        championshipId: item.championshipId,
        teamAId: item.teamAId,
        teamBId: item.teamBId,
        scoreA: item.scoreA,
        scoreB: item.scoreB,
        mvpPlayerId: item.mvpPlayerId || "",
        comment: item.comment || "",
      });
      setSelectedDate(parsed.date);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setEditingId(item.id);
    } else {
      setFormData({
        championshipId: "",
        teamAId: "",
        teamBId: "",
        scoreA: 0,
        scoreB: 0,
        mvpPlayerId: "",
        comment: "",
      });
      setSelectedDate(new Date());
      setSelectedHour(20);
      setSelectedMinute(0);
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.championshipId || !formData.teamAId || !formData.teamBId) return;
    
    await saveMutation.mutateAsync({
      id: editingId || undefined,
      data: {
        ...formData,
        scheduledAt: formatScheduledAt(selectedDate, selectedHour, selectedMinute),
      },
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
                    {displayScheduledAt(item.scheduledAt)}
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
              <Label>Data & Hora</Label>
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 mt-1.5">
                {/* Date Picker com Calendar Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(day) => {
                        if (day) setSelectedDate(day);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Hora */}
                <Select
                  value={String(selectedHour)}
                  onValueChange={(val) => setSelectedHour(parseInt(val))}
                >
                  <SelectTrigger className="w-[80px]">
                    <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {String(i).padStart(2, "0")}h
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>

                {/* Minuto */}
                <Select
                  value={String(selectedMinute)}
                  onValueChange={(val) => setSelectedMinute(parseInt(val))}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {String(m).padStart(2, "0")}min
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
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
