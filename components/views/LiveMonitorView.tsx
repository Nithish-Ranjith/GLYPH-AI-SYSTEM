
import React, { useState, useEffect } from 'react';
import { MapViewer } from '../MapViewer';
import { Layers, Activity, Filter, Download, Satellite, Radio, Grid3X3, Eye, Zap } from 'lucide-react';
import { AnalysisReport, Theme, MapLayer, PixelPoint, Language } from '../../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { SimulationEngine } from '../../services/simulationEngine';
import { generateMapReport } from '../../services/reportGenerator';
import { CLASS_COLORS, TRANSLATIONS } from '../../constants';

interface LiveMonitorViewProps {
  theme: Theme;
  userDept: string;
  lang: Language;
}

export const LiveMonitorView: React.FC<LiveMonitorViewProps> = ({ theme, userDept, lang }) => {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('lulc_grid');
  const [confidence, setConfidence] = useState(0.70);
  const [stats, setStats] = useState<any>(null);
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Get live stats from Engine
    const engine = SimulationEngine.getInstance();
    setStats(engine.stats);
  }, []);

  const chartData = stats ? Object.entries(stats.counts2024).map(([k, v]) => ({
      name: t[`class.${k}`] || k,
      originalKey: k,
      value: v,
      color: CLASS_COLORS[k as keyof typeof CLASS_COLORS]
  })) : [];

  const handleDownloadReport = () => {
      if (stats) {
          // Convert complex transition data to simpler record for report
          const transRecord: Record<string, number> = {};
          stats.transitions.forEach((t: any) => {
              transRecord[`${t.from}->${t.to}`] = t.hectares;
          });
          generateMapReport(userDept, stats.counts2024, transRecord, stats.totalPixels);
      }
  };

  return (
    <div className="flex h-full w-full gap-6 p-4">
      
      {/* LEFT: MAIN MAP AREA */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
         
         {/* FLOATING LAYER CONTROL */}
         <div className="absolute top-6 left-6 z-[1000] bg-[#0F172A]/90 backdrop-blur-md border border-slate-700 p-5 rounded-xl w-72 shadow-2xl animate-in slide-in-from-left-4 fade-in duration-500">
             <div className="flex items-center gap-2 mb-4 text-cyan-500 font-bold font-tech uppercase tracking-widest border-b border-slate-700 pb-2">
                 <Layers size={16} /> {t['monitor.layerControl']}
             </div>
             
             <div className="space-y-3">
                 <button 
                    onClick={() => setActiveLayer('lulc_grid')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${activeLayer === 'lulc_grid' ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                 >
                     <div className="flex items-center gap-3">
                         <Grid3X3 size={16} />
                         <span className="text-xs font-bold">{t['layer.lulc']}</span>
                     </div>
                     {activeLayer === 'lulc_grid' && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>}
                 </button>

                 <button 
                    onClick={() => setActiveLayer('s1_sar')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${activeLayer === 's1_sar' ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                 >
                     <div className="flex items-center gap-3">
                         <Radio size={16} />
                         <span className="text-xs font-bold">{t['layer.sar']}</span>
                     </div>
                     {activeLayer === 's1_sar' && <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]"></div>}
                 </button>

                 <button 
                    onClick={() => setActiveLayer('s2_optical')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${activeLayer === 's2_optical' ? 'bg-red-950/40 border-red-500 text-red-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                 >
                     <div className="flex items-center gap-3">
                         <Satellite size={16} />
                         <span className="text-xs font-bold">{t['layer.optical']}</span>
                     </div>
                     {activeLayer === 's2_optical' && <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_#f87171]"></div>}
                 </button>
             </div>

             <div className="mt-6 pt-4 border-t border-slate-700">
                 <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1"><Filter size={10}/> {t['monitor.confidence']}</span>
                     <span className="text-[10px] text-cyan-400 font-mono">{(confidence * 100).toFixed(0)}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="0.5" 
                    max="0.99" 
                    step="0.01" 
                    value={confidence} 
                    onChange={(e) => setConfidence(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                 />
             </div>
         </div>

         {/* ACTIVE ACTIVITY INDICATOR */}
         {activeLayer !== 'lulc_grid' && (
             <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-500/10 border border-red-500/50 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                 <Activity size={14} className="text-red-500"/>
                 <span className="text-xs font-bold text-red-400 uppercase tracking-wide">{t['monitor.liveFeed']}: {activeLayer === 's1_sar' ? 'SAR Backscatter' : 'False Color Infrared'}</span>
             </div>
         )}

         {/* MAP COMPONENT */}
         <MapViewer 
            activeLayer={activeLayer}
            confidenceFilter={confidence}
            theme={theme}
            mode="historical" // Use historical for the base visuals
            policyConfig={{ bufferRadius: 500, verticalMandate: false, landBanking: false }}
            lang={lang}
         />
      </div>

      {/* RIGHT: METRICS PANEL */}
      <div className={`w-96 rounded-2xl border flex flex-col ${isDark ? 'bg-[#0B1120] border-slate-700' : 'bg-white border-slate-200'} shadow-2xl`}>
          <div className="p-6 border-b border-slate-700">
             <h3 className="flex items-center gap-2 font-tech font-bold text-xl text-white">
                 <Activity className="text-cyan-500" /> {t['monitor.metrics']}
             </h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">{t['monitor.viewAs']}: {userDept}</p>
          </div>

          <div className="p-6 flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
              
              {/* AREA CHART */}
              <div className="h-64">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">{t['monitor.areaDist']}</h4>
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{left: 0, right: 20}}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px'}} 
                            cursor={{fill: 'transparent'}}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>

              {/* TRANSITIONS */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                  <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase">{t['monitor.transitions']}</h4>
                      <span className="bg-red-500/20 text-red-400 text-[9px] px-2 py-0.5 rounded border border-red-500/30">871 CHANGED</span>
                  </div>
                  <div className="space-y-3">
                      <div className="flex justify-between text-sm items-center border-b border-slate-800 pb-2">
                          <span className="text-slate-300">{t['class.Agriculture']} <span className="text-slate-600 mx-1">→</span> {t['class.Built-up']}</span>
                          <span className="font-mono font-bold text-orange-400">+586</span>
                      </div>
                      <div className="flex justify-between text-sm items-center border-b border-slate-800 pb-2">
                          <span className="text-slate-300">{t['class.Forest']} <span className="text-slate-600 mx-1">→</span> {t['class.Built-up']}</span>
                          <span className="font-mono font-bold text-red-500">+112</span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                          <span className="text-slate-300">{t['class.Water']} <span className="text-slate-600 mx-1">→</span> {t['class.Barren']}</span>
                          <span className="font-mono font-bold text-slate-400">+45</span>
                      </div>
                  </div>
              </div>

              {/* ACTION BUTTON */}
              <button 
                onClick={handleDownloadReport}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/50"
              >
                  <Download size={18}/> {t['monitor.btnReport']}
              </button>

          </div>
      </div>

    </div>
  );
};
