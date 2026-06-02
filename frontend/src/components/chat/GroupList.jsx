import React, { useState } from 'react';
import { Search, Info, Users } from 'lucide-react';

export default function GroupList({ groups, selectedGroup, onSelectGroup }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Live calculation of filtered groups based on query inputs
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full shadow-sm text-left">
      {/* Panel Header */}
      <div className="p-4 bg-slate-900 text-white rounded-t-xl flex justify-between items-center shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-wider">1. Assigned Groups</h3>
        <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white" />
      </div>

      {/* Interactive Search Bar */}
      <div className="p-3 border-b border-slate-100 shrink-0">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Filtered Groups Display */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const isSelected = group.id === selectedGroup.id;
            return (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className={`w-full text-left p-3 rounded-lg transition relative block border ${
                  isSelected 
                    ? 'bg-blue-50/70 border-blue-200 shadow-xs' 
                    : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className={`text-sm font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                    {group.name}
                  </h4>
                  {group.unread > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ml-2">
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
          })
        ) : (
          <div className="text-center text-xs text-gray-400 py-8">
            No groups match your search.
          </div>
        )}
      </div>
    </div>
  );
}