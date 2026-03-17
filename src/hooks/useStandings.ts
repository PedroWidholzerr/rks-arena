import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { standingsService } from "@/services/standings";
import { ChampionshipTeam } from "@/types";
import { useToast } from "@/hooks/use-toast";

const STANDINGS_QUERY_KEY = ["standings"];

export function useStandingsByChampionshipId(championshipId: string) {
  return useQuery({
    queryKey: [...STANDINGS_QUERY_KEY, championshipId],
    queryFn: () => standingsService.getByChampionshipId(championshipId),
    enabled: !!championshipId,
    staleTime: 1000 * 60 * 2, // Atualizar más frequentemente
  });
}

export function useStanding(id: string) {
  return useQuery({
    queryKey: [...STANDINGS_QUERY_KEY, id],
    queryFn: () => standingsService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateStanding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<ChampionshipTeam, "id">) =>
      standingsService.create(data),
    onSuccess: (newStanding) => {
      queryClient.invalidateQueries({
        queryKey: [...STANDINGS_QUERY_KEY, newStanding.championshipId],
      });
      toast({
        title: "Sucesso",
        description: "Classificação criada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar classificação",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateStanding(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<ChampionshipTeam>) =>
      standingsService.update(id, data),
    onSuccess: (updatedStanding) => {
      queryClient.invalidateQueries({
        queryKey: [...STANDINGS_QUERY_KEY, updatedStanding.championshipId],
      });
      queryClient.invalidateQueries({ queryKey: [...STANDINGS_QUERY_KEY, id] });
      toast({
        title: "Sucesso",
        description: "Classificação atualizada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar classificação",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteStanding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => standingsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STANDINGS_QUERY_KEY });
      toast({
        title: "Sucesso",
        description: "Classificação deletada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar classificação",
        variant: "destructive",
      });
    },
  });
}
