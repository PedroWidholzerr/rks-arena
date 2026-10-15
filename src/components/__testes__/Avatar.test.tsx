import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "@/components/Avatar";

describe("Avatar com fallback", () => {
  it("sem imagem mostra o texto neutro (tag ou iniciais), sem <img>", () => {
    const { container } = render(<Avatar src={null} texto="RKS" />);
    expect(screen.getByText("RKS")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("enquanto carrega, o fallback já aparece (sem piscar) e a imagem entra por cima", () => {
    const { container } = render(<Avatar src="https://exemplo.test/logo.png" texto="RKS" />);
    expect(screen.getByText("RKS")).toBeVisible();
    expect(container.querySelector("img")).not.toBeNull();
  });

  it("imagem que falha some e deixa só o fallback, nunca ícone quebrado", () => {
    const { container } = render(<Avatar src="https://exemplo.test/quebrada.png" texto="RKS" />);
    fireEvent.error(container.querySelector("img") as HTMLImageElement);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("RKS")).toBeVisible();
  });

  it("a imagem tem alt vazio (decorativa: o nome fica ao lado)", () => {
    const { container } = render(<Avatar src="https://exemplo.test/logo.png" texto="RKS" />);
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("depois de falhar, tenta de novo uma única vez ao voltar a aba", () => {
    const { container } = render(<Avatar src="https://exemplo.test/quebrada.png" texto="RKS" />);
    fireEvent.error(container.querySelector("img") as HTMLImageElement);
    expect(container.querySelector("img")).toBeNull();

    const voltarAAba = () =>
      act(() => {
        Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
    voltarAAba();
    expect(container.querySelector("img")).not.toBeNull();
    fireEvent.error(container.querySelector("img") as HTMLImageElement);
    voltarAAba();
    expect(container.querySelector("img")).toBeNull();
  });
});
