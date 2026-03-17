# ⚡ Quick Start - RKS Arena Frontend

Guia rápido para começar em 10 minutos.

## ✅ Pré-requisitos

- [ ] Node.js 18+ instalado
- [ ] npm ou bun instalado
- [ ] Código do projeto em `c:\RKS\rks-arena`

## 🚀 Iniciar Agora

### 1. Instalar dependências (2 min)
```bash
cd c:\RKS\rks-arena
npm install
```

### 2. Criar arquivo de ambiente (1 min)
Crie `.env.local` na raiz do projeto:
```
REACT_APP_API_URL=http://localhost:8080/api
```

### 3. Rodar em desenvolvimento (1 min)
```bash
npm run dev
```

O projeto abrirá em `http://localhost:5173`

### 4. Testar funcionalidades

#### 🧪 Teste público (sem login)
- [ ] Acesse `http://localhost:5173`
- [ ] Veja "Championships", "Teams", "Players"
- [ ] Clique em um time/campeonato/jogador
- [ ] Veja se os dados mockados carregam

#### 🔐 Teste com login (requer backend)
- [ ] Clique em algum botão que redirecione para admin (ou acesse `/login`)
- [ ] Veja página de login
- [ ] Digite email: `admin@example.com` e senha qualquer
- [ ] Se backend não estiver rodando, verá erro (esperado)

## 📚 Próximas Leituras (5 min)

1. **[README_PT.md](./README_PT.md)** - Índice de toda documentação
2. **[SUMMARY.md](./SUMMARY.md)** - O que foi criado
3. **[FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** - Como usar tudo

## 🎯 Se Tudo Funcionar

- [ ] Frontend carrega sem erros
- [ ] Você vê dados mockados nas páginas públicas
- [ ] Console (F12) não mostra erros vermelhos
- [ ] Você consegue navigar entre páginas

## ⚠️ Se Algo Não Funcionar

### Erro: "Module not found"
```bash
# Limpar cache e reinstalar
rm -r node_modules
npm install
npm run dev
```

### Erro: "Port 5173 already in use"
```bash
# Rodar em porta diferente
npm run dev -- --port 3000
```

### Erro: "Cannot find react"
```bash
# Reinstalar dependências
npm install
```

## 🔗 Conectando ao Backend

Quando seu backend Java estiver pronto:

1. **Backend deve estar rodando** em `http://localhost:8080`
2. **Implemente os endpoints** listados em [API_ENDPOINTS.md](./API_ENDPOINTS.md)
3. **Configure CORS** para aceitar `http://localhost:5173`
4. Não precisa mudar `.env.local` (já está pronto)

## 🚀 Próximo Passo

Implemente o padrão nos componentes admin seguindo:
→ **[MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)**

---

## 📱 Atalhos Úteis

### No VSCode
- **F12** - Abrir DevTools
- **Ctrl+Shift+P** - Command Palette
- **Ctrl+E** - Quick file open

### No Browser DevTools
- **Network tab** - Ver requisições HTTP
- **Console tab** - Ver logs e erros
- **Application -> Local Storage** - Ver tokens salvos

## 🎓 Estrutura Aprendida

```
Componente React
    ↓
Hook (useTeams, etc) 
    ↓
React Query (Cache + Loading)
    ↓
Service (teamService)
    ↓
ApiClient (HTTP + Token)
    ↓
Backend API
    ↓
Database
```

## ✅ Checklist Final

- [ ] `npm install` rodou sem erros
- [ ] `npm run dev` iniciou servidor
- [ ] Frontend abre em `http://localhost:5173`
- [ ] Vejo dados na página inicial
- [ ] Console (F12) limpo (sem erros vermelhos)
- [ ] Arquivo `.env.local` criado
- [ ] Li [README_PT.md](./README_PT.md)
- [ ] Entendi a arquitetura
- [ ] Pronto para implementar padrão nos outros componentes

## 🆘 Problemas?

1. Verificar [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Ver [EXAMPLES.md](./EXAMPLES.md) para sintaxe correta
3. Abrir DevTools (F12) e checar console

---

**Você está pronto!** 🎉

Próximo passo: [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)
