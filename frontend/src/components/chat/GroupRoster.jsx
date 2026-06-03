import React from 'react';
import { UserCog } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
];

function getAvatarColor(name) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function GroupRoster({ roster }) {
  return (
    <div className="w-56 flex flex-col bg-slate-900 border-l border-slate-800 shrink-0 h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Group Roster
        </span>
        <p className="text-[10px] text-slate-600 mt-0.5">
          {roster.length} {roster.length === 1 ? 'member' : 'members'}
        </p>
      </div>

      {/* Members */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {roster.map((member) => {
          const avatarColor = getAvatarColor(member.name);
          const isActive = member.status === 'ACTIVE';
          return (
            <div
              key={member.id}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-800/60 transition group"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold ${avatarColor}`}>
                  {member.initials}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                  isActive ? 'bg-emerald-500' : 'bg-slate-600'
                }`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                  {member.name}
                </p>
                <p className={`text-[10px] font-medium tracking-wide ${
                  isActive ? 'text-emerald-500' : 'text-slate-500'
                }`}>
                  {isActive ? 'Active' : 'Offline'}
                </p>
              </div>
            </div>
          );
        })}

        {roster.length === 0 && (
          <div className="text-center text-xs text-slate-600 py-8">
            No members
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        <button className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all duration-150">
          <UserCog className="w-3.5 h-3.5" />
          Manage Members
        </button>
      </div>
    </div>
  );
}