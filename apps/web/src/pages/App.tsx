import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './Login';
import ConnectionsPage from './Connections';
import WorkbenchPage from './Workbench';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/connections" element={<ConnectionsPage />} />
      <Route path="/workbench" element={<WorkbenchPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}


