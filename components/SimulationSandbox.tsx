
import React from 'react';
import { Sliders, ToggleLeft, ToggleRight, Check, Shield, Download, ArrowRight, Zap } from 'lucide-react';
import { SimulationScenario, PolicyConfig } from '../types';
import { generateActionPlanPDF } from '../services/reportGenerator';

interface SimulationSandboxProps {
  config: PolicyConfig;
  onUpdate: (newConfig: PolicyConfig) => void;
}

export const SimulationSandbox: React.FC<SimulationSandboxProps> = ({ config, onUpdate }) => {
  
  // Calculate Dynamic ROI
  const baseLoss = 850; // ha lost by 2030 forecast
  const savedHa = Math.round(baseLoss * (config.bufferRadius / 2000) * 0.6 + (config.verticalMandate ? 210 : 0) + (config.landBanking ? 150 : 0));
  const implementationCost = (config.bufferRadius * 0.005) + (config.verticalMandate ? 0.5 : 0) + (config.landBanking ? 12 : 0);
  const economicValue = savedHa * 0.15; // 15 Lakhs/ha ecosystem services approx scalar for demo
  const roi = (economicValue / implementationCost).toFixed(1);

  const handleDownload = () => {
      generateActionPlanPDF(config, savedHa, roi);
  };

  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
            <h3 className="font-tech text-xl text-white flex items-center gap-2">
                <Sliders className="text-cyan-500" />
                POLICY CONTROL CENTER
            </h3>
            <p className="text-sm text-slate-400 mt-1">Test interventions to mitigate the 2030 risk forecast.</p>
        </div>
        <span className="text-xs text-emerald-500 font-sans font-bold border border-emerald-900/50 bg-emerald-900/10 px-3 py-1.5 rounded">Simulation Active</span>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="col-span-7 space-y-6 overflow-y-auto custom-scrollbar pr-2">
            
            {/* SLIDER CONTROL */}
            <div className="p-5 rounded-lg border border-slate-700 bg-[#1e293b]/30">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-200">Buffer Zone Protection</span>
                    <span className="text-sm font-mono text-cyan-400 font-bold">{config.bufferRadius} meters</span>
                </div>
                <input 
                    type="range" 
                    min="200" 
                    max="2000" 
                    step="100" 
                    value={config.bufferRadius} 
                    onChange={(e) => onUpdate({...config, bufferRadius: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                    <span>200m</span>
                    <span>1000m</span>
                    <span>2000m</span>
                </div>
            </div>

            {/* CHECKBOXES */}
            <div className="space-y-4">
                <div 
                    onClick={() => onUpdate({...config, verticalMandate: !config.verticalMandate})}
                    className={`p-5 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${config.verticalMandate ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-[#1e293b]/20 border-slate-700 hover:border-slate-500'}`}
                >
                    <div>
                        <h4 className="text-sm font-bold text-slate-200">Vertical Development Mandate</h4>
                        <p className="text-xs text-slate-500 mt-1">Increase FSI in core city to reduce sprawl.</p>
                    </div>
                    {config.verticalMandate ? <Check size={20} className="text-emerald-500"/> : <div className="w-5 h-5 rounded border border-slate-600"></div>}
                </div>

                <div 
                    onClick={() => onUpdate({...config, landBanking: !config.landBanking})}
                    className={`p-5 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${config.landBanking ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-[#1e293b]/20 border-slate-700 hover:border-slate-500'}`}
                >
                    <div>
                        <h4 className="text-sm font-bold text-slate-200">Agricultural Land Banking</h4>
                        <p className="text-xs text-slate-500 mt-1">Pre-acquire peripheral land for green belts.</p>
                    </div>
                    {config.landBanking ? <Check size={20} className="text-emerald-500"/> : <div className="w-5 h-5 rounded border border-slate-600"></div>}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: IMPACT SUMMARY */}
        <div className="col-span-5 flex flex-col gap-4">
            <div className="flex-1 p-6 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-xl relative overflow-hidden flex flex-col justify-center">
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Zap size={16}/> Projected Outcome</h4>
                <div className="space-y-4 font-mono text-sm">
                    <div className="flex justify-between items-end pb-2 border-b border-white/5">
                        <span className="text-slate-400">Forest Saved</span>
                        <span className="text-white font-bold text-lg">{savedHa} ha</span>
                    </div>
                    <div className="flex justify-between items-end pb-2 border-b border-white/5">
                        <span className="text-slate-400">Implementation Cost</span>
                        <span className="text-white font-bold text-lg">₹{implementationCost.toFixed(1)} Cr</span>
                    </div>
                    <div className="flex justify-between items-end pt-2">
                        <span className="text-emerald-400 font-bold">ROI (Eco-Services)</span>
                        <span className="text-emerald-400 font-bold text-xl">{roi}x</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleDownload}
                className="w-full py-4 bg-white text-slate-900 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
                <Download size={18}/> Download Action Plan
            </button>
        </div>

      </div>
    </div>
  );
};
