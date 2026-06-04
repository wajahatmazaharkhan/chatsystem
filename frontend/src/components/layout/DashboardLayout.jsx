import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="bg-slate-950 text-white min-h-screen flex">
      <Sidebar />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-8 pt-15">
          <Outlet />
        </main>
      </div>
    </div>
  );
}