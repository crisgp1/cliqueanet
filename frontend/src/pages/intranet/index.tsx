// src/pages/intranet/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Dashboard } from './Dashboard';
import CustomersPage from './customers';
import EmployeesPage from './employees';
import InventoryPage from './inventory';
import CreditsPage from './Credits';

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
        <Route path="*" element={<Navigate to="." />} />
      </Routes>
    </DashboardLayout>
  );
};