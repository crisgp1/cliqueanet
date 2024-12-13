// src/pages/intranet/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Dashboard } from './Dashboard';
import CustomersPage from './customers';
import EmployeesPage from './employees';
import InventoryPage from './inventory';
import CreditsPage from './credits';
import TransactionsPage from './transactions';
import { ScannerConfig } from './settings/ScannerConfig';
import { authService } from '../../services/auth.service';

// Componente para proteger rutas de administrador
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = authService.getCurrentUser()?.id_rol === 1;
  
  if (!isAdmin) {
    return <Navigate to="/intranet/dashboard" replace />;
  }

  return <>{children}</>;
};

export const Intranet = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="credits" element={<CreditsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        
        {/* Rutas de configuración - solo para administradores */}
        <Route path="settings">
          <Route path="scanner" element={
            <AdminRoute>
              <ScannerConfig />
            </AdminRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="." />} />
      </Routes>
    </DashboardLayout>
  );
};