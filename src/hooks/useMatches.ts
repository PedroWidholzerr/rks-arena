import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchService } from "@/services/matches";
import { Match } from "@/types";
import { useToast } from "@/hooks/use-toast";

const MATCHES_QUERY_KEY = ["matches"];

export function useMatches() {
  return useQuery({
    queryKey: MATCHES_QUERY_KEY,
    queryFn: matchService.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: [...MATCHES_QUERY_KEY, id],
    queryFn: () => matchService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMatchesByChampionshipId(championshipId: string) {
  return useQuery({
    queryKey: [...MATCHES_QUERY_KEY, "championship", championshipId],
    queryFn: () => matchService.getByChampionshipId(championshipId),
    enabled: !!championshipId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMatchesByTeamId(teamId: string) {
  return useQuery({
    queryKey: [...MATCHES_QUERY_KEY, "team", teamId],
    queryFn: () => matchService.getByTeamId(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Match, "id">) => matchService.create(data),
    onSuccess: (newMatch) => {
      queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...MATCHES_QUERY_KEY, "championship", newMatch.championshipId],
      });
      toast({
        title: "Sucesso",
        description: "Partida criada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar partida",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMatch(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Match>) => matchService.update(id, data),
    onSuccess: (updatedMatch) => {
      queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...MATCHES_QUERY_KEY, id] });
      queryClient.invalidateQueries({
        queryKey: [...MATCHES_QUERY_KEY, "championship", updatedMatch.championshipId],
      });
      toast({
        title: "Sucesso",
        description: "Partida atualizada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar partida",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => matchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["standings"] });
      toast({
        title: "Sucesso",
        description: "Partida deletada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar partida",
        variant: "destructive",
      });
    },
  });
}

export function useSaveMatchMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { id?: string; data: Omit<Match, "id"> }) => {
      if (params.id) {
        return matchService.update(params.id, params.data);
      } else {
        return matchService.create(params.data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["standings"] });
      toast({
        title: "Sucesso",
        description: "Partida salva com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar partida",
        variant: "destructive",
      });
    },
  });
}
