import { useEffect, useState, useSyncExternalStore } from "react";
import { estadoDoServidor } from "@/services/apiClient";

/** Depois de quantos segundos de falha repetível a interface passa a dizer "Acordando o servidor…". */
export const ATRASO_DO_AVISO_S = 3;
/** Depois de quantos segundos o aviso mostra o tempo decorrido. */
export const ATRASO_DO_TEMPO_S = 15;

/**
 * Observa o estado do servidor sem decidir repetições. {@code acordando} só fica verdadeiro depois de 3 s
 * (antes disso, é só carregamento); {@code segundos} é o tempo decorrido, para mostrar após 15 s.
 */
export function useServidorAcordando(): { acordando: boolean; segundos: number; mostrarTempo: boolean } {
  const desde = useSyncExternalStore(estadoDoServidor.assinar, estadoDoServidor.obterDesde, () => null);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (desde === null) return undefined;
    setAgora(Date.now());
    const intervalo = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, [desde]);

  const segundos = desde === null ? 0 : Math.max(0, Math.floor((agora - desde) / 1000));
  return { acordando: desde !== null && segundos >= ATRASO_DO_AVISO_S, segundos, mostrarTempo: segundos >= ATRASO_DO_TEMPO_S };
}
