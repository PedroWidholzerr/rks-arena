import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Legibilidade da paleta do RKS nos DOIS temas (WCAG AA): lê src/index.css, converte HSL em RGB e mede a razão dos
 * pares de texto e de componentes. Se qualquer par cair abaixo do mínimo, o build falha. Texto normal exige 4,5:1;
 * anel de foco e contorno de campo exigem 3:1 no tema claro.
 */

const css = readFileSync(resolve(__dirname, "../index.css"), "utf8");

function bloco(seletor: string): Record<string, string> {
  const inicio = css.indexOf(`${seletor} {`);
  if (inicio < 0) throw new Error(`Bloco ${seletor} não encontrado em index.css`);
  const fim = css.indexOf("\n  }", inicio);
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

/** Pares de texto (4,5:1) que valem nos dois temas. As classes .win-text e .loss-text usam accent-text e loss. */
const PARES: Array<[texto: string, fundo: string]> = [
  ["foreground", "background"],
  ["foreground", "card"],
  ["foreground", "surface-muted"],
  ["foreground", "secondary"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "surface-muted"],
  ["muted-foreground", "secondary"],
  ["primary-foreground", "primary"],
  ["accent-text", "background"],
  ["accent-text", "card"],
  ["accent-text", "accent-soft"],
  ["accent-text", "secondary"],
  ["loss", "card"],
  ["loss", "background"],
  ["success", "success-soft"],
  ["danger", "danger-soft"],
  ["warning", "warning-soft"],
  ["info", "info-soft"],
  ["on-live", "live"],
  ["destructive-foreground", "destructive"],
  ["foreground", "success-soft"],
  ["foreground", "danger-soft"],
  ["foreground", "warning-soft"],
  ["foreground", "info-soft"],
  ["foreground", "accent-soft"],
  ["muted-foreground", "success-soft"],
  ["muted-foreground", "warning-soft"],
];

const TEMAS = [
  { nome: "claro", v: bloco(":root"), contornoDoCampo: 3 },
  { nome: "escuro", v: bloco(".dark"), contornoDoCampo: 1.5 },
];

describe.each(TEMAS)("contraste no tema $nome", ({ v, contornoDoCampo }) => {
  it.each(PARES)("%s sobre %s passa de 4,5:1", (texto, fundo) => {
    expect(razao(v[texto], v[fundo])).toBeGreaterThanOrEqual(4.5);
  });

  it("o anel de foco passa de 3:1 sobre o fundo e sobre a superfície", () => {
    expect(razao(v.ring, v.background)).toBeGreaterThanOrEqual(3);
    expect(razao(v.ring, v.card)).toBeGreaterThanOrEqual(3);
  });

  it("o contorno dos campos tem contraste suficiente com o fundo", () => {
    expect(razao(v["border-strong"], v.background)).toBeGreaterThanOrEqual(contornoDoCampo);
    expect(razao(v.input, v.background)).toBeGreaterThanOrEqual(contornoDoCampo);
  });

  it.each([1, 2, 3, 4, 5, 6])("chart-%i passa de 3:1 sobre a superfície", (n) => {
    expect(razao(v[`chart-${n}`], v.card)).toBeGreaterThanOrEqual(3);
  });
});

describe("regras do dourado", () => {
  it("o dourado puro só serve de preenchimento: no tema claro reprova como texto, e accent-text o substitui", () => {
    const claro = bloco(":root");
    expect(razao(claro.primary, claro.card)).toBeLessThan(3);
    expect(razao(claro["accent-text"], claro.card)).toBeGreaterThanOrEqual(4.5);
  });
});
