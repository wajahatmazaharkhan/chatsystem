import React from 'react';

export default function StatCards({ stats = { total: 0, students: 0, managers: 0, admins: 0 } }) {
  const cards = [
    { title: 'Total users', value: stats.total, color: 'text-white' },
    { title: 'Students', value: stats.students, color: 'text-[#4fa4ff]' },
    { title: 'Managers', value: stats.managers, color: 'text-[#6ee7b7]' },
    { title: 'Admins', value: stats.admins, color: 'text-[#a78bfa]' },
  ];

  return (
    <div className="flex gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-[#242528] rounded-xl p-4 flex-1 border border-gray-700/50 flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="text-gray-400 text-sm font-medium z-10">{card.title}</div>
          <div className={`text-3xl font-semibold ${card.color} z-10`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
