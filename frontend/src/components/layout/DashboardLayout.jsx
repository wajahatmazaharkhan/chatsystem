import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="bg-slate-950 text-white h-screen overflow-hidden flex">
      <Sidebar />

      <div className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-8 pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}