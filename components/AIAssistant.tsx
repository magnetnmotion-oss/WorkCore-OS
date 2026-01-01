
import React, { useState, useRef, useEffect } from 'react';
import { AIChatMessage, BusinessMetrics } from '../types';
import { chatWithAssistant } from '../services/geminiService';

interface AIAssistantProps {
  metrics: BusinessMetrics;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ metrics }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { role: 'model', text: 'Terminal Ready. How can I assist with your workspace metrics?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMsg: AIChatMessage = { role: 'user', text: inputValue };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const reply = await chatWithAssistant(newMessages, metrics);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Error syncing with Gemini node. Retrying..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-[380px] h-[580px] bg-[#151b2d] rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 mb-4 flex flex-col overflow-hidden animate-fade-in ring-1 ring-white/5">
          {/* Header */}
          <div className="bg-[#0a0f1e] p-6 text-white flex justify-between items-center border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xs italic shadow-[0_0_15px_rgba(37,99,235,0.4)]">O</div>
              <div>
                <h3 className="font-black text-xs tracking-[0.2em] uppercase italic">Ommi Core</h3>
                <div className="flex items-center space-x-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Active Intelligence</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#0a0f1e]/40 hide-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed tracking-tight shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-[#1e293b] text-slate-200 border border-white/5 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 rounded-tl-none flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-[#0a0f1e] border-t border-white/5">
            <div className="flex items-center space-x-2 bg-white/5 rounded-2xl p-2 pl-4 border border-white/5 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all shadow-inner">
              <input 
                type="text" 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Query workspace..." 
                className="flex-1 bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest text-slate-300 placeholder:text-slate-600"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white disabled:opacity-20 transition-all active:scale-95 shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[22px] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:scale-110 active:scale-90 ${
          isOpen ? 'bg-white text-slate-900 rotate-180' : 'bg-blue-600 text-white'
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="relative">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-blue-600"></span>
          </div>
        )}
      </button>
    </div>
  );
};
