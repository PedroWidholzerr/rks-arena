import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamService } from "@/services/teams";
import { Team } from "@/types";
import { useToast } from "@/hooks/use-toast";

const TEAMS_QUERY_KEY = ["teams"];

export function useTeams() {
  return useQuery({
    queryKey: TEAMS_QUERY_KEY,
    queryFn: teamService.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: [...TEAMS_QUERY_KEY, id],
    queryFn: () => teamService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Team, "id">) => teamService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
      toast({
        title: "Sucesso",
        description: "Time criado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar time",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTeam(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Team>) => teamService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TEAMS_QUERY_KEY, id] });
      toast({
        title: "Sucesso",
        description: "Time atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar time",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
      toast({
        title: "Sucesso",
        description: "Time deletado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar time",
        variant: "destructive",
      });
    },
  });
}

export function useUploadTeamLogo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      teamService.uploadLogo(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TEAMS_QUERY_KEY, id] });
      toast({
        title: "Sucesso",
        description: "Logo enviada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar logo",
        variant: "destructive",
      });
    },
  });
}
