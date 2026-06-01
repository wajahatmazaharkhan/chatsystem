import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
    return (
        <div>
            <Sidebar />

            <div className="ml-64">
                <Navbar />

                <div className="p-8 bg-slate-800 min-h-screen">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}