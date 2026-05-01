import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { MailCraftDashboardLayout } from "./components/MailCraftDashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Protected routes that require authentication
  if (isAuthenticated) {
    return (
      <MailCraftDashboardLayout>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/campaigns" component={() => <div>Campaigns Page</div>} />
          <Route path="/subscribers" component={() => <div>Subscribers Page</div>} />
          <Route path="/segments" component={() => <div>Segments Page</div>} />
          <Route path="/templates" component={() => <div>Templates Page</div>} />
          <Route path="/settings" component={() => <div>Settings Page</div>} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </MailCraftDashboardLayout>
    );
  }

  // Public routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
