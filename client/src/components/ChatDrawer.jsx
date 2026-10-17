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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Slide-over Sheet: Crisp Porcelain & Editorial Linen */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#FFFFFF] border-l-2 border-[#D5CCC0] shadow-2xl z-50 flex flex-col p-4 overflow-hidden select-none"
          >
            {/* Header & Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D5CCC0]">
              <div className="flex items-center gap-1.5 bg-[#F7F4EE] p-1 rounded-xl border border-[#D5CCC0]">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'ALL'
                      ? 'bg-[#FFFFFF] text-[#121110] border border-[#D5CCC0] shadow-xs font-black'
                      : 'text-[#6E645A] hover:text-[#121110] font-bold'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>TABLE</span>
                </button>
                <button
                  onClick={() => setActiveTab('TEAM')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'TEAM'
                      ? 'bg-[#DBEAFE] text-[#1E40AF] border border-[#3B82F6] shadow-xs font-black'
                      : 'text-[#6E645A] hover:text-[#121110] font-bold'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-[#1E40AF]" />
                  <span>TEAM {myTeam}</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-[#F7F4EE] hover:bg-[#EAE3D6] border border-[#D5CCC0] text-[#121110] transition-all active:scale-[0.95] cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Emote Reactions Bar */}
            <div className="flex items-center justify-between py-2.5 px-1 border-b border-[#D5CCC0]">
              {QUICK_EMOTES.map((em, idx) => (
                <button
                  key={idx}
                  onClick={() => handleEmoteClick(em)}
                  className="w-8 h-8 rounded-lg bg-[#F7F4EE] hover:bg-[#FEF3C7] border border-[#D5CCC0] flex items-center justify-center text-sm transition-transform active:scale-125 cursor-pointer shadow-xs"
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#6E645A] text-xs font-mono font-bold text-center p-4">
                  <MessageSquare className="w-8 h-8 text-[#D5CCC0] mb-2" />
                  No messages yet in {activeTab === 'TEAM' ? `Team ${myTeam}` : 'Table'} comms.
                </div>
              ) : (
                filteredMessages.map((msg, i) => {
                  const isMe = msg.playerId === myPlayer?.id;
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 px-1">
                        <span className="text-[10px] font-mono font-black text-[#121110]">
                          {msg.playerName}
                        </span>
                        {msg.team && (
                          <span className="text-[8px] px-1 py-0.2 rounded font-black uppercase text-[#4A443E] bg-[#F7F4EE] border border-[#D5CCC0]">
                            {msg.team}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-[#6E645A]">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs font-mono font-bold shadow-xs ${
                          isMe
                            ? 'bg-[#121110] text-[#FAF8F5] rounded-tr-none'
                            : 'bg-[#F7F4EE] text-[#121110] border border-[#D5CCC0] rounded-tl-none'
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

            {/* Input Form */}
            <form onSubmit={handleSend} className="pt-2 border-t border-[#D5CCC0] flex items-center gap-2">
              <input
                type="text"
                placeholder={activeTab === 'TEAM' ? `Message Team ${myTeam}...` : 'Table broadcast...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#F7F4EE] border-2 border-[#D5CCC0] focus:border-[#92400E] rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-[#121110] placeholder:text-[#A89882] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-[#121110] hover:bg-[#2C2623] text-[#FAF8F5] transition-all active:scale-[0.95] disabled:opacity-40 cursor-pointer shadow-xs"
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
