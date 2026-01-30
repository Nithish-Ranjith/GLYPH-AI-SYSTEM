
import React from 'react';
import { TrendingDown, TrendingUp, Trees, Building2, Droplets, AlertTriangle } from 'lucide-react';
import { Theme } from '../../types';

interface KeyMetricsProps {
  theme: Theme;
  forestLoss: number;
  urbanGain: number;
  waterLoss: number;
}

export const KeyMetrics: React.FC<KeyMetricsProps> = ({ theme, forestLoss, urbanGain, waterLoss }) => {
  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-200';

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className={`p-4 rounded-xl border ${cardBg}`}>
        <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Forest Cover</div>
            <Trees size={16} className="text-emerald-500 opacity-50"/>
        </div>
        <div className="text-2xl font-mono font-bold text-red-500 flex items-baseline gap-2">
            -{forestLoss} <span className="text-xs font-sans font-normal text-slate-400">ha</span>
        </div>
        <div className="text-[9px] text-red-400 mt-1 flex items-center gap-1">
            <TrendingDown size={10} /> Critical Decline (-4.2%)
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${cardBg}`}>
        <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Urban Sprawl</div>
            <Building2 size={16} className="text-orange-500 opacity-50"/>
        </div>
        <div className="text-2xl font-mono font-bold text-orange-500 flex items-baseline gap-2">
            +{urbanGain} <span className="text-xs font-sans font-normal text-slate-400">ha</span>
        </div>
        <div className="text-[9px] text-orange-400 mt-1 flex items-center gap-1">
            <TrendingUp size={10} /> Rapid Expansion (+18.2%)
        </div>
      </div>

       <div className={`p-4 rounded-xl border ${cardBg}`}>
        <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Water Bodies</div>
            <Droplets size={16} className="text-blue-500 opacity-50"/>
        </div>
        <div className="text-2xl font-mono font-bold text-blue-400 flex items-baseline gap-2">
            -{waterLoss} <span className="text-xs font-sans font-normal text-slate-400">ha</span>
        </div>
        <div className="text-[9px] text-blue-400 mt-1 flex items-center gap-1">
            <TrendingDown size={10} /> Siltation Risk
        </div>
      </div>
      
       <div className={`p-4 rounded-xl border ${cardBg}`}>
        <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Risk Index</div>
            <AlertTriangle size={16} className="text-red-500 opacity-50"/>
        </div>
        <div className="text-2xl font-mono font-bold text-red-500 flex items-baseline gap-2">
            HIGH
        </div>
        <div className="text-[9px] text-red-400 mt-1 flex items-center gap-1">
            Alipiri Sector Critical
        </div>
      </div>
    </div>
  );
};
