# 🔧 Troubleshooting - RKS Arena

Soluções para problemas comuns.

## 🚨 Erros e Soluções

### ❌ "CORS error: Access to XMLHttpRequest blocked"

**Causa:** Backend não está configurado para aceitar requisições do frontend.

**Solução:**
1. Verifique se o backend está rodando em `http://localhost:8080`
2. Confirme que CORS está habilitado no backend

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
                    .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

---

### ❌ "401 Unauthorized" ou "Token is missing"

**Causa:** Token não está sendo enviado ou é inválido.

**Solução:**
1. Verificar se o token está sendo salvo em localStorage:
   ```javascript
   // No console do navegador:
   localStorage.getItem('auth_token')
   ```

2. Se vazio, fazer login novamente

3. Se EXISTS, verificar se está sendo incluído nas requisições:
   ```javascript
   // No console, faça um request manual:
   fetch('http://localhost:8080/api/teams', {
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
     }
   }).then(r => r.json()).then(console.log)
   ```

---

### ❌ "400 Bad Request" ou validação errando

**Causa:** Dados sendo enviados em formato incorreto.

**Solução:**
1. Abra o DevTools (F12)
2. Vá para aba "Network"
3. Faça a requisição novamente
4. Clique no request e veja:
   - **Request:** Dados sendo enviados
   - **Response:** Erro do backend

**Exemplo de erro esperado:**
```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "tag": ["Tag must be 3-4 characters"]
  }
}
```

---

### ❌ "TypeError: Cannot read property 'data' of undefined"

**Causa:** Usando dados antes de estarem carregados.

**Solução:**
```typescript
// ❌ Errado:
const { data } = useTeams();
return data.map(...); // Erro se data === undefined

// ✅ Correto:
const { data = [] } = useTeams();
return data.map(...);

// OU:
const { data, isLoading } = useTeams();
if (isLoading) return <p>Loading...</p>;
return data?.map(...);
```

---

### ❌ "Hook called outside of a component"

**Causa:** Hook chamado fora de um componente React.

**Solução:**
```typescript
// ❌ Errado:
const { data } = useTeams(); // Fora do componente

function MyComponent() {
  return <div>{data}</div>;
}

// ✅ Correto:
function MyComponent() {
  const { data } = useTeams(); // Dentro do componente
  return <div>{data}</div>;
}
```

---

### ❌ "useAuth must be used within an AuthProvider"

**Causa:** Componente não está dentro de `<AuthProvider>`.

**Solução:**
Verificar se `App.tsx` tem `<AuthProvider>`:

```typescript
<QueryClientProvider client={queryClient}>
  <AuthProvider>  {/* Deve estar aqui */}
    <BrowserRouter>
      {/* rotas */}
    </BrowserRouter>
  </AuthProvider>
</QueryClientProvider>
```

---

### ❌ Dados não atualizam após mutation

**Causa:** Cache não está sendo invalidado.

**Solução:**
Os hooks já invalidam automaticamente, mas se não funcionar:

```typescript
// Manual refetch:
const { refetch } = useTeams();

const mutation = useCreateTeam();
await mutation.mutateAsync(data);
await refetch(); // Força atualização
```

---

### ❌ "POST /api/teams 404 Not Found"

**Causa:** Backend não implementou o endpoint.

**Solução:**
1. Verificar se o endpoint está em `API_ENDPOINTS.md`
2. Confirmar que o backend implementou
3. Verificar se o método HTTP está correto (POST, GET, PUT, DELETE)

---

## 🔍 Debugging

### Ver todas as requisições HTTP
1. Abrir DevTools (F12)
2. Ir para aba "Network"
3. Fazer as operações
4. Ver a lista de requisições com status

### Ver o que está em localStorage
```javascript
// No console:
console.table(localStorage);
```

### Ver estado do React Query
```javascript
// Instalar React Query DevTools:
// npm install @tanstack/react-query-devtools

// No App.tsx:
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <ReactQueryDevtools />
  {/* ... */}
</QueryClientProvider>
```

### Ver logs do contexto
```typescript
// No console:
const token = localStorage.getItem('auth_token');
const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
console.log({ token, user });
```

---

## 🔗 Verificar Conexão com Backend

### 1. Backend está rodando?
```bash
curl http://localhost:8080/api/teams
# Ou no navegador: http://localhost:8080/api/teams
```

### 2. Login funciona?
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### 3. Token é válido?
```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📱 Estados de Loading

Certifique-se que implementou loading states:

```typescript
const { isLoading, isPending, isFetching } = useTeams();

// isLoading: Dados nunca foram carregados
// isPending: Requisição em progresso  
// isFetching: Atualizando dados em background
```

---

## 🎯 Checklist de Debug

- [ ] Backend está rodando em localhost:8080?
- [ ] Frontend está rodando em localhost:5173?
- [ ] CORS está habilitado no backend?
- [ ] .env.local tem `REACT_APP_API_URL` correto?
- [ ] Token está em localStorage após login?
- [ ] DevTools network mostra requisições sendo enviadas?
- [ ] Respostas do backend têm status 200?
- [ ] Dados vêm em JSON válido?
- [ ] Componentes têm loading states?
- [ ] Hooks estão dentro de componentes React?

---

## 📞 Precisa de Ajuda?

1. **Verificar console (F12)** - Existem erros?
2. **Verificar aba Network** - Requisições são enviadas?
3. **Verificar resposta do servidor** - Response JSON é válido?
4. **Ir em EXAMPLES.md** - Tem um exemplo similar?
5. **Ir em FRONTEND_SETUP.md** - Explica como usar?

---

**Não encontrou a solução? Provavelmente é um erro JavaScript normal. Use DevTools!** 🔥
