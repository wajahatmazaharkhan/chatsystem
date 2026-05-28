import { useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Reports",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Teams",
      icon: <Users size={20} />,
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-5 left-5 z-50 bg-[#12182B] p-2 rounded-lg border border-white/10"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
        fixed md:static top-0 left-0 z-50
        h-screen w-[260px]
        bg-[#0E1428]
        border-r border-white/10
        p-6
        flex flex-col justify-between
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                DevTracker
              </h1>

              <p className="text-sm text-gray-400 mt-1">
                Team Supervision
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="md:hidden"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mt-10 space-y-3">
            {navItems.map((item, index) => (
              <button
                key={index}
                className={`
                w-full flex items-center gap-4
                px-4 py-3 rounded-xl
                transition-all duration-300
                hover:bg-[#151D35]
                hover:translate-x-1
                ${
                  index === 0
                    ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/10"
                    : "text-gray-300"
                }
              `}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;