
import React from 'react';
import { Coins, TrendingDown, TrendingUp, Droplets, ArrowRight } from 'lucide-react';
import { ECONOMIC_FACTORS } from '../constants';
import { SimulationScenario } from '../types';

interface EconomicLedgerProps {
  stats2018: Record<string, number>;
  stats2024: Record<string, number>;
  activeScenario?: SimulationScenario | null;
}

export const EconomicLedger: React.FC<EconomicLedgerProps> = ({ stats2018, stats2024, activeScenario }) => {
  
  // 1. BASELINE CALCULATIONS (Business as Usual)
  const forestLoss = Math.max(0, stats2018['Forest'] - stats2024['Forest']); // ~379
  const urbanGain = Math.max(0, stats2024['Built-up'] - stats2018['Built-up']); // ~601
  const waterLoss = Math.max(0, stats2018['Water'] - stats2024['Water']); // ~12

  // Calc % changes for stats
  const forestChangePct = ((forestLoss / stats2018['Forest']) * 100).toFixed(1);
  const urbanChangePct = ((urbanGain / stats2018['Built-up']) * 100).toFixed(1);

  const baseCarbonLost = (forestLoss * ECONOMIC_FACTORS.CARBON_TONS_PER_HA_FOREST * ECONOMIC_FACTORS.CARBON_PRICE_PER_TON) / 10000000; 
  const baseTaxGained = (urbanGain * ECONOMIC_FACTORS.TAX_REVENUE_PER_HA_URBAN) / 10000000; 
  const baseFloodRisk = ((waterLoss * ECONOMIC_FACTORS.FLOOD_RISK_COST_PER_HA_WATER_LOST) + (urbanGain * ECONOMIC_FACTORS.FLOOD_RISK_COST_PER_HA_URBAN_GAIN)) / 10000000; 

  const baseNetImpact = baseTaxGained - baseCarbonLost - baseFloodRisk;

  // 2. SCENARIO CALCULATIONS
  let scenarioCarbonLost = baseCarbonLost;
  let scenarioTaxGained = baseTaxGained;
  let scenarioFloodRisk = baseFloodRisk;
  let implementationCost = 0;

  if (activeScenario) {
      // Mock implementation cost based on scenario type
      if (activeScenario.id === 'sim_green_belt') implementationCost = 2.5;
      if (activeScenario.id === 'sim_agri_permit') implementationCost = 0.8;
      if (activeScenario.id === 'sim_lake_restoration') implementationCost = 3.2;

      // Apply modifiers (simplified logic for demo)
      if (activeScenario.impact.targetClass === 'Built-up') {
          // e.g. -15% growth
          const modifier = 1 + activeScenario.impact.percentChange; 
          scenarioTaxGained = baseTaxGained * modifier;
          scenarioFloodRisk = baseFloodRisk * modifier; // Less concrete = less flood risk
          scenarioCarbonLost = baseCarbonLost * modifier; // Less deforestation assumed
      } else if (activeScenario.impact.targetClass === 'Forest') {
           // Direct conservation
           scenarioCarbonLost = baseCarbonLost * (1 - activeScenario.impact.percentChange);
      }
  }

  const scenarioNetImpact = scenarioTaxGained - scenarioCarbonLost - scenarioFloodRisk - implementationCost;
  const netBenefit = scenarioNetImpact - baseNetImpact;
  const benefitPct = Math.abs((netBenefit / baseNetImpact) * 100).toFixed(1);

  if (activeScenario) {
      return (
        <div className="space-y-6">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Baseline (Business as Usual)</h4>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Net Impact</span>
                    <span className="text-sm font-mono font-bold text-red-400">-₹{Math.abs(baseNetImpact).toFixed(2)} Cr</span>
                </div>
            </div>

            <div className="p-4 bg-cyan-950/20 rounded-xl border border-cyan-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Coins size={64} />
                </div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">With {activeScenario.label}</h4>
                
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Implementation Cost</span>
                        <span className="font-mono text-red-400">-₹{implementationCost.toFixed(2)} Cr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Avoided Carbon Loss</span>
                        <span className="font-mono text-emerald-400">₹{(baseCarbonLost - scenarioCarbonLost).toFixed(2)} Cr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Avoided Flood Risk</span>
                        <span className="font-mono text-emerald-400">₹{(baseFloodRisk - scenarioFloodRisk).toFixed(2)} Cr</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Tax Revenue Impact</span>
                        <span className="font-mono text-orange-400">₹{(scenarioTaxGained - baseTaxGained).toFixed(2)} Cr</span>
                    </div>
                    
                    <div className="pt-3 mt-2 border-t border-cyan-800/30 flex justify-between items-center">
                        <div>
                             <div className="font-bold text-white text-sm">NET BENEFIT</div>
                             <div className="text-[10px] text-emerald-500">+{benefitPct}% Efficiency</div>
                        </div>
                        <span className="text-xl font-mono font-bold text-emerald-400">+₹{netBenefit.toFixed(2)} Cr</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-emerald-900/10 border border-emerald-900/30 rounded-xl">
                <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2"><ArrowRight size={16}/> Recommendation</h4>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                    This intervention creates a positive fiscal variance of ₹{netBenefit.toFixed(2)} Cr annually while preserving ecological assets. Highly recommended for immediate implementation.
                </p>
            </div>
        </div>
      );
  }

  // DEFAULT VIEW (HISTORICAL / FORECAST MODES)
  return (
    <div className="space-y-4">
        {/* Ecological Debt (Carbon) */}
        <div className="flex items-center justify-between p-3 bg-[#1e293b]/40 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-900/20 flex items-center justify-center text-red-500">
                <TrendingDown size={16} />
            </div>
            <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Carbon Credits Lost</div>
                <div className="text-[9px] text-slate-500">Due to {forestLoss.toLocaleString()}ha Deforestation <span className="text-red-400">({forestChangePct}%)</span></div>
            </div>
        </div>
        <div className="text-right">
            <div className="text-sm font-mono font-bold text-red-400">- ₹{baseCarbonLost.toFixed(2)} Cr</div>
        </div>
        </div>

        {/* Revenue (Urban) */}
        <div className="flex items-center justify-between p-3 bg-[#1e293b]/40 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                <TrendingUp size={16} />
            </div>
            <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Projected Revenue</div>
                <div className="text-[9px] text-slate-500">Tax from {urbanGain.toLocaleString()}ha New Build <span className="text-emerald-400">(+{urbanChangePct}%)</span></div>
            </div>
        </div>
        <div className="text-right">
            <div className="text-sm font-mono font-bold text-emerald-400">+ ₹{baseTaxGained.toFixed(2)} Cr</div>
        </div>
        </div>

        {/* Risk Cost (Flood) */}
        <div className="flex items-center justify-between p-3 bg-[#1e293b]/40 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-500">
                <Droplets size={16} />
            </div>
            <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Flood Risk Liability</div>
                <div className="text-[9px] text-slate-500">Drainage loss & impervious surface</div>
            </div>
        </div>
        <div className="text-right">
            <div className="text-sm font-mono font-bold text-orange-400">- ₹{baseFloodRisk.toFixed(2)} Cr</div>
        </div>
        </div>

      {/* Net Impact */}
      <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
          <div className="text-xs font-bold text-slate-400">NET ANNUAL IMPACT</div>
          <div className={`text-lg font-mono font-bold ${baseNetImpact > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
             {baseNetImpact > 0 ? '+' : '-'} ₹{Math.abs(baseNetImpact).toFixed(2)} Cr
          </div>
      </div>
    </div>
  );
};
