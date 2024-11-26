// src/pages/intranet/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Dashboard } from './Dashboard';

export const Intranet= () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="." />} />
      </Routes>
    </DashboardLayout>
  );
};