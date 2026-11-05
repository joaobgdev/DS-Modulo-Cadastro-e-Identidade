import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { AuthProvider } from './context/auth-context';
import { ThemeProvider } from './context/theme-context';
import { AuthLayout } from './components/layout/auth-layout';
import { ProtectedRoute } from './components/layout/protected-route';
import { DashboardPage } from './pages/dashboard-page';
import { LoginPage } from './pages/login-page';
import { ProfilePage } from './pages/profile-page';
import { UsersPage } from './pages/users-page';
import { SchedulesMfe } from './components/mfe/schedules-mfe';
import { SuppliesMfe } from './components/mfe/supplies-mfe';
import { BpaMfe } from './components/mfe/bpa-mfe';
import { AnalyticsMfe } from './components/mfe/analytics-mfe';
import { RecordsMfe } from './components/mfe/records-mfe';
import { TemplatesMfe } from './components/mfe/templates-mfe';
import { TelehealthMfe } from './components/mfe/telehealth-mfe';
import { DemoMfe } from './components/mfe/demo-mfe';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const status = (error as { status?: number })?.status;
      if (status === 401 && window.location.pathname !== '/login') {
        window.location.href = `/login?returnTo=${encodeURIComponent(
          window.location.pathname + window.location.search,
        )}`;
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AuthLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/schedules/*" element={<SchedulesMfe />} />
                <Route path="/supplies/*" element={<SuppliesMfe />} />
                <Route path="/bpa/*" element={<BpaMfe />} />
                <Route path="/analytics/*" element={<AnalyticsMfe />} />
                <Route path="/records/*" element={<RecordsMfe />} />
                <Route path="/templates/*" element={<TemplatesMfe />} />
                <Route path="/telehealth/*" element={<TelehealthMfe />} />
                <Route path="/demo/*" element={<DemoMfe />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 
