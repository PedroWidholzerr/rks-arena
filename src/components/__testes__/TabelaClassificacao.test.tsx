import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TabelaClassificacao } from "@/components/TabelaClassificacao";
import type { LinhaDaTabela } from "@/types";

const linha = (timeId: string, tag: string, nome: string, posicao: number, pontos: number, empate = false): LinhaDaTabela => ({
  posicao,
  timeId,
  nome,
  tag,
  logoUrl: null,
  jogadas: 4,
  vitorias: 2,
  derrotas: 2,
  jogosAFavor: 5,
  jogosContra: 4,
  saldo: 1,
  pontos,
  empate,
});

const renderizar = (props: Parameters<typeof TabelaClassificacao>[0]) =>
  render(
    <MemoryRouter>
      <TabelaClassificacao {...props} />
    </MemoryRouter>,
  );

describe("TabelaClassificacao", () => {
  it("mostra a ordem EXATA da API, mesmo que ela contradiga os pontos (a interface nunca reordena)", () => {
    renderizar({
      linhas: [linha("1", "AAA", "Alfa", 1, 3), linha("2", "BBB", "Beta", 2, 9), linha("3", "CCC", "Gama", 3, 6)],
      empatesAbertos: [],
    });
    const links = screen.getAllByRole("link").map((l) => l.textContent ?? "");
    expect(links[0]).toContain("AAA");
    expect(links[1]).toContain("BBB");
    expect(links[2]).toContain("CCC");
  });

  it("cabeçalhos curtos trazem o nome completo para leitor de tela e não são clicáveis para ordenar", () => {
    renderizar({ linhas: [linha("1", "AAA", "Alfa", 1, 3)], empatesAbertos: [] });
    expect(screen.getByText("(Pontos)")).toBeInTheDocument();
    expect(screen.getByText("(Saldo de Jogos)")).toBeInTheDocument();
    expect(screen.queryAllByRole("columnheader").some((c) => c.querySelector("button"))).toBe(false);
  });

  it("Times empatados dividem a posição, ganham o selo 'Empate' e a explicação em texto", () => {
    renderizar({
      linhas: [linha("1", "AAA", "Alfa", 1, 6), linha("2", "BBB", "Beta", 2, 3, true), linha("3", "CCC", "Gama", 2, 3, true)],
      empatesAbertos: [{ posicao: 2, times: ["2", "3"] }],
    });
    expect(screen.getAllByText("Empate")).toHaveLength(2);
    expect(screen.getByText(/Empate entre Beta, Gama em 2º\. Aguardando decisão do Administrador\./)).toBeInTheDocument();
    const posicoes = screen.getAllByRole("cell").filter((c) => /^\dº/.test(c.textContent ?? ""));
    expect(posicoes.map((c) => c.textContent?.match(/^\dº/)?.[0])).toEqual(["1º", "2º", "2º"]);
  });

  it("o botão 'Decidir' do admin só aparece nas linhas empatadas", () => {
    const aoDecidir = vi.fn();
    renderizar({
      linhas: [linha("1", "AAA", "Alfa", 1, 6), linha("2", "BBB", "Beta", 2, 3, true), linha("3", "CCC", "Gama", 2, 3, true)],
      empatesAbertos: [{ posicao: 2, times: ["2", "3"] }],
      aoDecidir,
      densa: true,
    });
    const botoes = screen.getAllByRole("button", { name: "Decidir" });
    expect(botoes).toHaveLength(2);
    fireEvent.click(botoes[0]);
    expect(aoDecidir).toHaveBeenCalledWith({ posicao: 2, times: ["2", "3"] });
  });

  it("saldo positivo leva sinal de mais e 'Ver detalhes' mostra Jogos a favor e contra no celular", () => {
    renderizar({ linhas: [linha("1", "AAA", "Alfa", 1, 3)], empatesAbertos: [] });
    expect(screen.getByText("+1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Ver detalhes de AAA/ }));
    expect(screen.getByText(/Jogos a favor: 5 · Jogos contra: 4/)).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getByText("Classificação", { selector: "caption" })).toBeInTheDocument();
  });
});
