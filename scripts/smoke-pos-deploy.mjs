// Smoke pós-deploy (história 2.34): confere em produção que o backend responde e que a imagem fixa do
// Time de teste continua acessível, com o mesmo conteúdo. Não grava nada.
//
// Variáveis: SMOKE_URL (padrão https://rks-arena.vercel.app), SMOKE_TIME_TAG (padrão SMOKE) e
// SMOKE_LOGO_SHA256 (hash esperado da imagem; sem ele o script só imprime o hash para fixar).
import { createHash } from "node:crypto";

const BASE = (process.env.SMOKE_URL ?? "https://rks-arena.vercel.app").replace(/\/$/, "");
const TAG = (process.env.SMOKE_TIME_TAG ?? "SMOKE").toLowerCase();
const ESPERADO = (process.env.SMOKE_LOGO_SHA256 ?? "").trim().toLowerCase();

async function buscar(caminho, tentativas = 6) {
  // O backend gratuito dorme: o primeiro acesso pode levar cerca de um minuto.
  let ultimo = "sem resposta";
  for (let i = 1; i <= tentativas; i++) {
    try {
      const resposta = await fetch(BASE + caminho, { signal: AbortSignal.timeout(90_000) });
      if (resposta.ok) return resposta;
      ultimo = `HTTP ${resposta.status}`;
    } catch (erro) {
      ultimo = erro.name;
    }
    console.log(`  tentativa ${i} de ${caminho}: ${ultimo}`);
    await new Promise((r) => setTimeout(r, 15_000));
  }
  throw new Error(`${caminho} não respondeu bem: ${ultimo}`);
}

console.log(`Smoke em ${BASE}`);
const status = await (await buscar("/api/public/status")).json();
if (status.ok !== true) throw new Error(`/api/public/status inesperado: ${JSON.stringify(status)}`);
console.log(`  backend ok, versão ${status.versao}`);

const times = (await (await buscar("/api/public/teams")).json()).dados;
const smoke = times.find((t) => t.tag.toLowerCase() === TAG);
if (!smoke) throw new Error(`Nenhum Time com a tag ${TAG.toUpperCase()}: crie o Time de teste com logo em produção.`);
if (!smoke.logoUrl) throw new Error(`O Time ${smoke.tag} não tem logo.`);

const imagem = Buffer.from(await (await fetch(smoke.logoUrl, { signal: AbortSignal.timeout(30_000) })).arrayBuffer());
if (imagem.length === 0) throw new Error("A imagem veio vazia.");
const hash = createHash("sha256").update(imagem).digest("hex");
console.log(`  imagem do Time ${smoke.tag}: ${imagem.length} bytes, sha256 ${hash}`);

if (ESPERADO && hash !== ESPERADO) {
  throw new Error(`O hash da imagem mudou: esperado ${ESPERADO}, veio ${hash}.`);
}
if (!ESPERADO) console.log("  (defina SMOKE_LOGO_SHA256 com este hash para o smoke também conferir o conteúdo)");
console.log("Smoke ok.");
