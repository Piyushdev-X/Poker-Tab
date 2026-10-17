// client/src/components/ChatDrawer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Shield, Users, MessageSquare } from 'lucide-react';

const QUICK_EMOTES = ['🔥', '💀', '🚀', '👑', '🧊', '🎯', '🤑', '🍿'];

export default function ChatDrawer({
  isOpen,
  onClose,
  messages = [],
  onSendMessage,
  myPlayer
}) {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'TEAM'
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const myTeam = myPlayer?.team || 'ALPHA';

  const filteredMessages = messages.filter(m => {
    if (activeTab === 'TEAM') {
      return m.channel === 'TEAM' && m.team === myTeam;
    }
    return m.channel === 'ALL';
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, filteredMessages.length]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), activeTab);
    setInputText('');
  };

  const handleEmoteClick = (emote) => {
    onSendMessage(emote, activeTab);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-50"
          />

          {/* Slide-over Sheet: Creamy Parchment */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#FAF7F2] border-l border-[#E2D9C8] shadow-clay-ambient z-50 flex flex-col p-4 overflow-hidden"
          >
            {/* Header & Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2D9C8]">
              <div className="flex items-center gap-1 bg-[#EAE2D3]/70 p-1 rounded-xl border border-[#DCD2C0]">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    activeTab === 'ALL'
                      ? 'bg-[#FAF7F2] text-[#2C2623] border border-[#E2D9C8] shadow-xs font-bold'
                      : 'text-[#6E6259] hover:text-[#2C2623]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
                <button
                  onClick={() => setActiveTab('TEAM')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    activeTab === 'TEAM'
                      ? 'bg-[#E6F0FA] text-[#36638F] border border-[#B3D1F0] shadow-xs font-bold'
                      : 'text-[#6E6259] hover:text-[#2C2623]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-[#36638F]" />
                  <span>Team {myTeam}</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-white border border-[#E2D9C8] text-[#6E6259] transition-all active:scale-[0.95] cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Emotes Bar */}
            <div className="flex items-center justify-between py-2 border-b border-[#E2D9C8]">
              {QUICK_EMOTES.map((emote) => (
                <button
                  key={emote}
                  onClick={() => handleEmoteClick(emote)}
                  className="p-1.5 rounded-lg hover:bg-[#EAE2D3]/60 transition-transform active:scale-125 text-base cursor-pointer"
                >
                  {emote}
                </button>
              ))}
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#9A8E84] text-xs font-mono text-center p-4">
                  <MessageSquare className="w-6 h-6 mb-2 opacity-40 text-[#9A8E84]" />
                  No messages yet in {activeTab === 'ALL' ? 'Table Chat' : `Team ${myTeam} Comms`}.
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isMe = msg.senderId === myPlayer?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-mono text-[#6E6259] font-medium">
                          {msg.senderName}
                        </span>
                        {msg.team && (
                          <span className="text-[8px] font-mono px-1 rounded bg-[#EAE2D3] text-[#6E6259] border border-[#DCD2C0]">
                            {msg.team}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-[#9A8E84]">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-2xl text-xs max-w-[85%] break-words ${
                          isMe
                            ? 'bg-[#FDF3D7] text-[#9E7223] border border-[#F2D08B] font-medium rounded-tr-none shadow-xs'
                            : 'bg-[#FAF7F2] border border-[#E2D9C8] text-[#2C2623] rounded-tl-none shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="pt-2 border-t border-[#E2D9C8] flex items-center gap-2">
              <input
                type="text"
                placeholder={activeTab === 'ALL' ? 'Message entire table...' : `Message Team ${myTeam}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#EAE2D3]/50 border border-[#DCD2C0] rounded-xl px-3 py-2 text-xs font-mono text-[#2C2623] placeholder:text-[#9A8E84] focus:outline-none focus:border-[#8C4A1D]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-[#FBE5D2] hover:bg-[#F7D5B8] text-[#8C4A1D] border border-[#E3B48D] border-b-2 border-b-[#CFA992] disabled:opacity-40 transition-all active:translate-y-[1px] cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
