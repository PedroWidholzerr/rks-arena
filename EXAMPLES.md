# 💡 Exemplos Práticos - RKS Arena Frontend

Este documento contém exemplos práticos de como usar os serviços, hooks e componentes criados.

## 📝 Exemplo 1: Usar Autenticação

### Login
```typescript
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login("admin@example.com", "password");
      // Redirecionado automaticamente após sucesso
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? "Entrando..." : "Entrar"}
    </Button>
  );
}
```

### Verificar se usuário está autenticado
```typescript
import { useAuth } from "@/contexts/AuthContext";

export function MyComponent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <p>Faça login para continuar</p>;
  }

  return <p>Bem-vindo, {user?.name}!</p>;
}
```

---

## 📝 Exemplo 2: Listar Dados

### Listar times com loading e erro
```typescript
import { useTeams } from "@/hooks/useTeams";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamsList() {
  const { data: teams, isLoading, error } = useTeams();

  if (isLoading) {
    return <Skeleton className="w-full h-64" />;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Erro ao carregar times: {error.message}
      </div>
    );
  }

  return (
    <ul>
      {teams?.map((team) => (
        <li key={team.id}>{team.name} ({team.tag})</li>
      ))}
    </ul>
  );
}
```

### Listar campeonatos de uma temporada específica
```typescript
import { useChampionshipsBySeasonId } from "@/hooks/useChampionships";

export function SeasonChampionships({ seasonId }: { seasonId: string }) {
  const { data: championships, isLoading } = useChampionshipsBySeasonId(seasonId);

  if (isLoading) return <p>Carregando campeonatos...</p>;

  return (
    <ul>
      {championships?.map((champ) => (
        <li key={champ.id}>{champ.name}</li>
      ))}
    </ul>
  );
}
```

---

## 📝 Exemplo 3: Criar Dados

### Criar um novo time
```typescript
import { useCreateTeam } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function CreateTeamForm() {
  const mutation = useCreateTeam();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mutation automaticamente:
    // 1. Valida dados
    // 2. Envia POST /api/teams
    // 3. Mostra toast de sucesso
    // 4. Invalida cache de teams
    // 5. Recarrega lista
    await mutation.mutateAsync({
      name,
      tag: tag.toUpperCase(),
      description: "Descrição do time"
    });

    setName("");
    setTag("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        placeholder="Nome do time"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={mutation.isPending}
      />
      <Input
        placeholder="TAG"
        value={tag}
        onChange={(e) => setTag(e.target.value.toUpperCase())}
        disabled={mutation.isPending}
        maxLength={4}
      />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Criando..." : "Criar Time"}
      </Button>
    </form>
  );
}
```

---

## 📝 Exemplo 4: Atualizar Dados

### Atualizar um time
```typescript
import { useUpdateTeam } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export function EditTeamForm({ teamId }: { teamId: string }) {
  const mutation = useUpdateTeam(teamId);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await mutation.mutateAsync({
      name,
      // Outros campos opcionais
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={mutation.isPending}
      />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Salvando..." : "Atualizar"}
      </Button>
    </form>
  );
}
```

---

## 📝 Exemplo 5: Deletar Dados

### Deletar um time com confirmação
```typescript
import { useDeleteTeam } from "@/hooks/useTeams";
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
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function DeleteTeamButton({ teamId, teamName }: { 
  teamId: string; 
  teamName: string 
}) {
  const mutation = useDeleteTeam();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await mutation.mutateAsync(teamId);
    setOpen(false);
  };

  return (
    <>
      <Button 
        variant="destructive" 
        onClick={() => setOpen(true)}
      >
        Deletar
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Time?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja deletar "{teamName}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

---

## 📝 Exemplo 6: Upload de Arquivo

### Upload de logo do time
```typescript
import { useUploadTeamLogo } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function UploadTeamLogo({ teamId }: { teamId: string }) {
  const mutation = useUploadTeamLogo();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    await mutation.mutateAsync({
      id: teamId,
      file: selectedFile
    });

    setSelectedFile(null);
  };

  return (
    <div>
      <Input 
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
        disabled={mutation.isPending}
      />
      <Button 
        onClick={handleSubmit} 
        disabled={!selectedFile || mutation.isPending}
      >
        {mutation.isPending ? "Enviando..." : "Enviar Logo"}
      </Button>
    </div>
  );
}
```

---

## 📝 Exemplo 7: Filtrar e Buscar

### Buscar jogadores de um time
```typescript
import { usePlayersByTeamId } from "@/hooks/usePlayersHook";

