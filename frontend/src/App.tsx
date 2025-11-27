import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Clients from './pages/Clients/Clients';
import Reservations from './pages/Reservations/Reservations';
import Properties from './pages/Properties/Properties';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/properties" element={<Properties />} />
      </Routes>
    </Layout>
  );
}

export default App;

