import {
    LayoutDashboard,
    Users,
    Layers,
    User,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navItems = [
    {
        name: "Dashboard",
        path: "/",
        icon: <LayoutDashboard size={18} />,
    },

    {
        name: "Batches",
        path: "/batches",
        icon: <Users size={18} />,
    },

    {
        name: "Groups",
        path: "/groups",
        icon: <Layers size={18} />,
    },

    {
        name: "Profile",
        path: "/profile",
        icon: <User size={18} />,
    },
];

export default function Sidebar() {
    return (
        <div className="w-64 h-screen bg-white border-r fixed left-0 top-0">
            <div className="p-8">
                <h1 className="font-bold text-3xl">
                    EduManager
                </h1>

                <p className="text-gray-500">
                    Admin Console
                </p>
            </div>

            <div className="mt-6">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-8 py-4 ${
                                isActive
                                    ? "bg-blue-50 border-r-4 border-blue-700 text-blue-700"
                                    : "hover:bg-gray-100"
                            }`
                        }
                    >
                        {item.icon}

                        {item.name}
                    </NavLink>
                ))}
            </div>
        </div>
    );
}