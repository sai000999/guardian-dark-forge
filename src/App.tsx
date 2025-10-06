import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import BotStatus from "./pages/BotStatus";
import Blacklist from "./pages/Blacklist";
import Tickets from "./pages/Tickets";
import ModLogs from "./pages/ModLogs";
import Levels from "./pages/Levels";
import Economy from "./pages/Economy";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/status" element={<BotStatus />} />
            <Route path="/blacklist" element={<Blacklist />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/logs" element={<ModLogs />} />
            <Route path="/levels" element={<Levels />} />
            <Route path="/economy" element={<Economy />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
