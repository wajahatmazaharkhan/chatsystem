import {
  LayoutDashboard,
  Users,
  Layers,
  Activity,
  MessageSquare,
  BookOpen,
  LogOut,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  BarChart3,
  Award,
} from "lucide-react";

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { handleLogout } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

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
      icon: <Activity size={20} />,
      children: [
        {
          name: "Activity Logs",
          path: "/dashboard/activity",
          icon: <ClipboardList size={16} />,
        },
        {
          name: "Monitoring Dashboard",
          path: "/dashboard/activity-monitoring",
          icon: <BarChart3 size={16} />,
        },
      ],
    },
    {
      name: "Chat",
      path: "/dashboard/chat",
      icon: <MessageSquare size={20} />,
    },
    {
      name: "Ranking",
      path: "/dashboard/ranking",
      icon: <Award size={20} />,
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
    {
      name: "Ranking",
      path: "/dashboard/ranking",
      icon: <Award size={20} />,
    },
  ],
  STUDENT: [
    {
      name: "Analytics",
      path: "/dashboard/analytics",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Batches",
      path: "/dashboard/student-batches",
      icon: <BookOpen size={20} />,
    },
    {
      name: "Chat",
      path: "/dashboard/chat",
      icon: <MessageSquare size={20} />,
    },
    {
      name: "Ranking",
      path: "/dashboard/ranking",
      icon: <Award size={20} />,
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
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({
    Activity: true,
  });

  const role = user?.role?.toUpperCase() || "STUDENT";
  const mappedRole = role === 'GROUP_MANAGER' ? 'MANAGER' : role;
  const rawNavItems = roleNavItems[mappedRole] || roleNavItems[role] || roleNavItems.STUDENT;

  const navItems = rawNavItems.filter(item => {
    if (item.name === "Users" || item.name === "Activity") {
      return hasPermission("VIEW_USERS");
    }
    if (item.name === "Batches") {
      return hasPermission("ASSIGN_GROUPS") || role === "STUDENT";
    }
    if (item.name === "Groups") {
      return hasPermission("MANAGE_GROUPS");
    }
    return true;
  });

  const getRoleMetadata = (r, roleType) => {
    const upperRole = r?.toUpperCase();
    if (upperRole === 'ADMIN') {
      return {
        sidebarSubtitle: "Admin Control Center",
        roleName: "System Administrator",
      };
    } else if (upperRole === 'SUB_ADMIN') {
      return {
        sidebarSubtitle: "Admin Control Center",
        roleName: "Sub-Admin",
      };
    } else if (upperRole === 'HEAD_HR') {
      const typeStr = roleType ? ` (${roleType === 'PUBLISHING' ? 'Publishing' : 'Non-Publishing'})` : '';
      return {
        sidebarSubtitle: "HR Control Center",
        roleName: `Head HR${typeStr}`,
      };
    } else if (upperRole === 'GROUP_MANAGER' || upperRole === 'MANAGER') {
      return {
        sidebarSubtitle: "Manager Control Center",
        roleName: "Group Manager",
      };
    } else if (upperRole === 'SUB_GROUP_MANAGER') {
      return {
        sidebarSubtitle: "Manager Control Center",
        roleName: "Sub Group Manager",
      };
    } else {
      return {
        sidebarSubtitle: "Student Portal",
        roleName: "Student",
      };
    }
  };

  const metadata = getRoleMetadata(user?.role, user?.roleType);

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
    <aside className="fixed left-0 top-0 w-72 h-screen bg-slate-900 border-r border-slate-800 flex flex-col z-20">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-3xl font-bold text-white">EduManager</h1>

        <p className="text-slate-400 mt-1">{metadata.sidebarSubtitle}</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            if (item.children) {
              const isOpen = openMenus[item.name];

              const isParentActive = item.children.some(
                (child) => location.pathname === child.path,
              );

              return (
                <div
                  key={item.name}
                  className={`rounded-2xl overflow-hidden transition-all
          ${
            isParentActive
              ? "bg-blue-500/10 border border-blue-500/20"
              : "bg-slate-900 border border-transparent"
          }`}
                >
                  {/* Parent */}

                  <button
                    onClick={() =>
                      setOpenMenus((prev) => ({
                        ...prev,
                        [item.name]: !prev[item.name],
                      }))
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 transition
            ${
              isParentActive
                ? "text-blue-400"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}

                      <span className="font-medium">{item.name}</span>
                    </div>

                    {isOpen ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>

                  {/* Children */}

                  <div
                    className={`transition-all duration-300 overflow-hidden
            ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="px-3 pb-3">
                      <div className="h-px bg-slate-800 mb-3" />

                      <div className="space-y-2">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.name}
                            to={child.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all
                      ${
                        isActive
                          ? "bg-blue-500 text-white shadow-lg"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`
                            }
                          >
                            {child.icon}

                            <span>{child.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
          ${
            isActive
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`
                }
              >
                {item.icon}

                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
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
            <h3 className="text-white font-medium">{user?.name || "User"}</h3>

            <p className="text-slate-400 text-sm">{metadata.roleName}</p>
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
