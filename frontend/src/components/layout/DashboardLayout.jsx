import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
    children,
}) {
    return (
        <div>
            <Sidebar />

            <div className="ml-64">
                <Navbar />

                <div className="p-8 bg-slate-800 min-h-screen">
                    {children}
                </div>
            </div>
        </div>
    );
}