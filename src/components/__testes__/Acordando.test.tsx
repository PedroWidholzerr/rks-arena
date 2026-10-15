import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AvisoAcordando } from "@/components/estados/Estados";
import { estadoDoServidor } from "@/services/apiClient";

describe("Aviso 'Acordando o servidor…'", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    estadoDoServidor.reiniciar();
  });
  afterEach(() => {
    estadoDoServidor.reiniciar();
    vi.useRealTimers();
  });

  it("não aparece antes de 3 s, aparece como aviso (nunca erro) depois, e mostra o tempo só após 15 s", () => {
    render(<AvisoAcordando />);
    act(() => estadoDoServidor.comecarEspera(Date.now()));
    expect(screen.queryByText("Acordando o servidor…")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("Acordando o servidor…")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText(/Aguardando há/)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(13000);
    });
    expect(screen.getByText(/Aguardando há 16 s/)).toBeInTheDocument();
  });

  it("some assim que o servidor responde", () => {
    render(<AvisoAcordando />);
    act(() => estadoDoServidor.comecarEspera(Date.now()));
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText("Acordando o servidor…")).toBeInTheDocument();
    act(() => estadoDoServidor.terminarEspera());
    expect(screen.queryByText("Acordando o servidor…")).toBeNull();
  });
});
