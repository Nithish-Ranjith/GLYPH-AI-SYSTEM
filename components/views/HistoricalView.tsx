
import React from 'react';
import { KeyMetrics } from '../analytics/KeyMetrics';
import { TransitionMatrix } from '../TransitionMatrix';
import { EconomicLedger } from '../EconomicLedger';
import { Theme, TransitionData } from '../../types';

interface HistoricalViewProps {
  theme: Theme;
  stats2018: Record<string, number>;
  stats2024: Record<string, number>;
  transitionData: TransitionData[];
}

export const HistoricalView: React.FC<HistoricalViewProps> = ({ theme, stats2018, stats2024, transitionData }) => {
  const isDark = theme === 'dark';
  const borderClass = isDark ? 'border-slate-700' : 'border-slate-200';
  const bgClass = isDark ? 'bg-[#0F172A]' : 'bg-white';

  const forestLoss = Math.max(0, stats2018['Forest'] - stats2024['Forest']);
  const urbanGain = Math.max(0, stats2024['Built-up'] - stats2018['Built-up']);
  const waterLoss = Math.max(0, stats2018['Water'] - stats2024['Water']);

  return (
    <div className="space-y-6 flex flex-col w-full">
      {/* 1. KEY METRICS ROW */}
      <KeyMetrics theme={theme} forestLoss={forestLoss} urbanGain={urbanGain} waterLoss={waterLoss} />

      {/* 2. SPLIT VIEW: HEATMAP & LEDGER (Fixed Height for Layout Stability) */}
      <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8 h-[550px]">
             <TransitionMatrix data={transitionData} />
          </div>
          <div className={`col-span-12 xl:col-span-4 h-[550px] p-6 rounded-2xl border ${bgClass} ${borderClass} shadow-lg flex flex-col`}>
              <h3 className="font-tech text-sm text-slate-400 mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span> ECONOMIC DAMAGE REPORT
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                 <EconomicLedger stats2018={stats2018} stats2024={stats2024} activeScenario={null} />
              </div>
          </div>
      </div>
    </div>
  );
};
