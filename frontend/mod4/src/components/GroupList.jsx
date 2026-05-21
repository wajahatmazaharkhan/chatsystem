import React from 'react';
import { Search, Info, Users } from 'lucide-react';

export default function GroupList({ groups, selectedGroup, onSelectGroup }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full shadow-sm">
      {/* Panel Header block */}
      <div className="p-4 bg-slate-900 text-white rounded-t-xl flex justify-between items-center shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-wider">1. Assigned Groups</h3>
        <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white" />
      </div>

      {/* Inner Lookup Filter input */}
      <div className="p-3 border-b border-slate-100 shrink-0">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Groups Queue */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {groups.map((group) => {
          const isSelected = group.id === selectedGroup.id;
          return (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={`w-full text-left p-3 rounded-lg transition relative ${
                isSelected ? 'bg-blue-50/70 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex justify-between items-start">
                <h4 className={`text-sm font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                  {group.name}
                </h4>
                {group.unread > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {group.unread}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{group.membersCount} members</span>
                </div>
                <span>{group.lastActive}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}