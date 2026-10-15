import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Legibilidade da paleta escura (WCAG AA): lê src/index.css, converte HSL em RGB e mede a razão dos pares de texto e
 * de componentes. Se qualquer par cair abaixo do mínimo, o build falha. Texto normal exige 4,5:1; componentes e anel
 * de foco exigem 3:1.
 */

const css = readFileSync(resolve(__dirname, "../index.css"), "utf8");

function variaveis(): Record<string, string> {
  const inicio = css.indexOf(":root {");
  if (inicio < 0) throw new Error("Bloco :root não encontrado em index.css");
  const fim = css.indexOf("}", inicio);
  const saida: Record<string, string> = {};
  for (const m of css.slice(inicio, fim).matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) saida[m[1]] = m[2].trim();
  return saida;
}

function hslParaRgb(valor: string): [number, number, number] {
  const m = valor.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) throw new Error(`Valor HSL inesperado: ${valor}`);
  const h = Number(m[1]);
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m0 = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m0) * 255, (g + m0) * 255, (b + m0) * 255];
}

function luminancia([r, g, b]: [number, number, number]): number {
  const canal = (v: number) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function razao(a: string, b: string): number {
  const la = luminancia(hslParaRgb(a));
  const lb = luminancia(hslParaRgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const v = variaveis();
/** Cor das vitórias e derrotas na tabela (as classes .win-text e .loss-text do CSS). */
const CORES_EXTRAS: Record<string, string> = { "vitoria-texto": v.primary, "derrota-texto": "0 72% 60%" };
const cor = (nome: string) => CORES_EXTRAS[nome] ?? v[nome];

const PARES: Array<[texto: string, fundo: string, minimo: number]> = [
  ["foreground", "background", 4.5],
  ["foreground", "card", 4.5],
  ["foreground", "surface-muted", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "card", 4.5],
  ["muted-foreground", "surface-muted", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["accent-text", "background", 4.5],
  ["accent-text", "card", 4.5],
  ["accent-text", "accent-soft", 4.5],
  ["primary", "background", 4.5],
  ["primary", "card", 4.5],
  ["vitoria-texto", "card", 4.5],
  ["derrota-texto", "card", 4.5],
  ["derrota-texto", "background", 4.5],
  ["success", "success-soft", 4.5],
  ["danger", "danger-soft", 4.5],
  ["warning", "warning-soft", 4.5],
  ["info", "info-soft", 4.5],
  ["on-live", "live", 4.5],
  ["destructive-foreground", "destructive", 4.5],
  ["foreground", "success-soft", 4.5],
  ["foreground", "danger-soft", 4.5],
  ["foreground", "warning-soft", 4.5],
  ["foreground", "info-soft", 4.5],
  ["muted-foreground", "success-soft", 4.5],
  ["muted-foreground", "warning-soft", 4.5],
  ["ring", "background", 3],
  ["ring", "card", 3],
  ["border-strong", "background", 1.5],
];

describe("contraste da paleta escura", () => {
  it.each(PARES)("%s sobre %s passa de %s:1", (texto, fundo, minimo) => {
    expect(razao(cor(texto), cor(fundo))).toBeGreaterThanOrEqual(minimo);
  });

  it.each([1, 2, 3, 4, 5, 6])("chart-%i passa de 3:1 sobre a superfície", (n) => {
    expect(razao(v[`chart-${n}`], v.card)).toBeGreaterThanOrEqual(3);
  });
});
