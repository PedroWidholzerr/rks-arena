import { Link } from "react-router-dom";
import { CabecalhoDePagina } from "@/components/CabecalhoDePagina";
import { Vazio } from "@/components/estados/Estados";
import { Button } from "@/components/ui/button";

export default function NaoEncontrada() {
  return (
    <>
      <CabecalhoDePagina titulo="Página não encontrada" />
      <Vazio
        titulo="Não encontramos esta página."
        texto="O endereço pode ter mudado ou estar incompleto."
        acao={
          <Button asChild className="min-h-toque">
            <Link to="/">Ir para o início</Link>
          </Button>
        }
      />
    </>
  );
}
