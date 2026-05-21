import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import GroupList from './components/GroupList';
import ChatArea from './components/ChatArea';
import GroupRoster from './components/GroupRoster';

// Mock Data representing a database or API response
const initialGroups = [
  { id: 'g1', name: 'Fall 2024 - Alpha Group', membersCount: 7, lastActive: '10 mins ago', unread: 2 },
  { id: 'g2', name: 'Fall 2024 - Beta Group', membersCount: 7, lastActive: '2 hours ago', unread: 0 },
  { id: 'g3', name: 'Fall 2024 - Gamma Group', membersCount: 6, lastActive: '1 day ago', unread: 0 }
];

const initialRoster = [
  { id: 'STU-8821', name: 'Helena Hills', status: 'ACTIVE', initials: 'H' },
  { id: 'STU-4412', name: 'Julian Casablancas', status: 'ACTIVE', initials: 'J' },
  { id: 'STU-1102', name: 'Marcus Aurelius', status: 'ACTIVE', initials: 'M' },
  { id: 'STU-9901', name: 'Sarah Jenkins', status: 'INACTIVE', initials: 'S' }
];

const initialMessages = [
  { id: 1, sender: 'Helena Hills', time: '09:41 AM', text: 'Hi everyone! Has anyone started the assignment yet?', isMe: false },
  { id: 2, sender: 'Julian Casablancas', time: '09:45 AM', text: 'I just started reading the requirements.', isMe: false },
  { id: 3, sender: 'Dr. Alistair Vance', time: '10:02 AM', text: 'Let me know if you need any clarifications on the scope.', isMe: true }
];

export default function App() {
  const [groups, setGroups] = useState(initialGroups);
  const [selectedGroup, setSelectedGroup] = useState(initialGroups[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [roster, setRoster] = useState(initialRoster);

  const handleSendMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      sender: 'Dr. Alistair Vance',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text,
      isMe: true
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopNavbar />
        
        {/* Dashboard Dynamic Header */}
        <div className="px-8 pt-6 pb-2">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-400 font-medium space-x-2">
                <span>Dashboard</span> <span>&rsaquo;</span> 
                <span>Communications</span> <span>&rsaquo;</span> 
                <span className="text-blue-600 font-semibold">Group Chat</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Cohort Monitoring & Chat</h1>
              <p className="text-sm text-gray-500 mt-0.5">Real-time group messaging and activity tracking dashboard.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition">
                Export Logs
              </button>
              <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center space-x-2 transition">
                <span>Send Broadcast</span>
                <svg className="w-4 h-4 transform rotate-45 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Layout Grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 p-8 min-h-0">
          {/* Section 1: Assigned Groups panel */}
          <div className="col-span-3 flex flex-col min-h-0">
            <GroupList 
              groups={groups} 
              selectedGroup={selectedGroup} 
              onSelectGroup={setSelectedGroup} 
            />
          </div>

          {/* Section 2 & 3 Combined Window (Chat + Roster) */}
          <div className="col-span-9 border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col min-h-0 shadow-sm">
            {/* Window Header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <span className="font-semibold tracking-wide text-xs uppercase text-slate-300">2. Group Chat:</span>
                <span className="font-bold text-sm">{selectedGroup.name}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span>ID: {selectedGroup.id}</span>
                <button className="hover:text-white"><span className="text-lg font-bold">⋮</span></button>
              </div>
            </div>

            {/* Split Pane: Main Chat and Right Sidebar Roster */}
            <div className="flex flex-1 min-h-0 split-container">
              <ChatArea messages={messages} onSendMessage={handleSendMessage} />
              <GroupRoster roster={roster} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}