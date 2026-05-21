import React from 'react';
import { LayoutDashboard, Users, MessageSquare, Route, UserCircle, HelpCircle } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: false },
    { icon: Users, label: 'Batches', active: false },
    { icon: MessageSquare, label: 'Communications', active: true },
    { icon: Route, label: 'Mapping', active: false },
    { icon: UserCircle, label: 'Profiles', active: false },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-full shrink-0">
      <div>
        {/* Branding Branding */}
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">EduManager</h2>
          <p className="text-xs text-gray-400 mt-0.5">Cohort Monitoring System</p>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  item.active
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 rounded-l-none -ml-4 pl-5'
                    : 'text-gray-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Premium Tier CTA */}
      <div className="p-4 m-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-500 text-sm">👑</span>
          <span className="text-sm font-semibold text-slate-800">Premium Plan</span>
        </div>
        <button className="text-left text-xs text-gray-400 mt-2 block hover:underline">
          Manage cookies or opt out
        </button>
      </div>
    </div>
  );
}