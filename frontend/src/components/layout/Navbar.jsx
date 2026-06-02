import {
  Settings,
} from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-8 flex justify-between items-center">
      
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Admin Dashboard
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 transition">
          <Settings size={14} className="text-slate-300" />
        </button>

        <div className="flex items-center gap-3 bg-slate-800 px-4 py-1 rounded-xl">
          <img
            src="https://i.pravatar.cc/50"
            alt="Admin"
            className="w-8 h-8 rounded-full"
          />

          <div>
            <h3 className="text-white text-sm font-medium">
              Admin
            </h3>

            <p className="text-slate-400 text-xs">
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}