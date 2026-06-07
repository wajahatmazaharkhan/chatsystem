// import React, { useState } from 'react';
// import { Search, Info, Users, Circle } from 'lucide-react';

// export default function GroupList({ groups, selectedGroup, onSelectGroup }) {
//   const [searchQuery, setSearchQuery] = useState('');

//   const filteredGroups = groups.filter(group =>
//     group.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
//       {/* Header */}
//       <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center shrink-0">
//         <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
//           1. Assigned Groups
//         </span>
//         <Info className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-pointer transition" />
//       </div>

//       {/* Search */}
//       <div className="px-3 py-2.5 border-b border-slate-800 shrink-0">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search groups..."
//             className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition"
//           />
//         </div>
//       </div>

//       {/* Groups */}
//       <div className="flex-1 overflow-y-auto p-2 space-y-1">
//         {filteredGroups.length > 0 ? (
//           filteredGroups.map((group) => {
//             const isSelected = selectedGroup && group.id === selectedGroup.id;
//             return (
//               <button
//                 key={group.id}
//                 onClick={() => onSelectGroup(group)}
//                 className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-150 relative ${
//                   isSelected
//                     ? 'bg-blue-600/15 border border-blue-500/30'
//                     : 'hover:bg-slate-800/70 border border-transparent hover:border-slate-700/50'
//                 }`}
//               >
//                 <div className="flex justify-between items-start mb-1.5">
//                   <span className={`text-sm font-semibold truncate pr-2 ${
//                     isSelected ? 'text-blue-400' : 'text-slate-200'
//                   }`}>
//                     {group.name}
//                   </span>
//                   {group.unread > 0 && (
//                     <span className="bg-blue-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full font-bold shrink-0">
//                       {group.unread}
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex justify-between items-center text-[11px]">
//                   <div className="flex items-center gap-1 text-slate-500">
//                     <Users className="w-3 h-3" />
//                     <span>{group.membersCount} members</span>
//                   </div>
//                   <div className="flex items-center gap-1 text-emerald-500">
//                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
//                     <span>{group.lastActive}</span>
//                   </div>
//                 </div>
//               </button>
//             );
//           })
//         ) : (
//           <div className="text-center text-xs text-slate-600 py-10">
//             No groups match your search.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { Search, Info, Users, Circle } from 'lucide-react';

export default function GroupList({ groups, selectedGroup, onSelectGroup }) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          1. Assigned Groups
        </span>
        <Info className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-pointer transition" />
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-slate-800 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition"
          />
        </div>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const isSelected = selectedGroup && group.id === selectedGroup.id;
            return (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-150 relative ${
                  isSelected
                    ? 'bg-blue-600/15 border border-blue-500/30'
                    : 'hover:bg-slate-800/70 border border-transparent hover:border-slate-700/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-sm font-semibold truncate pr-2 ${
                    isSelected ? 'text-blue-400' : 'text-slate-200'
                  }`}>
                    {group.name}
                  </span>
                  {group.unread > 0 && (
                    <span className="bg-blue-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full font-bold shrink-0">
                      {group.unread}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Users className="w-3 h-3" />
                    <span>{group.membersCount} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>{group.lastActive}</span>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center text-xs text-slate-600 py-10">
            No groups match your search.
          </div>
        )}
      </div>
    </div>
  );
}