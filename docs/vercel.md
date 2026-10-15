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

## Corte para a nova versão (feito em 2026-10-15)

O front novo foi publicado na `main`, o que gera o deploy de produção no projeto existente. Em produção o front usa `/api` por padrão (a rota da Vercel, que reescreve para o Render); a variável `VITE_API_URL` só vale se existir. **Se o projeto ainda tiver `VITE_API_URL` apontando para o Railway (já desligado), apague-a em *Settings → Environment Variables* e refaça o deploy.**

Depois de cada deploy, o `smoke-pos-deploy.yml` confere o backend e a imagem fixa do Time `SMOKE` (crie esse Time com logo em produção e guarde o hash em `SMOKE_LOGO_SHA256`).
