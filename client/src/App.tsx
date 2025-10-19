import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Residents from "@/pages/residents";
import Teachers from "@/pages/teachers";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";
import  Setting  from "@/pages/setting";
import  About  from "@/pages/about";
import VacantPosts from "@/components/jobs/VacantPosts";
//////////////////////////////////////
 import { TrainerProvider } from "./context/TrainerContext"; // ✅ context اضافه شد


/////////////////////////////////

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Residents} />
          <Route path="/residents" component={Residents} />
          

          <Route path="/teachers" component={Teachers} />
          <Route path="/reports" component={Reports} />
          <Route path="/setting" component={Setting} />
          <Route path="/about" component={About} />
          <Route path="/jobs" component={VacantPosts} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
     <TrainerProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
     </TrainerProvider>
  );
}

export default App;
