/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Bot, RefreshCw } from 'lucide-react';
import { SharpButton } from './BrutalistUI';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface AIChatBotProps {
  selectedEvent?: any;
}

export default function AIChatBot({ selectedEvent }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Yo! I am your AI Event Specialist. Ready to hack, learn, or solve problems? Let me know what you need.',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedEvent) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `I noticed you are looking at "${selectedEvent.title}". Ask me anything about its location at "${selectedEvent.venue}", deadlines, pricing, team formation, or general tips!`,
        },
      ]);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputVal.trim();
    if (!textToSend) return;

    if (!customText) {
      setInputVal('');
    }

    const newMessages = [...messages, { sender: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: newMessages,
          eventContext: selectedEvent,
        }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error: Failed to fetch advisor advice. Server connection lost.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuickPrompts = () => {
    if (selectedEvent) {
      return [
        `Is this event free?`,
        `Where is the venue?`,
        `How do I form a team?`,
        `Will I get a certificate?`,
      ];
    }
    return [
      `What is Evenia?`,
      `How do I register?`,
      `Become an organizer`,
      `Simulated check-in details`,
    ];
  };

  return (
    <>
      {/* Floating Sparkle Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#F04B23] border-4 border-black p-4 text-white hover:bg-black hover:text-[#F04B23] shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] z-40 transition-all cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5"
        style={{ borderRadius: 0 }}
      >
        <div className="flex items-center gap-2 font-sans uppercase font-black text-xs tracking-wider">
          <Sparkles className="w-5 h-5 animate-pulse text-white" />
          <span>AI Support Hub</span>
        </div>
      </button>

      {/* Main Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="w-full max-w-md bg-[#F5F3EF] border-l-4 border-black h-full flex flex-col shadow-[-10px_0px_0px_rgba(15,15,16,1)] relative text-black">
            {/* Global Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            {/* Header banner */}
            <div className="bg-[#0F0F10] text-white p-5 flex items-center justify-between border-b-4 border-black">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#F04B23] flex items-center justify-center font-black text-black italic text-sm">
                  🤖
                </div>
                <div>
                  <h3 className="font-sans font-black uppercase text-xl leading-none">AI EVENT BOT</h3>
                  <p className="text-[9px] font-mono-custom uppercase tracking-widest text-[#F04B23] mt-0.5">
                    {selectedEvent ? `CONTEXT: ${selectedEvent.title.substring(0, 18)}...` : 'GENERAL CONCIERGE'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-[#1A1A1A] border-2 border-white p-1.5 hover:bg-[#F04B23] hover:text-black hover:border-black transition-all cursor-pointer text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat list */}
            <div
              ref={scrollRef}
              className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-[#F5F3EF] border-b-4 border-black font-sans text-sm relative"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_rgba(15,15,16,1)] ${
                      m.sender === 'user'
                        ? 'bg-[#4AA8D8] text-black rounded-none'
                        : 'bg-white text-black rounded-none'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-black opacity-60">
                      {m.sender === 'user' ? 'PARTICIPANT' : 'EVENIA AI'}
                    </div>
                    <p className="leading-tight font-medium whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-black p-3 flex items-center gap-2 font-mono-custom text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#F04B23]" />
                    <span className="uppercase font-bold">GEMINI THINKING...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Prompts Area */}
            <div className="px-5 pt-4 bg-[#F5F3EF]">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#0F0F10] opacity-40 mb-2">
                Quick Action Questions
              </div>
              <div className="flex flex-wrap gap-2">
                {getQuickPrompts().map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSendMessage(p)}
                    className="bg-white border border-black px-2.5 py-1 text-xs hover:bg-[#F04B23] hover:text-white transition-all cursor-pointer font-bold uppercase tracking-tighter"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Send box */}
            <div className="p-5 bg-[#F5F3EF] flex gap-2">
              <input
                type="text"
                placeholder="Ask something about Events, tickets or QR scans..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-white border-2 border-black p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F04B23]"
              />
              <SharpButton variant="primary" onClick={() => handleSendMessage()} className="py-3 px-4">
                <Send className="w-4 h-4" />
              </SharpButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
