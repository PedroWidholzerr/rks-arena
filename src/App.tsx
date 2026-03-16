import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import ChampionshipsPage from "./pages/ChampionshipsPage";
import ChampionshipDetailPage from "./pages/ChampionshipDetailPage";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import PlayersPage from "./pages/PlayersPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageSeasons from "./pages/admin/ManageSeasons";
import ManageChampionships from "./pages/admin/ManageChampionships";
import ManageTeams from "./pages/admin/ManageTeams";
import ManagePlayers from "./pages/admin/ManagePlayers";
import ManageMatches from "./pages/admin/ManageMatches";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/championships" element={<ChampionshipsPage />} />
            <Route path="/championships/:id" element={<ChampionshipDetailPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:id" element={<PlayerDetailPage />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/seasons" element={<ManageSeasons />} />
            <Route path="/admin/championships" element={<ManageChampionships />} />
            <Route path="/admin/teams" element={<ManageTeams />} />
            <Route path="/admin/players" element={<ManagePlayers />} />
            <Route path="/admin/matches" element={<ManageMatches />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
