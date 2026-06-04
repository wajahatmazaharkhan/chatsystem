import { Settings } from "lucide-react";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const roleLabels = {
    ADMIN: "Super Admin",
    MANAGER: "Manager",
    STUDENT: "Student",
  };

  let title = "Dashboard";

  if(user?.role === "ADMIN") {
    title = "Admin Dashboard";
  } else if(user?.role === "MANAGER") {
    title = "Manager Dashboard";
  } else if(user?.role === "STUDENT") {
    title = "Student Dashboard";
  }
  
  return (
    <header className="fixed top-0 left-72 right-0 h-14 bg-slate-900 border-b border-slate-800 px-8 flex justify-between items-center">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 transition">
          <Settings size={14} className="text-slate-300" />
        </button>

        <div className="flex items-center gap-3 bg-slate-800 px-4 py-1 rounded-xl">
          <img
            src={
              user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`
            }
            alt={user?.name}
            className="w-8 h-8 rounded-full"
          />

          <div>
            <h3 className="text-white text-sm font-medium">{user?.name}</h3>

            <p className="text-slate-400 text-xs">{roleLabels[user?.role]}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
