import { describe, expect, it } from "vitest";
import { validarImagem } from "@/components/admin/CampoDeImagem";
import { validarElenco } from "@/pages/admin/AdminTimes";
import { validarPontuacao } from "@/pages/admin/AdminCampeonatos";

const membro = (jogadorId: string, funcao: "TITULAR" | "RESERVA", capitao = false) => ({ jogadorId, funcao, capitao });

describe("validação do Elenco (3 titulares, até 2 reservas, 1 Capitão)", () => {
  const base = [membro("a", "TITULAR", true), membro("b", "TITULAR"), membro("c", "TITULAR")];
  it("aceita 3 titulares com um Capitão, com ou sem reservas", () => {
    expect(validarElenco(base)).toBeNull();
    expect(validarElenco([...base, membro("d", "RESERVA"), membro("e", "RESERVA")])).toBeNull();
  });
  it("rejeita titulares a menos ou a mais", () => {
    expect(validarElenco(base.slice(0, 2))).toMatch(/3 titulares/);
    expect(validarElenco([...base, membro("d", "TITULAR")])).toMatch(/3 titulares/);
  });
  it("rejeita mais de 2 reservas", () => {
    expect(validarElenco([...base, membro("d", "RESERVA"), membro("e", "RESERVA"), membro("f", "RESERVA")])).toMatch(/reservas/);
  });
  it("exige exatamente um Capitão", () => {
    expect(validarElenco(base.map((m) => ({ ...m, capitao: false })))).toMatch(/Capitão/);
    expect(validarElenco(base.map((m) => ({ ...m, capitao: true })))).toMatch(/Capitão/);
  });
  it("rejeita Jogador repetido e linha sem Jogador", () => {
    expect(validarElenco([membro("a", "TITULAR", true), membro("a", "TITULAR"), membro("c", "TITULAR")])).toMatch(/uma única vez/);
    expect(validarElenco([membro("", "TITULAR", true), membro("b", "TITULAR"), membro("c", "TITULAR")])).toMatch(/Escolha o Jogador/);
  });
});

describe("validação da pontuação (vitória > derrota decisiva >= derrota)", () => {
  it("aceita o padrão 2/1/0 e variações", () => {
    expect(validarPontuacao({ vitoria: 2, derrotaDecisiva: 1, derrota: 0 })).toBeNull();
    expect(validarPontuacao({ vitoria: 3, derrotaDecisiva: 1, derrota: 1 })).toBeNull();
    expect(validarPontuacao({ vitoria: 3, derrotaDecisiva: 0, derrota: 0 })).toBeNull();
  });
  it("rejeita negativos, decimais e ordem errada", () => {
    expect(validarPontuacao({ vitoria: -1, derrotaDecisiva: 0, derrota: 0 })).toMatch(/negativos/);
    expect(validarPontuacao({ vitoria: 2.5, derrotaDecisiva: 1, derrota: 0 })).toMatch(/inteiros/);
    expect(validarPontuacao({ vitoria: 2, derrotaDecisiva: 0, derrota: 1 })).toMatch(/vitória/);
    expect(validarPontuacao({ vitoria: 1, derrotaDecisiva: 1, derrota: 0 })).toMatch(/vitória/);
  });
});

describe("validação local de imagem", () => {
  it("aceita PNG, JPEG e WebP de até 2 MB", () => {
    ["image/png", "image/jpeg", "image/webp"].forEach((type) => expect(validarImagem({ type, size: 1024 })).toBeNull());
    expect(validarImagem({ type: "image/png", size: 2 * 1024 * 1024 })).toBeNull();
  });
  it("rejeita outros formatos e mais de 2 MB, com mensagem específica", () => {
    expect(validarImagem({ type: "image/gif", size: 10 })).toMatch(/Formato/);
    expect(validarImagem({ type: "application/pdf", size: 10 })).toMatch(/Formato/);
    expect(validarImagem({ type: "image/png", size: 2 * 1024 * 1024 + 1 })).toMatch(/2 MB/);
  });
});
