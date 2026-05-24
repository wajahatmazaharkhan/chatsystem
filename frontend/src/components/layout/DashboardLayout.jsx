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

                <div className="p-8 bg-[#f5f7fb] min-h-screen">
                    {children}
                </div>
            </div>
        </div>
    );
}