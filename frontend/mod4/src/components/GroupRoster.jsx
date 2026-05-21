import React from 'react';

export default function GroupRoster({ roster }) {
  return (
    <div className="w-60 flex flex-col bg-white h-full shrink-0">
      {/* Roster Subsection header */}
      <div className="p-4 border-b border-slate-100 shrink-0">
        <h4 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Group Roster</h4>
      </div>

      {/* User listing stack */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {roster.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-1">
            <div className="flex items-center space-x-3">
              {/* Initials Avatar Badge */}
              <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-700 font-semibold text-xs shadow-sm">
                {member.initials}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{member.name}</p>
                <p className="text-[10px] text-gray-400 font-mono">#{member.id}</p>
              </div>
            </div>

            {/* Status dynamic tag styling */}
            <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
              member.status === 'ACTIVE' 
                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}>
              {member.status}
            </span>
          </div>
        ))}
      </div>

      {/* Footer Administration Utility CTA */}
      <div className="p-4 border-t border-slate-100 shrink-0">
        <button className="w-full py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 shadow-sm transition">
          Manage Members
        </button>
      </div>
    </div>
  );
}