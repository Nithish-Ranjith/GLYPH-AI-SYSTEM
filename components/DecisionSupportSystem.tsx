
import React, { useState, useEffect, useRef } from 'react';
import { Bot, BrainCircuit, Terminal, ShieldCheck, Activity, Send, User as UserIcon, Play } from 'lucide-react';
import { generateAgentResponse, AgentPersona } from '../services/geminiService';

interface DecisionSupportSystemProps {
  stats: Record<string, number>;
  activeScenarioId?: string | null;
}

interface Message {
  id: string;
  sender: AgentPersona;
  text: string;
  timestamp: string;
}

export const DecisionSupportSystem: React.FC<DecisionSupportSystemProps> = ({ stats, activeScenarioId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentPersona | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeAgent]);

  useEffect(() => {
    isMounted.current = true;
    if (messages.length === 0) {
        setMessages([{
            id: 'init',
            sender: 'GEMINI_ANALYST',
            text: "System Online. I am ready to analyze Tirupati's LULC data streams. What is your query?",
            timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })
        }]);
    }
    return () => { isMounted.current = false; };
  }, []);

  const handleSendMessage = async () => {
      if (!userInput.trim() || isProcessing) return;

      const userMsg: Message = {
          id: Date.now().toString(),
          sender: 'USER',
          text: userInput,
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, userMsg]);
      setUserInput("");
      setIsProcessing(true);

      await runConsultationCycle(userMsg);
      
      setIsProcessing(false);
  };

  const runConsultationCycle = async (userMsg: Message) => {
      if (!isMounted.current) return;

      const context = `
        Current Land Use Stats (Hectares):
        Forest: ${stats['Forest']}, Built-up: ${stats['Built-up']}, Water: ${stats['Water']}.
        Active Scenario: ${activeScenarioId || 'None'}.
        User Query: ${userMsg.text}
      `;

      // 1. GEMINI (ANALYST)
      setActiveAgent('GEMINI_ANALYST');
      const geminiResp = await generateAgentResponse('GEMINI_ANALYST', [userMsg], context);
      addMessage('GEMINI_ANALYST', geminiResp);

      // 2. CLAUDE (ECOLOGIST)
      setActiveAgent('CLAUDE_ECOLOGIST');
      const claudeResp = await generateAgentResponse('CLAUDE_ECOLOGIST', [userMsg], context);
      addMessage('CLAUDE_ECOLOGIST', claudeResp);

      // 3. GPT (POLICYMAKER)
      setActiveAgent('GPT_POLICYMAKER');
      const gptResp = await generateAgentResponse('GPT_POLICYMAKER', [userMsg], context);
      addMessage('GPT_POLICYMAKER', gptResp);

      setActiveAgent(null);
  };

  const addMessage = (sender: AgentPersona, text: string) => {
      if (!isMounted.current) return;
      setMessages(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          sender,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })
      }]);
  };

  const getBubbleStyle = (sender: AgentPersona) => {
      switch(sender) {
          case 'GEMINI_ANALYST': return 'bg-blue-600 text-white rounded-tl-none border border-blue-500'; 
          case 'CLAUDE_ECOLOGIST': return 'bg-amber-600 text-white rounded-tl-none border border-amber-500'; 
          case 'GPT_POLICYMAKER': return 'bg-emerald-600 text-white rounded-tl-none border border-emerald-500'; 
          case 'USER': return 'bg-slate-700 text-white rounded-br-none border border-slate-600'; 
          default: return 'bg-slate-700 text-white';
      }
  };

  const getAgentName = (p: AgentPersona) => {
      switch(p) {
          case 'GEMINI_ANALYST': return 'Gemini Analyst (Data)';
          case 'CLAUDE_ECOLOGIST': return 'Claude (Ecology)';
          case 'GPT_POLICYMAKER': return 'Chat Administrator (Policy)';
          case 'USER': return 'You';
      }
  };

  return (
    <div className="h-full flex flex-col bg-[#020617] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0B1120] flex items-center justify-between shrink-0 z-10">
        <div>
           <h3 className="font-sans font-bold text-white text-sm flex items-center gap-2">
             <Activity size={14} className="text-cyan-500" /> Consensus Protocol
           </h3>
           <p className="text-[10px] text-slate-500">Multi-Agent Decision Chain</p>
        </div>
        <div className="flex space-x-1">
            <div className={`w-2 h-2 rounded-full ${activeAgent === 'GEMINI_ANALYST' ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></div>
            <div className={`w-2 h-2 rounded-full ${activeAgent === 'CLAUDE_ECOLOGIST' ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`}></div>
            <div className={`w-2 h-2 rounded-full ${activeAgent === 'GPT_POLICYMAKER' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-[#0f172a]">
        {messages.map((msg) => {
            const isUser = msg.sender === 'USER';
            return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    
                    {!isUser && (
                        <span className="text-[10px] text-slate-500 mb-1 ml-1 flex items-center gap-1 font-bold uppercase tracking-wider">
                            {getAgentName(msg.sender)}
                        </span>
                    )}

                    <div className={`max-w-[90%] px-4 py-3 text-xs leading-relaxed shadow-lg rounded-2xl ${getBubbleStyle(msg.sender)}`}>
                        {/* Render simple markdown-like lists */}
                        {msg.text.split('\n').map((line, i) => (
                            <p key={i} className={`min-h-[1rem] ${line.startsWith('•') || line.startsWith('-') ? 'pl-2' : ''}`}>
                                {line}
                            </p>
                        ))}
                    </div>
                    
                    <span className={`text-[9px] text-slate-600 mt-1 mx-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                    </span>
                </div>
            );
        })}

        {/* Typing Indicator */}
        {activeAgent && (
             <div className="flex flex-col items-start animate-pulse">
                 <span className="text-[10px] text-cyan-500 mb-1 ml-1 font-bold uppercase tracking-wider">
                    {getAgentName(activeAgent)} is thinking...
                 </span>
                 <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-800 border border-slate-700 w-16 flex items-center justify-center gap-1">
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                 </div>
             </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#0B1120] border-t border-slate-800">
          <div className="flex items-center gap-2 bg-[#1e293b] rounded-lg px-3 py-2 border border-slate-700 focus-within:border-cyan-500/50 transition-colors">
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isProcessing ? "Consultation in progress..." : "Ask the council..."}
                disabled={isProcessing}
                className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-500 disabled:opacity-50"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isProcessing}
                className="p-2 rounded bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:bg-slate-700 transition-colors"
              >
                  {isProcessing ? <Activity size={14} className="animate-spin"/> : <Send size={14} />}
              </button>
          </div>
      </div>
    </div>
  );
};
