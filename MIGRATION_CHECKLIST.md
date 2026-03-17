# 🛠️ Admin Components - Migration Checklist

Este checklist ajuda você a aplicar o novo padrão de CRUD aos componentes admin restantes.

## ✅ Componentes Melhorados

- [x] **ManageTeams.tsx** - Exemplo completo implementado

## ⏳ Próximos Componentes

### 1. ManageSeasons.tsx
- [ ] Importar hooks: `useSeasons`, `useCreateSeason`, `useUpdateSeason`, `useDeleteSeason`
- [ ] Remover import de mockData
- [ ] Implementar Dialog para criar/editar
- [ ] Implementar AlertDialog para confirmar delete
- [ ] Remover useState de items mockados
- [ ] Adicionar useSeasons() para buscar dados reais
- [ ] Adaptar formulário com campos: name, year

**Campos do formulário:**
```typescript
interface SeasonFormData {
  name: string;
  year: number;
}
```

### 2. ManageChampionships.tsx
- [ ] Importar hooks: `useChampionships`, `useCreateChampionship`, `useUpdateChampionship`, `useDeleteChampionship`, `useSeasons`
- [ ] Remover import de mockData
- [ ] Implementar Dialog para criar/editar
- [ ] Implementar AlertDialog para confirmar delete
- [ ] Adicionar Select para escolher Season
- [ ] Adicionar Select para escolher Status (upcoming, ongoing, finished)
- [ ] Adaptar formulário

**Campos do formulário:**
```typescript
interface ChampionshipFormData {
  name: string;
  description: string;
  seasonId: string;
  status: "upcoming" | "ongoing" | "finished";
}
```

**Componentes UI necessários:**
- `@/components/ui/select` (já instalado)

### 3. ManagePlayers.tsx
- [ ] Importar hooks: `usePlayers`, `useCreatePlayer`, `useUpdatePlayer`, `useDeletePlayers`, `useTeams`
- [ ] Remover import de mockData
- [ ] Implementar Dialog para criar/editar
- [ ] Implementar AlertDialog para confirmar delete
- [ ] Adicionar Select para escolher Team
- [ ] Adicionar Checkbox para isCaptain
- [ ] Adaptar formulário

**Campos do formulário:**
```typescript
interface PlayerFormData {
  nickname: string;
  tag: string;
  teamId: string;
  isCaptain: boolean;
  notes?: string;
}
```

**Comportamento especial:**
- Tag deve ser uppercased automaticamente
- Buscar times com `useTeams()`

### 4. ManageMatches.tsx
- [ ] Importar hooks: `useMatches`, `useCreateMatch`, `useUpdateMatch`, `useDeleteMatch`, `useChampionships`, `useTeams`, `usePlayers`
- [ ] Remover import de mockData
- [ ] Implementar Dialog para criar/editar
- [ ] Implementar AlertDialog para confirmar delete
- [ ] Adicionar Selects para: Championship, TeamA, TeamB, MVP Player
- [ ] Adicionar Input de data/hora (scheduledAt)
- [ ] Adicionar Inputs numéricos para scores
- [ ] Adicionar Textarea para comment

**Campos do formulário:**
```typescript
interface MatchFormData {
  championshipId: string;
  teamAId: string;
  teamBId: string;
  scheduledAt: string; // ISO 8601
  scoreA: number;
  scoreB: number;
  mvpPlayerId?: string;
  comment?: string;
}
```

**Validações especiais:**
- Não permitir teamA === teamB
- scheduledAt deve ser data válida
- Scores não podem ser negativos

### 5. ManageChampionships (Advanced Features)
Se implementar após as anteriores:

- [ ] Adicionar feature de "Add teams to championship"
- [ ] Mostrar tabela de times participantes
- [ ] Permitir remover times

## 🔄 Padrão a Seguir

Copie este template para cada componente:

```tsx
import { useState } from "react";
import { YourType } from "@/types";
import { 
  useYourItems, 
  useCreateYourItem, 
  useUpdateYourItem, 
  useDeleteYourItem 
} from "@/hooks/useYourItems";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, /* ... */ } from "@/components/ui/dialog";
import { AlertDialog, /* ... */ } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  // seus campos aqui
}

const initialFormData: FormData = {
  // valores iniciais
};

export default function ManageYourItems() {
  const { data: items = [], isLoading } = useYourItems();
  const createMutation = useCreateYourItem();
  const deleteMutation = useDeleteYourItem();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<YourType | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const isEditing = selectedItem !== null;
  const updateMutation = isEditing ? useUpdateYourItem(selectedItem?.id || "") : null;
  const isSubmitting = createMutation.isPending || (updateMutation?.isPending ?? false);

  // Implementar handlers (openDialog, closeDialog, submit, delete)
  // Implementar JSX (tabela, dialogs)
}
```

## 📋 Ordem Recomendada

1. **ManageSeasons** (mais simples, poucos campos)
2. **ManageChampionships** (adiciona Select)
3. **ManagePlayers** (adiciona Checkbox)
4. **ManageMatches** (mais complexo, date handling)

## 💡 Dicas

- Copie a lógica de `ManageTeams.tsx` como base
- Use `console.log(data)` para debugar o formato dos dados vindo da API
- Teste com dados mockados antes de conectar ao backend
- Adicione validações no front antes de enviar para a API

## 🚀 Quando Conectar ao Backend

Depois que todos os componentes estiverem seguindo o padrão:

1. Configure `.env.local`:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```

2. Inicie o backend Java

3. Teste as funcionalidades de CRUD

4. Verifique console do navegador (DevTools) para ver as requisições HTTP

## ✨ Bônus: Melhorias Futuras

- [ ] Adicionar paginação
- [ ] Adicionar busca/filtros
- [ ] Validação com `react-hook-form`
- [ ] Upload de imagens para times
- [ ] Exportar dados em CSV/JSON
- [ ] Modo "escuro/claro" já pronto no tema
