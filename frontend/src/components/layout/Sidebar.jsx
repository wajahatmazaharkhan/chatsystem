import {
  LayoutDashboard,
  Users,
  Layers,
  Activity,
  MessageSquare,
  BookOpen,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { handleLogout } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const roleNavItems = {
  ADMIN: [
    {
      name: "Analytics",
      path: "/dashboard/analytics",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Users",
      path: "/dashboard/users",
      icon: <Users size={20} />,
    },
    {
      name: "Batches",
      path: "/dashboard/batches",
      icon: <BookOpen size={20} />,
    },
    {
      name: "Groups",
      path: "/dashboard/groups",
      icon: <Layers size={20} />,
    },
    {
      name: "Activity",
      path: "/dashboard/activity",
      icon: <Activity size={20} />,
    },
    {
      name: "Chat",
      path: "/dashboard/chat",
      icon: <MessageSquare size={20} />,
    },
  ],
  MANAGER: [
    {
      name: "Analytics",
      path: "/dashboard/analytics",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Groups",
      path: "/dashboard/groups",
      icon: <Layers size={20} />,
    },
    {
      name: "Chat",
      path: "/dashboard/chat",
      icon: <MessageSquare size={20} />,
    },
  ],
  STUDENT: [
    {
      name: "Analytics",
      path: "/dashboard/analytics",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Chat",
      path: "/dashboard/chat",
      icon: <MessageSquare size={20} />,
    },
  ],
};

const roleMetadata = {
  ADMIN: {
    sidebarSubtitle: "Admin Control Center",
    roleName: "System Administrator",
  },
  MANAGER: {
    sidebarSubtitle: "Manager Control Center",
    roleName: "Group Manager",
  },
  STUDENT: {
    sidebarSubtitle: "Student Portal",
    roleName: "Student",
  },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role?.toUpperCase() || "STUDENT";
  const navItems = roleNavItems[role] || roleNavItems.STUDENT;
  const metadata = roleMetadata[role] || roleMetadata.STUDENT;

  const logoutUser = async () => {
    try {
      await handleLogout();
    } catch (err) {
      console.error(err);
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-3xl font-bold text-white">
          EduManager
        </h1>

        <p className="text-slate-400 mt-1">
          {metadata.sidebarSubtitle}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.icon}
              <span className="font-medium">
                {item.name}
              </span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/50"
            alt={role}
            className="w-12 h-12 rounded-full"
          />

          <div>
            <h3 className="text-white font-medium">
              {user?.name || "User"}
            </h3>

            <p className="text-slate-400 text-sm">
              {metadata.roleName}
            </p>
          </div>
        </div>

        <button
          onClick={logoutUser}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-red-500/10 text-red-400 py-2 rounded-lg hover:bg-red-500/20 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}