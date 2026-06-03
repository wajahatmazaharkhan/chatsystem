import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, ShieldAlert } from 'lucide-react';

function MessageBubble({ msg }) {
  const isMe = msg.isMe;
  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
      <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
        {!isMe && (
          <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-300 shrink-0">
            {(msg.sender || "Unknown")
  .split(" ")
  .map(w => w[0])
  .join("")
  .slice(0, 2)}
          </div>
        )}
        <span className="text-[11px] font-semibold text-slate-400">{msg.sender || "Unknown"}</span>
        <span className="text-[10px] text-slate-600">{msg.time}</span>
      </div>

      <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isMe
          ? 'bg-blue-600 text-white rounded-tr-sm shadow-lg shadow-blue-600/10'
          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
      }`}>
        {msg.text}
      </div>
    </div>
  );
}

export default function ChatArea({ messages, onSendMessage, readOnly }) {
  const [text, setText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || readOnly) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full min-w-0">
      {/* Message History */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
        {/* Date separator */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[11px] text-slate-500 font-medium px-2">Today</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-slate-600 text-xs text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-2">
              <Send className="w-4 h-4 text-slate-600" />
            </div>
            No messages yet
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-900 px-4 py-3 shrink-0">
        {readOnly ? (
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs text-amber-400/80">
              Monitoring mode — message input disabled for administrators
            </span>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className={`flex items-center gap-3 bg-slate-800 border rounded-xl px-3 py-2.5 transition-all duration-150 ${
                text.trim()
                  ? 'border-blue-500/40 ring-1 ring-blue-500/10'
                  : 'border-slate-700 focus-within:border-slate-600'
              }`}>
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-300 transition shrink-0"
                  tabIndex={-1}
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!text.trim()}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 shrink-0 ${
                    text.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20'
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="flex justify-between items-center mt-2 px-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center">
                  <span className="text-[8px] text-slate-500">✓</span>
                </div>
                <span>Synced to Activity Service</span>
              </div>
              <span className="text-[10px] text-slate-600 hidden sm:inline">
                Enter to send · Shift+Enter for newline
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}