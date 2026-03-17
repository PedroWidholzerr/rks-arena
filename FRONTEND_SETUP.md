# RKS Arena - Frontend Setup Guide

Este documento descreve a estrutura criada para conectar o frontend React a uma API Java backend.

## 📁 Estrutura de Arquivos

### Serviços (`src/services/`)
Os serviços são responsáveis por fazer requisições HTTP para a API backend.

- **`api-client.ts`** - Cliente HTTP reutilizável com autenticação automática
- **`auth.ts`** - Serviços de autenticação (login, register, refresh token)
- **`seasons.ts`** - CRUD para temporadas
- **`championships.ts`** - CRUD para campeonatos
- **`teams.ts`** - CRUD para times
- **`players.ts`** - CRUD para jogadores
- **`matches.ts`** - CRUD para partidas
- **`standings.ts`** - Endpoints para classificações

### Contextos (`src/contexts/`)
- **`AuthContext.tsx`** - Context React para autenticação global

### Hooks Customizados (`src/hooks/`)
Hooks que usam React Query para caching e sincronização com a API.

- **`useSeasons.ts`** - Operações com temporadas
- **`useChampionships.ts`** - Operações com campeonatos
- **`useTeams.ts`** - Operações com times (+ upload de logo)
- **`usePlayersHook.ts`** - Operações com jogadores
- **`useMatches.ts`** - Operações com partidas
- **`useStandings.ts`** - Operações com classificações

### Componentes (`src/components/`)
- **`ProtectedRoute.tsx`** - Wrapper para rotas que requerem autenticação

### Páginas (`src/pages/`)
- **`LoginPage.tsx`** - Página de login do admin
- **`admin/*`** - Páginas de gerenciamento (já com exemplo melhorado em `ManageTeams.tsx`)

## 🔧 Como Usar

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
REACT_APP_API_URL=http://localhost:8080/api
```

### 2. Usar Hooks nos Componentes

Os hooks React Query já possuem tratamento automático de erros e notificações (toasts).

#### Exemplo: Listar dados
```tsx
import { useTeams } from "@/hooks/useTeams";

function MyComponent() {
  const { data: teams, isLoading, error } = useTeams();

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar</p>;

  return (
    <ul>
      {teams?.map(team => (
        <li key={team.id}>{team.name}</li>
      ))}
    </ul>
  );
}
```

#### Exemplo: Criar novo item
```tsx
import { useCreateTeam } from "@/hooks/useTeams";

function CreateTeamForm() {
  const mutation = useCreateTeam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutation.mutateAsync({
      name: "New Team",
      tag: "NEW",
      description: "..."
    });
    // automáticamente: notificação, invalidação de cache, etc.
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* formulário */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
```

### 3. Autenticação

O contexto `AuthContext` fornece hook `useAuth()`:

```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <>
          <p>Bem-vindo, {user?.name}!</p>
          <button onClick={logout}>Sair</button>
        </>
      ) : (
        <p>Faça login para continuar</p>
      )}
    </>
  );
}
```

### 4. Melhorar Componentes Admin (Padrão)

O arquivo `ManageTeams.tsx` foi atualizado como exemplo. Siga o mesmo padrão para os outros:

**O que foi melhorado:**
- ✅ Uso de React Query para dados reais
- ✅ Dialog para criar/editar
- ✅ Confirmação para deletar
- ✅ Estados de loading e erro
- ✅ Validação básica de campos
- ✅ Notificações automáticas de sucesso/erro

**Para aplicar o mesmo padrão:**

1. Copie o padrão do `ManageTeams.tsx`
2. Substitua os imports de hooks (ex: `useTeams` → `useChampionships`)
3. Ajuste o tipo de dados (ex: `Team` → `Championship`)
4. Adapte os campos do formulário

## 🔌 Integrando com a API Java

### Requisitos Mínimos
O backend deve implementar os endpoints listados em [API_ENDPOINTS.md](./API_ENDPOINTS.md)

### Configuração CORS
O backend deve aceitar requisições do frontend:

**Spring Boot exemplo:**
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

### Token JWT
O frontend envia o token no header:
```
Authorization: Bearer {token}
```

O backend deve validar e retornar:
- ✅ 200 se válido
- ❌ 401 se inválido/expirado

## 🚀 Próximos Passos

### Para você (Frontend)
- [ ] Instalar/executar o projeto: `npm install && npm run dev`
- [ ] Testar com API mockada (atual) antes de conectar ao Java
- [ ] Implementar padrão `ManageTeams` nos outros `Manage*.tsx`
- [ ] Adicionar validações de formulário (useForm de `@hookform/resolvers`)

### Para o Backend Java
- [ ] Implementar autenticação JWT
- [ ] Implementar endpoints listados em `API_ENDPOINTS.md`
- [ ] Configurar CORS
- [ ] Implementar validações
- [ ] Setup do banco de dados (PostgreSQL recomendado)

## 📚 Recursos

- [React Query Docs](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [JWT Introduction](https://jwt.io/introduction)

## 🐛 Troubleshooting

### "401 Unauthorized"
- Verificar se o token está sendo salvo em localStorage
- Confirmar autenticação no backend

### CORS Error
- Backend não está configurado para aceitar requisições do frontend
- Verificar endereço do frontend em CORS config

### Hooks não funcionam
- Garantir que o componente está dentro de `<QueryClientProvider>`
- Verificar se `API_BASE_URL` está correta

## 📧 Suporte

Para dúvidas sobre a estrutura criada, refira-se a este documento e ao código comentado em cada serviço e hook.
