import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Reproduz a tabela "Contraste verificado" do DESIGN.md (WCAG AA) sobre os valores que o CSS
 * realmente renderiza: lê src/index.css, converte HSL em RGB e mede a razão de cada par nos temas
 * claro e escuro. Se qualquer par cair abaixo do mínimo, o build falha.
 */

const css = readFileSync(resolve(__dirname, "../index.css"), "utf8");

function bloco(seletor: string): Record<string, string> {
  const inicio = css.indexOf(`${seletor} {`);
  if (inicio < 0) throw new Error(`Bloco ${seletor} não encontrado em index.css`);
  const fim = css.indexOf("}", inicio);
  const variaveis: Record<string, string> = {};
  for (const m of css.slice(inicio, fim).matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    variaveis[m[1]] = m[2].trim();
  }
  return variaveis;
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

/** Nome do token do DESIGN.md -> variável CSS que o implementa. */
const VARIAVEL: Record<string, string> = {
  background: "background",
  surface: "card",
  "surface-muted": "surface-muted",
  text: "foreground",
  "text-muted": "muted-foreground",
  accent: "primary",
  "on-accent": "primary-foreground",
  "accent-text": "accent-text",
  "accent-soft": "accent-soft",
  success: "success",
  "success-soft": "success-soft",
  danger: "danger",
  "danger-soft": "danger-soft",
  warning: "warning",
  "warning-soft": "warning-soft",
  info: "info",
  "info-soft": "info-soft",
  live: "live",
  "on-live": "on-live",
  "border-strong": "border-strong",
  "focus-ring": "ring",
};

interface Par {
  texto: string;
  fundo: string;
  minimo: number;
  claro?: number;
  escuro?: number;
}

// Valores documentados no DESIGN.md (conferidos com tolerância de 0,06 por causa do arredondamento do HSL).
const PARES: Par[] = [
  { texto: "text", fundo: "background", minimo: 4.5, claro: 16.48, escuro: 16.84 },
  { texto: "text", fundo: "surface", minimo: 4.5, claro: 17.21, escuro: 15.36 },
  { texto: "text", fundo: "surface-muted", minimo: 4.5, claro: 15.09, escuro: 13.84 },
  { texto: "text-muted", fundo: "background", minimo: 4.5, claro: 7.31, escuro: 8.18 },
  { texto: "text-muted", fundo: "surface", minimo: 4.5, claro: 7.64, escuro: 7.46 },
  { texto: "text-muted", fundo: "surface-muted", minimo: 4.5, claro: 6.7, escuro: 6.72 },
  { texto: "on-accent", fundo: "accent", minimo: 4.5, claro: 8.52, escuro: 8.52 },
  { texto: "accent-text", fundo: "background", minimo: 4.5, claro: 7.1, escuro: 10.83 },
  { texto: "accent-text", fundo: "surface", minimo: 4.5, claro: 7.41, escuro: 9.88 },
  { texto: "accent-text", fundo: "accent-soft", minimo: 4.5, claro: 6.49, escuro: 7.8 },
  { texto: "success", fundo: "success-soft", minimo: 4.5, claro: 6.41, escuro: 7.82 },
  { texto: "danger", fundo: "danger-soft", minimo: 4.5, claro: 5.75, escuro: 7.1 },
  { texto: "warning", fundo: "warning-soft", minimo: 4.5, claro: 6.49, escuro: 7.8 },
  { texto: "info", fundo: "info-soft", minimo: 4.5, claro: 6.27, escuro: 7.14 },
  { texto: "on-live", fundo: "live", minimo: 4.5, claro: 6.57, escuro: 5.73 },
  { texto: "border-strong", fundo: "background", minimo: 3, claro: 3.46, escuro: 5.14 },
  { texto: "border-strong", fundo: "surface", minimo: 3, claro: 3.62, escuro: 4.69 },
  // Texto e texto secundário sobre cada fundo suave de aviso.
  ...["success-soft", "danger-soft", "warning-soft", "info-soft", "accent-soft"].flatMap((fundo): Par[] => [
    { texto: "text", fundo, minimo: 4.5 },
    { texto: "text-muted", fundo, minimo: 4.5 },
  ]),
  // O anel de foco precisa de 3:1 contra o fundo e contra a superfície, nos dois temas.
  { texto: "focus-ring", fundo: "background", minimo: 3 },
  { texto: "focus-ring", fundo: "surface", minimo: 3 },
];

const TEMAS = [
  { nome: "claro", variaveis: bloco(":root"), coluna: "claro" as const },
  { nome: "escuro", variaveis: bloco(".dark"), coluna: "escuro" as const },
];

describe.each(TEMAS)("contraste no tema $nome", ({ variaveis, coluna }) => {
  const valor = (token: string) => {
    const nome = VARIAVEL[token];
    const v = variaveis[nome];
    if (!v) throw new Error(`Variável --${nome} (token ${token}) ausente`);
    return v;
  };

  it.each(PARES)("$texto sobre $fundo passa do mínimo", ({ texto, fundo, minimo, ...docs }) => {
    expect(razao(valor(texto), valor(fundo))).toBeGreaterThanOrEqual(minimo);
    const documentado = docs[coluna];
    if (documentado !== undefined) {
      expect(razao(valor(texto), valor(fundo))).toBeCloseTo(documentado, 1);
    }
  });

  it.each([1, 2, 3, 4, 5, 6])("chart-%i passa de 3:1 sobre a superfície", (n) => {
    expect(razao(variaveis[`chart-${n}`], variaveis.card)).toBeGreaterThanOrEqual(3);
  });

  it("o botão destrutivo (texto branco) passa de 4,5:1", () => {
    expect(razao(variaveis["destructive-foreground"], variaveis.destructive)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("regras do dourado", () => {
  it("o dourado puro reprova como texto no tema claro (só serve de preenchimento)", () => {
    const claro = bloco(":root");
    expect(razao(claro.primary, claro.background)).toBeLessThan(3);
  });
});
