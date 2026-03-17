import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { seasonService } from "@/services/seasons";
import { Season } from "@/types";
import { useToast } from "@/hooks/use-toast";

const SEASONS_QUERY_KEY = ["seasons"];

export function useSeasons() {
  return useQuery({
    queryKey: SEASONS_QUERY_KEY,
    queryFn: seasonService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSeason(id: string) {
  return useQuery({
    queryKey: [...SEASONS_QUERY_KEY, id],
    queryFn: () => seasonService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSeason() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Season, "id">) => seasonService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEASONS_QUERY_KEY });
      toast({
        title: "Sucesso",
        description: "Temporada criada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar temporada",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSeason(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Season>) => seasonService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEASONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...SEASONS_QUERY_KEY, id] });
      toast({
        title: "Sucesso",
        description: "Temporada atualizada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar temporada",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteSeason() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => seasonService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEASONS_QUERY_KEY });
      toast({
        title: "Sucesso",
        description: "Temporada deletada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar temporada",
        variant: "destructive",
      });
    },
  });
}

export function useSaveSeasonMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { id?: string; data: Omit<Season, "id"> }) => {
      if (params.id) {
        return seasonService.update(params.id, params.data);
      } else {
        return seasonService.create(params.data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEASONS_QUERY_KEY });
      toast({
        title: "Sucesso",
        description: "Temporada salva com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar temporada",
        variant: "destructive",
      });
    },
  });
}
