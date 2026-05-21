import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

export default function TopNavbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
      {/* Omnibox Search Bar */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </span>
        <input
          type="text"
          placeholder="Search resources..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
        />
      </div>

      {/* Controls & Current Profile view */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4 text-gray-400">
          <button className="hover:text-slate-600 transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="hover:text-slate-600 transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">Dr. Alistair Vance</p>
            <p className="text-xs text-gray-400">Group Manager</p>
          </div>
          <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            AV
          </div>
        </div>
      </div>
    </header>
  );
}