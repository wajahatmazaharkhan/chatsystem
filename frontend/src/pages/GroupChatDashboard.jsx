// src/pages/GroupChatDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Note: Adjust these relative paths if your subcomponents are inside src/components/group or src/components/layout
import GroupList from '../components/chat/GroupList';
import ChatArea from '../components/chat/ChatArea';
import GroupRoster from '../components/chat/GroupRoster';

const initialGroups = [
  { id: 'g1', name: 'Fall 2024 - Alpha Group', membersCount: 7, lastActive: '10 mins ago', unread: 2 },
  { id: 'g2', name: 'Fall 2024 - Beta Group', membersCount: 5, lastActive: '2 hours ago', unread: 0 },
  { id: 'g3', name: 'Fall 2024 - Gamma Group', membersCount: 6, lastActive: '1 day ago', unread: 0 }
];

const initialRosters = {
  g1: [
    { id: 'STU-8821', name: 'Helena Hills', status: 'ACTIVE', initials: 'H' },
    { id: 'STU-4412', name: 'Julian Casablancas', status: 'ACTIVE', initials: 'J' },
    { id: 'STU-1102', name: 'Marcus Aurelius', status: 'ACTIVE', initials: 'M' },
    { id: 'STU-9901', name: 'Sarah Jenkins', status: 'INACTIVE', initials: 'S' }
  ],
  g2: [
    { id: 'STU-2044', name: 'Albert Camus', status: 'ACTIVE', initials: 'A' },
    { id: 'STU-5512', name: 'Franz Kafka', status: 'INACTIVE', initials: 'F' }
  ],
  g3: [
    { id: 'STU-1092', name: 'Jane Austen', status: 'ACTIVE', initials: 'J' },
    { id: 'STU-8831', name: 'Leo Tolstoy', status: 'ACTIVE', initials: 'L' },
    { id: 'STU-4402', name: 'Virginia Woolf', status: 'INACTIVE', initials: 'V' }
  ]
};

const initialChatHistories = {
  g1: [
    { id: 1, sender: 'Helena Hills', time: '09:41 AM', text: 'Hi everyone! Has anyone started the assignment yet?', isMe: false },
    { id: 2, sender: 'Julian Casablancas', time: '09:45 AM', text: 'I just started reading the requirements.', isMe: false }
  ],
  g2: [
    { id: 1, sender: 'Albert Camus', time: 'Yesterday', text: 'Does anyone understand the layout matrix?', isMe: false }
  ],
  g3: [
    { id: 1, sender: 'Leo Tolstoy', time: '2 days ago', text: 'Gamma group setup complete.', isMe: false }
  ]
  };

const BACKEND_URL = 'http://localhost:5000'; 

export default function GroupChatDashboard() {
  const [groups, setGroups] = useState(initialGroups);
  const [selectedGroup, setSelectedGroup] = useState(initialGroups[0]);
  const [chatHistories, setChatHistories] = useState(initialChatHistories);
  
  const socketRef = useRef(null);

  const currentRoster = initialRosters[selectedGroup.id] || [];
  const currentMessages = chatHistories[selectedGroup.id] || [];

  useEffect(() => {
    const token = 'YOUR_JWT_AUTH_TOKEN_HERE';

    socketRef.current = io(BACKEND_URL, { auth: { token } });

    socketRef.current.on('connect', () => {
      console.log('Connected to backend Socket.io server with ID:', socketRef.current.id);
    });

    socketRef.current.on('message_received', (data) => {
      setChatHistories(prev => ({
        ...prev,
        [data.groupId]: [...(prev[data.groupId] || []), {
          id: data.id,
          sender: data.sender,
          time: data.time,
          text: data.text,
          isMe: data.isMe
        }]
      }));
    });

    socketRef.current.on('error_message', (errorMessage) => {
      console.error('Socket server error encountered:', errorMessage);
      alert(`Server Notice: ${errorMessage}`);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;
    const activeGroupId = selectedGroup.id;
    
    socketRef.current.emit('join_group', activeGroupId);
    return () => {
      socketRef.current.emit('leave_group', activeGroupId);
    };
  }, [selectedGroup]);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setGroups(prevGroups => 
      prevGroups.map(g => g.id === group.id ? { ...g, unread: 0 } : g)
    );
  };

  const handleSendMessage = (text) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = { id: Date.now(), sender: 'Dr. Alistair Vance', time: timeString, text, isMe: true };

    setChatHistories(prev => ({
      ...prev,
      [selectedGroup.id]: [...(prev[selectedGroup.id] || []), newMessage]
    }));

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', {
        groupId: selectedGroup.id,
        text: text,
        sender: 'Dr. Alistair Vance',
        time: timeString
      });
    }
  };

  const handleBroadcast = () => {
    alert(`Broadcast system triggered for: ${selectedGroup.name}`);
  };

  const handleExportLogs = () => {
    alert(`Log traces for ${selectedGroup.name} captured!`);
  };

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Interactive Title Header Section */}
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
            <button onClick={handleExportLogs} className="px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition active:scale-95">
              Export Logs
            </button>
            <button onClick={handleBroadcast} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center space-x-2 transition active:scale-95">
              <span>Send Broadcast</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-8 min-h-0">
        <div className="col-span-3 flex flex-col min-h-0">
          <GroupList groups={groups} selectedGroup={selectedGroup} onSelectGroup={handleSelectGroup} />
        </div>

        <div className="col-span-9 border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col min-h-0 shadow-sm">
          <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold tracking-wide text-xs uppercase text-slate-300">2. Group Chat:</span>
              <span className="font-bold text-sm">{selectedGroup.name}</span>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
            <ChatArea messages={currentMessages} onSendMessage={handleSendMessage} />
            <GroupRoster roster={currentRoster} />
          </div>
        </div>
      </div>
    </div>
  );
}