export function TeamPlayers({ teamId }: { teamId: string }) {
  // O hook automaticamente:
  // 1. Espera o teamId estar definido
  // 2. Busca da API com cache
  // 3. Refetcha se teamId mudar
  const { data: players, isLoading } = usePlayersByTeamId(teamId);

  if (isLoading) return <p>Carregando jogadores...</p>;

  return (
    <div>
      {players?.map((player) => (
        <div key={player.id}>
          <p>{player.nickname} ({player.tag})</p>
          {player.isCaptain && <span>⭐ Capitão</span>}
        </div>
      ))}
    </div>
  );
}
```

---

## 📝 Exemplo 8: Múltiplas Requisições

### Carregar dados relacionados
```typescript
import { useChampionship } from "@/hooks/useChampionships";
import { useMatchesByChampionshipId } from "@/hooks/useMatches";
import { useStandingsByChampionshipId } from "@/hooks/useStandings";

export function ChampionshipDashboard({ 
  championshipId 
}: { 
  championshipId: string 
}) {
  // React Query automaticamente faz batching de requisições
  const championship = useChampionship(championshipId);
  const matches = useMatchesByChampionshipId(championshipId);
  const standings = useStandingsByChampionshipId(championshipId);

  const isLoading = championship.isLoading || 
                    matches.isLoading || 
                    standings.isLoading;

  if (isLoading) return <p>Carregando...</p>;

  return (
    <div>
      <h1>{championship.data?.name}</h1>
      <h2>Classificação ({standings.data?.length})</h2>
      <h2>Partidas ({matches.data?.length})</h2>
    </div>
  );
}
```

---

## 📝 Exemplo 9: Com Tratamento de Erro

### Componente robusto com erro handling
```typescript
import { useTeams } from "@/hooks/useTeams";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RobustTeamsList() {
  const { data: teams, isLoading, error } = useTeams();

  if (isLoading) {
    return <p>Carregando times...</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Não foi possível carregar os times. 
          Tente novamente mais tarde.
          {process.env.NODE_ENV === 'development' && 
            ` (${error.message})`
          }
        </AlertDescription>
      </Alert>
    );
  }

  if (!teams || teams.length === 0) {
    return <p>Nenhum time cadastrado</p>;
  }

  return (
    <ul>
      {teams.map((team) => (
        <li key={team.id}>{team.name}</li>
      ))}
    </ul>
  );
}
```

---

## 📝 Exemplo 10: Rota Protegida

### Usando ProtectedRoute
```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";

// No App.tsx, já criado mas aqui está o exemplo:

<Route
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/teams" element={<ManageTeams />} />
</Route>
```

---

## 🔄 Exemplo 11: Refetch Manual

### Forçar atualização de dados
```typescript
import { useTeams } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function TeamsList() {
  const { data: teams, refetch, isFetching } = useTeams();

  return (
    <div>
      <button 
        onClick={() => refetch()}
        disabled={isFetching}
      >
        <RefreshCw className="h-4 w-4" />
      </button>
      
      <ul>
        {teams?.map((team) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🎯 Resumo de Padrões

### Pattern: CRUD Simples
```typescript
// 1. Obter dados
const { data, isLoading } = useItems();

// 2. Criar
const createMutation = useCreateItem();
await createMutation.mutateAsync(data);

// 3. Atualizar
const updateMutation = useUpdateItem(id);
await updateMutation.mutateAsync(newData);

// 4. Deletar
const deleteMutation = useDeleteItem();
await deleteMutation.mutateAsync(id);
```

### Pattern: Com Estados
```typescript
const { data, isLoading, error } = useItems();

if (isLoading) return <Loading />;
if (error) return <Error error={error} />;
if (!data) return <Empty />;

return <ResultList data={data} />;
```

### Pattern: Mutation com Confirmação
```typescript
const [isOpen, setIsOpen] = useState(false);
const mutation = useDeleteItem();

const handleConfirm = async () => {
  await mutation.mutateAsync(id);
  setIsOpen(false);
};

return (
  <AlertDialog>
    <Button onClick={() => setIsOpen(true)}>Deletar</Button>
    <AlertDialogContent>
      <AlertDialogAction onClick={handleConfirm}>
        Confirmar
      </AlertDialogAction>
    </AlertDialogContent>
  </AlertDialog>
);
```

---

Estes exemplos cobrem 90% do que você precisará fazer! 🚀
