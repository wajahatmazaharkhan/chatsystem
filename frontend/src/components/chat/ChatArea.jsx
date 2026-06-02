import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send } from 'lucide-react';

export default function ChatArea({ messages, onSendMessage }) {
  const [text, setText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 h-full border-r border-slate-100 min-w-0">
      {/* Scrollable Message History pipeline */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-center my-2">
          <span className="bg-white px-3 py-1 rounded-full text-[11px] font-medium text-gray-400 border border-slate-100 shadow-sm">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center space-x-2 mb-1 px-1">
              <span className="text-xs font-semibold text-slate-700">{msg.sender}</span>
              <span className="text-[10px] text-gray-400">{msg.time}</span>
            </div>
            
            <div className={`max-w-md rounded-xl p-3.5 shadow-sm text-sm ${
              msg.isMe 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form layout */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition">
          <button type="button" className="text-gray-400 hover:text-gray-600">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-slate-800"
          />
          
          <button 
            type="submit" 
            className={`p-1.5 rounded-md transition ${text.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-300 pointer-events-none'}`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-2.5 px-1">
          <div className="flex items-center space-x-1.5 text-[11px] text-gray-400">
            <span className="inline-block w-3.5 h-3.5 border border-gray-300 rounded-full text-[9px] text-center leading-3 font-bold">✓</span>
            <span>Messages automatically synced to Activity Service (Module 5)</span>
          </div>
          <span className="text-[10px] text-gray-400 hidden sm:inline">
            Press Enter to send, Shift + Enter for new line
          </span>
        </div>
      </form>
    </div>
  );
}