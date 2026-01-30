
import React from 'react';
import { EconomicImpactAnalysis } from '../EconomicImpactAnalysis';
import { AlertTriangle } from 'lucide-react';
import { Theme } from '../../types';

interface ForecastingViewProps {
  theme: Theme;
}

export const ForecastingView: React.FC<ForecastingViewProps> = ({ theme }) => {
  
  return (
    <div className="flex flex-col w-full">
        <div className="grid grid-cols-12 gap-6">
            {/* 1. PROBABILISTIC CHART */}
            <div className="col-span-12 xl:col-span-8 h-[500px]">
                <EconomicImpactAnalysis data={[]} activeScenario={null} theme={theme} mode="forecasting" />
            </div>

            {/* 2. RISK DETAILS */}
            <div className="col-span-12 xl:col-span-4 h-[500px] p-6 rounded-2xl border bg-orange-950/20 border-orange-500/20 overflow-y-auto custom-scrollbar shadow-lg">
                <div className="flex gap-4 mb-6 sticky top-0 bg-transparent backdrop-blur-sm pb-4 border-b border-orange-500/10">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0">
                         <AlertTriangle className="text-orange-500" size={24}/>
                    </div>
                    <div>
                        <h4 className="font-bold text-orange-500 text-lg uppercase font-tech tracking-wide">Risk Assessment Zone</h4>
                        <p className="text-xs text-orange-200/80 mt-1 leading-relaxed">
                            Algorithm detects high probability of forest fragmentation in the Alipiri-Cherlopalli corridor.
                        </p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-orange-900/30 rounded-xl border border-orange-500/20 transition-all hover:bg-orange-900/40">
                        <span className="text-sm font-bold text-orange-200">Hotspot A1 (North)</span>
                        <div className="flex flex-col items-end">
                             <span className="text-sm font-bold text-red-500">92% Risk</span>
                             <span className="text-[9px] text-orange-400">Immediate Action</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-orange-900/30 rounded-xl border border-orange-500/20 transition-all hover:bg-orange-900/40">
                        <span className="text-sm font-bold text-orange-200">Hotspot B2 (Renigunta)</span>
                        <div className="flex flex-col items-end">
                             <span className="text-sm font-bold text-orange-500">85% Risk</span>
                             <span className="text-[9px] text-orange-400">Monitoring Required</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-orange-900/30 rounded-xl border border-orange-500/20 transition-all hover:bg-orange-900/40">
                        <span className="text-sm font-bold text-orange-200">Hotspot C3 (Lake)</span>
                        <div className="flex flex-col items-end">
                             <span className="text-sm font-bold text-orange-500">78% Risk</span>
                             <span className="text-[9px] text-orange-400">Ecological Sensitivity</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-orange-900/30 rounded-xl border border-orange-500/20 transition-all hover:bg-orange-900/40 opacity-75">
                        <span className="text-sm font-bold text-orange-200">Zone D4 (West)</span>
                        <div className="flex flex-col items-end">
                             <span className="text-sm font-bold text-yellow-500">62% Risk</span>
                             <span className="text-[9px] text-orange-400">Projected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
