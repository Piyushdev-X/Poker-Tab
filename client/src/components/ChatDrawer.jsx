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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Slide-over Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-obsidian-surface border-l border-white/10 shadow-2xl z-50 flex flex-col p-4 overflow-hidden"
          >
            {/* Header & Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-1 bg-obsidian-deep/80 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    activeTab === 'ALL'
                      ? 'bg-obsidian-raised text-white border border-white/10 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
                <button
                  onClick={() => setActiveTab('TEAM')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    activeTab === 'TEAM'
                      ? 'bg-sky-950/60 text-sky-300 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>Team {myTeam}</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-obsidian-raised hover:bg-white/10 border border-white/10 text-slate-300 transition-all active:scale-[0.95]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Emotes Bar */}
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              {QUICK_EMOTES.map((emote) => (
                <button
                  key={emote}
                  onClick={() => handleEmoteClick(emote)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-transform active:scale-125 text-base"
                >
                  {emote}
                </button>
              ))}
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono text-center p-4">
                  <MessageSquare className="w-6 h-6 mb-2 opacity-40" />
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
                        <span className="text-[10px] font-mono text-slate-400">
                          {msg.senderName}
                        </span>
                        {msg.team && (
                          <span className="text-[8px] font-mono px-1 rounded bg-white/5 text-slate-400">
                            {msg.team}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-600">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-2xl text-xs max-w-[85%] break-words ${
                          isMe
                            ? 'bg-brass text-obsidian font-medium rounded-tr-none'
                            : 'bg-obsidian-deep/90 border border-white/10 text-slate-100 rounded-tl-none'
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
            <form onSubmit={handleSend} className="pt-2 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder={activeTab === 'ALL' ? 'Message entire table...' : `Message Team ${myTeam}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-obsidian-deep border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brass/50"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-brass hover:bg-brass-light disabled:opacity-40 text-obsidian transition-all active:scale-[0.95]"
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
