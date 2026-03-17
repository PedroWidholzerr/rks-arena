import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { championshipService } from "@/services/championships";
import { Championship } from "@/types";
import { useToast } from "@/hooks/use-toast";

const CHAMPIONSHIPS_QUERY_KEY = ["championships"];

export function useChampionships() {
  return useQuery({
    queryKey: CHAMPIONSHIPS_QUERY_KEY,
    queryFn: championshipService.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useChampionship(id: string) {
  return useQuery({
    queryKey: [...CHAMPIONSHIPS_QUERY_KEY, id],
    queryFn: () => championshipService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useChampionshipsBySeasonId(seasonId: string) {
  return useQuery({
    queryKey: [...CHAMPIONSHIPS_QUERY_KEY, "season", seasonId],
    queryFn: () => championshipService.getBySeasonId(seasonId),
    enabled: !!seasonId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateChampionship() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Championship, "id">) =>
      championshipService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAMPIONSHIPS_QUERY_KEY });
      toast({
        title: "Sucesso",
        description: "Campeonato criado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar campeonato",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateChampionship(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Championship>) =>
      championshipService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAMPIONSHIPS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...CHAMPIONSHIPS_QUERY_KEY, id] });
      toast({
        title: "Sucesso",
        description: "Campeonato atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar campeonato",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteChampionship() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => championshipService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAMPIONSHIPS_QUERY_KEY });
      toast({
        title: "Sucesso",
        description: "Campeonato deletado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar campeonato",
        variant: "destructive",
      });
    },
  });
}

export function useSaveChampionshipMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { id?: string; data: Omit<Championship, "id"> }) => {
      if (params.id) {
        return championshipService.update(params.id, params.data);
      } else {
        return championshipService.create(params.data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAMPIONSHIPS_QUERY_KEY });
      toast({
        title: "Sucesso",
        description: "Campeonato salvo com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar campeonato",
        variant: "destructive",
      });
    },
  });
}

export function useChampionshipTeamIds(championshipId: string) {
  return useQuery({
    queryKey: [...CHAMPIONSHIPS_QUERY_KEY, championshipId, "teams"],
    queryFn: () => championshipService.getTeamIds(championshipId),
    enabled: !!championshipId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSetChampionshipTeams() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: { championshipId: string; teamIds: string[] }) =>
      championshipService.setTeams(params.championshipId, params.teamIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...CHAMPIONSHIPS_QUERY_KEY, variables.championshipId, "teams"],
      });
      queryClient.invalidateQueries({ queryKey: ["standings"] });
      toast({
        title: "Sucesso",
        description: "Times do campeonato atualizados!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar times",
        variant: "destructive",
      });
    },
  });
}
