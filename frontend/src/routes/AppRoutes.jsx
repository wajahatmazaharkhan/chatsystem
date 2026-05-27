import { Routes, Route } from 'react-router-dom';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AnalyticsDashboard />} />
      <Route path="*" element={<AnalyticsDashboard />} />
    </Routes>
  );
}
