import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/layout';
import { AuthProvider } from '@/lib/auth-context';

// Pages
import Login from '@/pages/login';
import Dashboard from '@/pages/dashboard';
import Profile from '@/pages/profile';
import Teachers from '@/pages/teachers';
import TeacherDetail from '@/pages/teacher-detail';
import Transfers from '@/pages/transfers';
import TransferDetail from '@/pages/transfer-detail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 — user is simply not authenticated
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/teachers" component={Teachers} />
        <Route path="/teachers/:id" component={TeacherDetail} />
        <Route path="/transfers" component={Transfers} />
        <Route path="/transfers/:id" component={TransferDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
