import React, { useState } from 'react';
import { Bot, Sparkles, AlertTriangle, FileText, ChevronRight, X } from 'lucide-react';
import { generateLULCInsight } from '../services/geminiService';

interface AIConsultantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIConsultant: React.FC<AIConsultantProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<'general' | 'policy' | 'risk'>('general');

  const handleGenerate = async (type: 'general' | 'policy' | 'risk') => {
    setActivePrompt(type);
    setLoading(true);
    setInsight(null);
    
    // Mock context data derived from our stats
    const context = `
      Transition Data 2018-2024:
      - 347 hectares of Agriculture converted to Built-up (Critical).
      - 200 hectares of Forest loss.
      - Total Urban Expansion: +18.2%.
      - Water bodies decreased by 3.1%.
    `;

    const result = await generateLULCInsight(context, type);
    setInsight(result);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-[#0B1120] border-l border-slate-800 flex flex-col h-full shadow-2xl z-40 absolute right-0 top-0 bottom-0 md:relative">
      <div className="p-4 border-b border-slate-800 bg-[#0F172A] flex justify-between items-center">
        <div>
           <h3 className="flex items-center gap-2 font-tech font-bold text-white text-lg tracking-wide">
             <Bot className="text-cyan-500" size={20} />
             AI GOVERNANCE
           </h3>
           <p className="text-[10px] text-cyan-700 font-mono uppercase">Powered by Gemini 3 Flash</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white md:hidden">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {!insight && !loading && (
          <div className="text-center py-12 text-slate-600">
            <Sparkles className="mx-auto mb-4 opacity-30 animate-pulse" size={48} />
            <p className="text-sm font-mono">Select a protocol to initiate analysis.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
             <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
             <p className="text-xs text-cyan-400 font-mono animate-pulse uppercase">Processing Neural Data...</p>
          </div>
        )}

        {insight && (
          <div className="prose prose-sm prose-invert max-w-none text-slate-300 bg-[#1e293b]/50 p-5 rounded-xl border border-slate-700/50">
            {/* Simple Markdown Rendering */}
            {insight.split('\n').map((line, i) => {
               if (line.startsWith('##')) return <h4 key={i} className="font-tech font-bold text-lg text-white mt-4 mb-2 border-b border-slate-700 pb-1">{line.replace('##', '')}</h4>;
               if (line.startsWith('**')) return <p key={i} className="font-bold text-cyan-400 mb-2">{line.replace(/\*\*/g, '')}</p>;
               if (line.startsWith('-')) return <li key={i} className="ml-4 mb-1 text-slate-400 list-disc">{line.replace('-', '')}</li>;
               return <p key={i} className="mb-2 text-sm leading-relaxed">{line}</p>;
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-[#0F172A] space-y-3">
        <button 
          onClick={() => handleGenerate('general')}
          disabled={loading}
          className="group w-full flex items-center justify-between p-3 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-cyan-900/20 hover:text-cyan-400 hover:border-cyan-800/50 transition-all border border-slate-700 disabled:opacity-50"
        >
          <span className="flex items-center gap-3 font-medium"><Sparkles size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors"/> General Summary</span>
          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button 
          onClick={() => handleGenerate('policy')}
          disabled={loading}
          className="group w-full flex items-center justify-between p-3 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-emerald-900/20 hover:text-emerald-400 hover:border-emerald-800/50 transition-all border border-slate-700 disabled:opacity-50"
        >
          <span className="flex items-center gap-3 font-medium"><FileText size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors"/> Policy Recommendations</span>
          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button 
          onClick={() => handleGenerate('risk')}
          disabled={loading}
          className="group w-full flex items-center justify-between p-3 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-orange-900/20 hover:text-orange-400 hover:border-orange-800/50 transition-all border border-slate-700 disabled:opacity-50"
        >
          <span className="flex items-center gap-3 font-medium"><AlertTriangle size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors"/> Risk Assessment</span>
          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
};