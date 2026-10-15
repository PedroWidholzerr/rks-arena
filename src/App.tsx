import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import LayoutAdmin from "@/components/layout/LayoutAdmin";
import LayoutPublico from "@/components/layout/LayoutPublico";
import { RotaAdmin } from "@/components/layout/RotaAdmin";
import { AuthProvider } from "@/contexts/AuthContext";
import Agenda from "@/pages/Agenda";
import { DetalheDoCampeonato, ListaDeCampeonatos } from "@/pages/Campeonatos";
import Entrar from "@/pages/Entrar";
import Inicio from "@/pages/Inicio";
import { DetalheDoJogador, ListaDeJogadores } from "@/pages/Jogadores";
import NaoEncontrada from "@/pages/NaoEncontrada";
import { DetalheDaTemporada, ListaDeTemporadas } from "@/pages/Temporadas";
import { DetalheDoTime, ListaDeTimes } from "@/pages/Times";
import TrocarSenha from "@/pages/TrocarSenha";
import { AdminAdministradores } from "@/pages/admin/AdminAdministradores";
import { AdminCampeonato, AdminCampeonatos } from "@/pages/admin/AdminCampeonatos";
import { AdminFases } from "@/pages/admin/AdminFases";
import { AdminInscricoes } from "@/pages/admin/AdminInscricoes";
import { AdminJogadores } from "@/pages/admin/AdminJogadores";
import { AdminPartidas } from "@/pages/admin/AdminPartidas";
import { AdminPendencias } from "@/pages/admin/AdminPendencias";
import { AdminTimes } from "@/pages/admin/AdminTimes";

// A repetição para o cold start é do apiClient; aqui o React Query não repete por conta própria.
const clienteDeConsultas = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 30_000, refetchOnWindowFocus: true } },
});

const App = () => (
  <QueryClientProvider client={clienteDeConsultas}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="rks-tema">
      <AuthProvider>
        <TooltipProvider>
          <Toaster position="bottom-center" />
          <BrowserRouter>
            <Routes>
              <Route element={<LayoutPublico />}>
                <Route path="/" element={<Inicio />} />
                <Route path="/temporadas" element={<ListaDeTemporadas />} />
                <Route path="/temporadas/:id" element={<DetalheDaTemporada />} />
                <Route path="/campeonatos" element={<ListaDeCampeonatos />} />
                <Route path="/campeonatos/:id" element={<DetalheDoCampeonato />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/times" element={<ListaDeTimes />} />
                <Route path="/times/:id" element={<DetalheDoTime />} />
                <Route path="/jogadores" element={<ListaDeJogadores />} />
                <Route path="/jogadores/:id" element={<DetalheDoJogador />} />
              </Route>
              <Route path="/entrar" element={<Entrar />} />
              <Route path="/troque-sua-senha" element={<TrocarSenha />} />
              <Route element={<RotaAdmin />}>
                <Route element={<LayoutAdmin />}>
                  <Route path="/admin" element={<AdminPendencias />} />
                  <Route path="/admin/campeonatos" element={<AdminCampeonatos />} />
                  <Route path="/admin/campeonatos/:id" element={<AdminCampeonato />} />
                  <Route path="/admin/fases" element={<AdminFases />} />
                  <Route path="/admin/partidas" element={<AdminPartidas />} />
                  <Route path="/admin/inscricoes" element={<AdminInscricoes />} />
                  <Route path="/admin/times" element={<AdminTimes />} />
                  <Route path="/admin/jogadores" element={<AdminJogadores />} />
                  <Route path="/admin/administradores" element={<AdminAdministradores />} />
                </Route>
              </Route>
              <Route element={<LayoutPublico />}>
                <Route path="*" element={<NaoEncontrada />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
