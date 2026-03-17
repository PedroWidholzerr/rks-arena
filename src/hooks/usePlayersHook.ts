import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playerService } from "@/services/players";
import { Player } from "@/types";
import { useToast } from "@/hooks/use-toast";

const PLAYERS_QUERY_KEY = ["players"];

export function usePlayers() {
  return useQuery({
    queryKey: PLAYERS_QUERY_KEY,
    queryFn: playerService.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: [...PLAYERS_QUERY_KEY, id],
    queryFn: () => playerService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePlayersByTeamId(teamId: string) {
  return useQuery({
    queryKey: [...PLAYERS_QUERY_KEY, "team", teamId],
    queryFn: () => playerService.getByTeamId(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Player, "id">) => playerService.create(data),
    onSuccess: (newPlayer) => {
      queryClient.invalidateQueries({ queryKey: PLAYERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PLAYERS_QUERY_KEY, "team", newPlayer.teamId],
      });
      toast({
        title: "Sucesso",
        description: "Jogador criado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar jogador",
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePlayer(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Player>) => playerService.update(id, data),
    onSuccess: (updatedPlayer) => {
      queryClient.invalidateQueries({ queryKey: PLAYERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PLAYERS_QUERY_KEY, id] });
      queryClient.invalidateQueries({
        queryKey: [...PLAYERS_QUERY_KEY, "team", updatedPlayer.teamId],
      });
      toast({
        title: "Sucesso",
        description: "Jogador atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar jogador",
        variant: "destructive",
      });
    },
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => playerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYERS_QUERY_KEY });
      toast({
        title: "Sucesso",
        description: "Jogador deletado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar jogador",
        variant: "destructive",
      });
    },
  });
}

export function useSavePlayerMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { id?: string; data: Omit<Player, "id"> }) => {
      if (params.id) {
        return playerService.update(params.id, params.data);
      } else {
        return playerService.create(params.data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYERS_QUERY_KEY });
      toast({
        title: "Sucesso",
        description: "Jogador salvo com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar jogador",
        variant: "destructive",
      });
    },
  });
}
