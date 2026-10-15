import { describe, expect, it } from "vitest";
import { chaveDoDia, diaEHora, ehHttps, hora, iniciais, placar, placaresValidos, rotuloDoDia, textoDoAvatarDoTime } from "./formato";

describe("placares válidos (só a partir de N)", () => {
  it("melhor de 1: 1×0 e 0×1", () => {
    expect(placaresValidos(1)).toEqual([[1, 0], [0, 1]]);
  });
  it("melhor de 3: 2×1, 2×0, 0×2 e 1×2; nunca 3×0 nem 1×1", () => {
    expect(placaresValidos(3)).toEqual([[2, 1], [2, 0], [0, 2], [1, 2]]);
  });
  it("melhor de 5: o vencedor sempre tem 3 e o perdedor menos que isso", () => {
    const opcoes = placaresValidos(5);
    expect(opcoes).toHaveLength(6);
    opcoes.forEach(([a, b]) => {
      expect(Math.max(a, b)).toBe(3);
      expect(Math.min(a, b)).toBeLessThan(3);
    });
  });
});

describe("datas no fuso do Campeonato (America/Sao_Paulo)", () => {
  // 2026-10-15T23:30Z são 20:30 em São Paulo (UTC-3).
  it("formata hora e dia em Brasília, não no UTC", () => {
    expect(hora("2026-10-15T23:30:00Z")).toBe("20:30");
    expect(diaEHora("2026-10-15T23:30:00Z")).toBe("15/10 às 20:30");
  });
  it("uma Partida às 01:00 UTC ainda é do dia anterior em Brasília", () => {
    expect(chaveDoDia("2026-10-16T01:00:00Z")).toBe("2026-10-15");
  });
  it("sem horário diz 'Sem horário'", () => {
    expect(diaEHora(null)).toBe("Sem horário");
  });
  it("rotula Hoje e Amanhã", () => {
    const agora = new Date("2026-10-15T15:00:00Z");
    expect(rotuloDoDia("2026-10-15", agora)).toBe("Hoje");
    expect(rotuloDoDia("2026-10-16", agora)).toBe("Amanhã");
    expect(rotuloDoDia("2026-10-20", agora)).toMatch(/terça-feira/);
  });
});

describe("textos curtos", () => {
  it("placar com 'x' tipográfico e travessão sem resultado", () => {
    expect(placar(2, 1)).toBe("2×1");
    expect(placar(null, null)).toBe("–");
  });
  it("iniciais do Jogador e tag do Time", () => {
    expect(iniciais("Pedro Costa")).toBe("PC");
    expect(iniciais("Faker")).toBe("FA");
    expect(iniciais("  ")).toBe("?");
    expect(textoDoAvatarDoTime("rkings")).toBe("RKI");
  });
  it("só https vira link externo", () => {
    expect(ehHttps("https://twitch.tv/rks")).toBe(true);
    expect(ehHttps("http://inseguro.test")).toBe(false);
    expect(ehHttps("javascript:alert(1)")).toBe(false);
    expect(ehHttps(null)).toBe(false);
  });
});
