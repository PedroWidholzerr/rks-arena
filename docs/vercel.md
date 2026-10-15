# Projeto Vercel (existente)

Atualize o projeto Vercel que já existe (https://rks-arena.vercel.app/). **Não crie outro projeto.**

## Configuração do projeto

| Campo | Valor |
|---|---|
| Root Directory | raiz do repositório `rks-arena` (o front é o repositório inteiro; no layout de monorepo do Spine seria `rks-arena-main`) |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | 22.x (também fixado em `engines.node` do `package.json`) |
| Production Branch | `main` |
| Previews | desligar o build de outras branches: elas apontariam para o backend de produção |

Variável de ambiente (Production): `VITE_API_URL=/api`. O `vercel.json` reescreve `/api/*` para o backend no Render e devolve `index.html` nas demais rotas (fallback da SPA).

## Antes de publicar

1. `vercel.json` já aponta para `https://rks-arena-backend.onrender.com`.
2. Conferir que `/readyz` do Render responde.

## Corte para a nova versão

**O Epic 1 não promove nada para produção.** Hoje o site publicado usa `VITE_API_URL` apontando direto para o backend antigo (Railway). Enquanto o código novo não for lançado, qualquer push na `main` gera deploy de produção. Por isso:

- Não dar push da `main` neste repositório antes da história 2.34 (corte).
- O corte efetivo (trocar `VITE_API_URL` para `/api`, publicar a `main` e conferir a produção) é a história 2.34, fora do Epic 1.
