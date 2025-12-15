import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Clients from './pages/Clients/Clients';
import Reservations from './pages/Reservations/Reservations';
import Properties from './pages/Properties/Properties';
import Login from './pages/Login/Login';
import AuthSuccess from './pages/AuthSuccess/AuthSuccess';
import { usePageTracking } from './hooks/useApplicationInsights';

function App() {
  // Automatically track page views on route changes
  usePageTracking();

  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <Reservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties"
            element={
              <ProtectedRoute>
                <Properties />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;

