import { Sparkles, Send, Loader2 } from 'lucide-react';
import { BuildState } from '../types';
import React, { useState, useRef, useEffect } from 'react';
import { streamChat, Message } from '../services/api';
import { getShortName } from '../utils/specMapper';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RightPanelProps {
  build: BuildState;
  onReset: () => void;
  onCheckout: () => void;
}

export function RightPanel({ build, onReset, onCheckout }: RightPanelProps) {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'System initialized. Awaiting component selection for architectural analysis.' }
  ]);
  const [history, setHistory] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeItems = [
    build.CABINET,
    build.MOTHERBOARD,
    build.CPU,
    build.GPU,
    build.SSD,
    build.PSU,
    ...build.RAM.filter(Boolean)
  ].filter(Boolean);

  const total = activeItems.reduce((sum, item) => sum + (item?.price || 0), 0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming || !chatInput.trim()) return;

    const userMessageContent = chatInput.trim();
    const newUserMessage: Message = { role: 'user', content: userMessageContent };
    
    setMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsStreaming(true);
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    const currentHistory = [...history];
    setHistory(prev => [...prev, newUserMessage]);

    let streamBuffer = '';

    streamChat(
      userMessageContent,
      currentHistory,
      (token) => {
        streamBuffer += token;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', content: streamBuffer };
          return newMessages;
        });
      },
      () => {
        setIsStreaming(false);
        setHistory(prev => [...prev, { role: 'model', content: streamBuffer }]);
      },
      (error) => {
        setIsStreaming(false);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', content: error };
          return newMessages;
        });
      }
    );
  };

  return (
    <aside className="w-1/4 flex flex-col gap-4 h-full">
      
      {/* AI Assistant Panel */}
      <div className="flex-1 bg-panel border border-cabinet-border/10 flex flex-col overflow-hidden rounded-3xl shadow-lg">
        <div className="p-4 border-b border-cabinet-border/10 flex items-center gap-3 bg-layer-1">
          <Sparkles className="w-4 h-4 text-category-selected" />
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-highlight">Architect AI</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 text-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-layer-2 border border-cabinet-border/10 text-text-highlight rounded-2xl rounded-tr-sm shadow-sm whitespace-pre-wrap' 
                  : 'bg-layer-1 border border-cabinet-border/5 text-text-primary rounded-2xl rounded-tl-sm shadow-sm border-l-2 border-l-category-selected'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleChatSubmit} className="p-4 border-t border-cabinet-border/10 bg-layer-1 relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isStreaming}
            placeholder="e.g., Build me a gaming PC under ₹1L"
            className="w-full bg-base border border-cabinet-border/20 p-4 text-[10px] tracking-widest font-bold uppercase text-text-highlight focus:outline-none focus:border-category-selected transition-colors placeholder:text-text-primary/30 pr-12 rounded-full shadow-inner disabled:opacity-50"
          />
          <button type="submit" disabled={isStreaming} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-primary hover:text-category-selected transition-colors bg-layer-2 p-2 rounded-full shadow-sm disabled:opacity-50">
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* Build Summary Panel */}
      <div className="flex-1 bg-panel border border-cabinet-border/10 flex flex-col overflow-hidden rounded-3xl shadow-lg">
        <div className="p-4 border-b border-cabinet-border/10 bg-layer-1">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-highlight">Manifest</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {activeItems.length === 0 ? (
            <div className="text-[10px] uppercase tracking-widest text-text-primary/50 italic">
              No components selected
            </div>
          ) : (
            <>
              {activeItems.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-3 bg-layer-2 border border-cabinet-border/10 rounded-xl mb-3 shadow-sm hover:border-cabinet-border/30 transition-colors">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-layer-1 border border-cabinet-border/10 rounded flex items-center justify-center shrink-0">
                      {item?.image_url ? (
                        <img src={item.image_url} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-screen p-1" />
                      ) : (
                        <span className="text-[8px] font-bold text-cabinet-border/40 uppercase tracking-widest">{item?.type}</span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[8px] font-bold text-category-selected uppercase tracking-[0.15em]">{item?.brand}</span>
                      <span className="text-[11px] font-medium text-text-highlight leading-tight line-clamp-2">{getShortName(item?.name || '')}</span>
                      {item?.summary && (
                        <span className="text-[9px] text-[#A0A0A0] uppercase tracking-wider mt-1 truncate">{item.summary}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-[11px] text-[#D4D4D4] font-medium">₹{(item?.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {item?.buy_link ? (
                      <a href={item.buy_link} target="_blank" rel="noopener noreferrer" className="bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] hover:bg-[#FF9900] hover:text-[#232F3E] transition-colors rounded text-[9px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1">
                        Buy
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="p-6 border-t border-cabinet-border/10 bg-layer-1">
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-primary">Estimated Total</span>
            <span className="text-3xl font-mono text-price-total tracking-tighter">
              ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onReset}
              className="bg-reset-btn border border-cabinet-border/10 text-text-highlight py-4 text-[10px] font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-colors rounded-full shadow-md"
            >
              Reset
            </button>
            <button 
              onClick={onCheckout}
              disabled={activeItems.length === 0}
              className="bg-cabinet-border text-base py-4 text-[10px] font-bold uppercase tracking-[0.15em] hover:brightness-110 transition-colors rounded-full shadow-md disabled:opacity-50"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
}
