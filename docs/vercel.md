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

## Resultado do spike 2.33 (cache de borda e cold start), medido em 2026-10-15

- O rewrite `/api/*` para o Render funciona: `GET /api/public/status` e as demais rotas respondem pela própria Vercel, e `/api/admin/*` sem token devolve 401.
- O backend envia `Cache-Control: public, s-maxage=30, stale-while-revalidate=86400` nos endpoints públicos de dados, mas **a borda da Vercel não o aplica no rewrite externo**: 10 chamadas seguidas, na mesma região (`gru1`), voltaram todas com `X-Vercel-Cache: MISS` e sem `Age`.
- Consequência: **não há "última versão servida pela borda" enquanto o backend dorme**. A tolerância ao cold start fica com o que já existe: a repetição do `apiClient` por até ~90 s, o aviso "Acordando o servidor…" e o cache do React Query no navegador (que mostra a última versão salva com a faixa "atualizando…" e a hora do `atualizadoEm`).
- Cold start medido no Render: média de 79,4 s (ver `docs/deploy-render.md` no backend), abaixo do gatilho de 90 s para rever o host. Mantém-se o Render.
- Se no futuro o cache de borda for necessário, as saídas são: servir os dados públicos por Function da Vercel com cache (`s-maxage`), ou trocar a hospedagem do backend. Nenhuma das duas é preciso agora.
