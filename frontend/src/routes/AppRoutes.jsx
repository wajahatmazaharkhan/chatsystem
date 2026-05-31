import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DashboardLayout from "../components/layout/DashboardLayout";
import { fetchUserInfo } from '../services/authService';

// Module 3 components
import BatchCreate from "../pages/BatchCreate";
import BatchList from "../pages/BatchList";
import BatchDetails from "../pages/BatchDetails";
import GroupList from "../pages/GroupList";
import GroupDetails from "../pages/GroupDetails";

// Module 7 components
import AdminDashboard from '../pages/Analytics/AdminDashboard';
import ManagerDashboard from '../pages/Analytics/ManagerDashboard';
import StudentDashboard from '../pages/Analytics/StudentDashboard';

export default function AppRoutes() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserInfo().then((u) => {
            setUser(u);
            setLoading(false);
        }).catch(err => {
            console.error("Auth fetch failed:", err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    // Decide which dashboard to show based on user.role
    let DashboardComponent = AdminDashboard; // Default to admin for now
    if (user?.role === 'MANAGER') DashboardComponent = ManagerDashboard;
    if (user?.role === 'STUDENT') DashboardComponent = StudentDashboard;

    return (
        <BrowserRouter>
            <DashboardLayout>
                <Routes>
                    {/* Module 7 Dashboard Routes */}
                    <Route path="/" element={<DashboardComponent user={user} />} />
                    <Route 
                        path="/admin" 
                        element={user?.role === 'ADMIN' ? <AdminDashboard user={user} /> : <Navigate to="/" replace />} 
                    />
                    <Route 
                        path="/manager" 
                        element={user?.role === 'MANAGER' ? <ManagerDashboard user={user} /> : <Navigate to="/" replace />} 
                    />
                    <Route 
                        path="/student" 
                        element={user?.role === 'STUDENT' ? <StudentDashboard user={user} /> : <Navigate to="/" replace />} 
                    />

                    {/* Module 3 Routes */}
                    <Route path="/batches/create" element={<BatchCreate />} />
                    <Route path="/batches" element={<BatchList />} />
                    <Route path="/batches/:id" element={<BatchDetails />} />
                    <Route path="/groups" element={<GroupList />} />
                    <Route path="/groups/:id" element={<GroupDetails />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </DashboardLayout>
        </BrowserRouter>
    );
}
