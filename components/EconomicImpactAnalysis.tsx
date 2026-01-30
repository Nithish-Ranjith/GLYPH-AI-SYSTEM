
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react';
import { SimulationScenario, Theme, AnalyticsMode } from '../types';

interface EconomicImpactAnalysisProps {
  data: any[];
  activeScenario: SimulationScenario | null;
  theme: Theme;
  mode?: AnalyticsMode;
}

export const EconomicImpactAnalysis: React.FC<EconomicImpactAnalysisProps> = ({ data, activeScenario, theme, mode = 'historical' }) => {
  const isDark = theme === 'dark';

  // --- FORECAST MODE (3-Line Chart) ---
  if (mode === 'forecasting') {
      const forecastData = [
          { year: 2024, best: 3100, likely: 3100, worst: 3100 },
          { year: 2025, best: 3180, likely: 3250, worst: 3350 },
          { year: 2026, best: 3250, likely: 3420, worst: 3650 },
          { year: 2027, best: 3310, likely: 3600, worst: 3950 },
          { year: 2028, best: 3360, likely: 3790, worst: 4280 },
          { year: 2029, best: 3400, likely: 3950, worst: 4600 },
          { year: 2030, best: 3430, likely: 4150, worst: 4950 }, // ~850 ha gain in likely (4150-3100=1050 built-up ~ forest loss)
      ];

      return (
        <div className={`h-full flex flex-col rounded-xl border p-5 shadow-lg ${isDark ? 'bg-[#0B1120] border-slate-800' : 'bg-white border-slate-200'}`}>
           <div className="flex justify-between items-start mb-4">
            <div>
            <h3 className={`font-tech text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <AlertTriangle className="text-orange-500" size={18} />
                PROBABILISTIC FORECAST
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">
                Built-up Area Expansion Risk (2024-2030)
            </p>
            </div>
            <div className="text-right">
                <div className="text-2xl font-mono font-bold text-orange-500">850 ha</div>
                <div className="text-[9px] text-slate-400">ADDITIONAL LOSS BY 2030</div>
            </div>
           </div>

           <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} />
                        <XAxis dataKey="year" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit=" ha" domain={[3000, 5000]}/>
                        <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: '#334155', color: isDark ? '#fff' : '#000' }} />
                        <Legend iconType="plainline" wrapperStyle={{fontSize: '10px'}}/>
                        <Line type="monotone" name="Worst Case" dataKey="worst" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Line type="monotone" name="Likely Scenario" dataKey="likely" stroke="#f97316" strokeWidth={3} dot={{r: 3}} />
                        <Line type="monotone" name="Best Case" dataKey="best" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
           </div>
        </div>
      );
  }

  // --- HISTORICAL / POLICY MODE (Area Chart) ---
  return (
    <div className={`h-full flex flex-col rounded-xl border p-5 shadow-lg ${isDark ? 'bg-[#0B1120] border-slate-800' : 'bg-white border-slate-200'}`}>
      
      <div className="flex justify-between items-start mb-4">
        <div>
           <h3 className={`font-tech text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
             <TrendingUp className="text-emerald-500" size={18} />
             FISCAL TRAJECTORY
           </h3>
           <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">
             Revenue vs. Liability Projection
           </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLiability" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="year" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit=" Cr" />
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: isDark ? '#0f172a' : '#fff', 
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    color: isDark ? '#f8fafc' : '#1e293b',
                    fontSize: '12px'
                }} 
            />
            <Area type="monotone" name="Urban Revenue" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
            <Area type="monotone" name="Ecological Liability" dataKey="Liability" stroke="#ef4444" fillOpacity={1} fill="url(#colorLiability)" strokeWidth={2} />
            
            <ReferenceLine x={2024} stroke="#64748b" strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
