import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import WorkflowManagementPage from './pages/WorkflowManagementPage';
import ModulePlaceholderPage from './pages/ModulePlaceholderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="staff-management" element={<ModulePlaceholderPage title="Staff Management" />} />
        <Route path="resource-management" element={<ModulePlaceholderPage title="Resource Management" />} />
        <Route path="workflow-management" element={<WorkflowManagementPage />} />
        <Route path="machine-management" element={<ModulePlaceholderPage title="Machine Management" />} />
        <Route path="order-management" element={<ModulePlaceholderPage title="Order Management" />} />
        <Route path="shipment-management" element={<ModulePlaceholderPage title="Shipment Management" />} />
        <Route path="analytics" element={<ModulePlaceholderPage title="Analytics Dashboard" />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
