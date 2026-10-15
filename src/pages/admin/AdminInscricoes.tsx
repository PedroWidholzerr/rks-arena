import { Link } from "react-router-dom";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { Vazio } from "@/components/estados/Estados";
import { Button } from "@/components/ui/button";

/** As Inscrições públicas chegam numa etapa posterior; hoje o admin cadastra os Times direto. */
export function AdminInscricoes() {
  return (
    <>
      <CabecalhoDePagina titulo="Inscrições" />
      <Vazio
        titulo="As Inscrições ainda não estão abertas."
        texto="O formulário público de Inscrição chega numa próxima etapa. Por enquanto, cadastre os Times e os Elencos direto em Times."
        acao={
          <Button asChild className="min-h-toque">
            <Link to="/admin/times">Ir para Times</Link>
          </Button>
        }
      />
    </>
  );
}
