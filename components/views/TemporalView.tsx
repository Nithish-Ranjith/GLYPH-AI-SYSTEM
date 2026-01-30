
import React from 'react';
import { Sun, CloudRain, Wind, Landmark, Flame, Droplets, Users, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Season } from '../../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface TemporalViewProps {
  season: Season;
  setSeason: (season: Season) => void;
}

const SEASON_CONFIG = {
  'summer': {
    color: 'orange',
    icon: Sun,
    label: 'Summer Peak (Mar-May)',
    description: 'Analysis of vegetation stress, fire risk zones, and water depletion rates.',
    stats: [
        { label: 'Forest Stress Index', value: '73/100', trend: 'high' },
        { label: 'Surface Water Loss', value: '-28 ha', trend: 'critical' },
        { label: 'Fire Incidents (Est)', value: '15', trend: 'high' }
    ]
  },
  'monsoon': {
    color: 'blue',
    icon: CloudRain,
    label: 'Monsoon (Jun-Sep)',
    description: 'Tracking wetland expansion, flood risk zones, and agricultural sowing patterns.',
    stats: [
        { label: 'Water Body Expansion', value: '+144 ha', trend: 'positive' },
        { label: 'Flood Risk Zones', value: '6 Sites', trend: 'critical' },
        { label: 'Agri Sowing Area', value: '+1,100 ha', trend: 'positive' }
    ]
  },
  'winter': {
    color: 'cyan',
    icon: Wind,
    label: 'Winter (Oct-Feb)',
    description: 'Baseline vegetative health and stable urban growth monitoring.',
    stats: [
        { label: 'Vegetation Health', value: 'Optimal', trend: 'positive' },
        { label: 'Harvest Area', value: '12,800 ha', trend: 'neutral' },
        { label: 'Urban Construction', value: 'Peak', trend: 'high' }
    ]
  },
  'brahmotsavam': {
    color: 'fuchsia', // Magenta-like
    icon: Landmark,
    label: 'Brahmotsavam Impact',
    description: 'Annual festival impact analysis on Alipiri corridor and temporary infrastructure.',
    stats: [
        { label: 'Pilgrim Influx', value: '~1.0M', trend: 'high' },
        { label: 'Temp. Structures', value: '45 ha', trend: 'neutral' },
        { label: 'Perm. Conversion', value: '23 ha', trend: 'critical' }
    ]
  }
};

const IMPACT_DATA = [
  { name: '2020', temp: 42, perm: 32 },
  { name: '2021', temp: 38, perm: 34 },
  { name: '2022', temp: 55, perm: 34 },
  { name: '2023', temp: 62, perm: 23 },
  { name: '2024', temp: 68, perm: 32 },
];

export const TemporalView: React.FC<TemporalViewProps> = ({ season, setSeason }) => {
  const activeConfig = SEASON_CONFIG[season];

  return (
    <div className="w-full space-y-6">
      
      {/* 1. SEASON SELECTOR */}
      <div className="grid grid-cols-4 gap-4">
        {(Object.keys(SEASON_CONFIG) as Season[]).map((key) => {
           const conf = SEASON_CONFIG[key];
           const isActive = season === key;
           const Icon = conf.icon;
           
           let activeClass = '';
           if (isActive) {
               if (key === 'summer') activeClass = 'bg-orange-600 border-orange-400 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]';
               if (key === 'monsoon') activeClass = 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]';
               if (key === 'winter') activeClass = 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]';
               if (key === 'brahmotsavam') activeClass = 'bg-fuchsia-700 border-fuchsia-400 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]';
           } else {
               activeClass = 'bg-[#1e293b]/50 border-slate-700 text-slate-400 hover:bg-[#1e293b] hover:border-slate-500';
           }

           return (
             <button
                key={key}
                onClick={() => setSeason(key)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${activeClass}`}
             >
                <Icon size={24} />
                <span className="text-xs font-bold uppercase tracking-wider">{conf.label.split(' ')[0]}</span>
             </button>
           );
        })}
      </div>

      {/* 2. MAIN ANALYSIS PANEL */}
      <div className={`p-6 rounded-2xl border bg-[#0B1120] border-slate-800 shadow-xl relative overflow-hidden min-h-[400px]`}>
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6 z-10 relative">
             <div>
                <h3 className="font-tech text-xl font-bold text-white flex items-center gap-2">
                   <activeConfig.icon className={`text-${activeConfig.color}-500`} size={22} />
                   {activeConfig.label} ANALYSIS
                </h3>
                <p className="text-sm text-slate-400 mt-1 max-w-lg">{activeConfig.description}</p>
             </div>
             <div className="flex gap-2">
                 {activeConfig.stats.map((stat, i) => (
                     <div key={i} className={`px-4 py-2 rounded-lg border bg-${activeConfig.color}-900/10 border-${activeConfig.color}-500/20`}>
                         <div className="text-[10px] text-slate-400 uppercase font-bold">{stat.label}</div>
                         <div className={`text-lg font-mono font-bold text-${activeConfig.color}-400`}>{stat.value}</div>
                     </div>
                 ))}
             </div>
          </div>

          {/* Conditional Content */}
          <div className="grid grid-cols-12 gap-6 z-10 relative">
              
              {/* LEFT: CHART / DATA */}
              <div className="col-span-8 h-64 bg-[#1e293b]/30 rounded-xl border border-slate-700/50 p-4">
                  {season === 'brahmotsavam' ? (
                      <>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                            <Users size={14}/> Event Impact Trend (2020-2024)
                        </h4>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={IMPACT_DATA}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} 
                                    cursor={{fill: '#334155', opacity: 0.2}}
                                />
                                <Bar dataKey="temp" name="Temporary Use (ha)" stackId="a" fill="#a21caf" radius={[0,0,0,0]} barSize={30} />
                                <Bar dataKey="perm" name="Permanent Loss (ha)" stackId="a" fill="#d946ef" radius={[4,4,0,0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                      </>
                  ) : (
                      <>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                            {season === 'summer' ? <Flame size={14}/> : <Droplets size={14}/>} 
                            {season === 'summer' ? 'Temperature vs Fire Risk Correlation' : 'Precipitation vs Wetland Area'}
                        </h4>
                        <div className="flex items-center justify-center h-full text-slate-500 text-sm italic">
                            Spatial correlation visualization initialized on Map Layer.
                        </div>
                      </>
                  )}
              </div>

              {/* RIGHT: INSIGHTS */}
              <div className="col-span-4 space-y-3">
                  <div className="p-3 rounded-lg border border-slate-700 bg-[#1e293b]/50">
                      <h5 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                          <AlertTriangle size={12} className="text-orange-500"/> Risk Prediction
                      </h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                          {season === 'brahmotsavam' && "Next festival likely to impact 28ha in Zone A due to new parking requirements."}
                          {season === 'summer' && "Seshachalam Zone B shows 85% probability of fire ignition in May 2025."}
                          {season === 'monsoon' && "Rayalacheruvu wetland capacity reduced by 12%; flood risk elevated for Sector 4."}
                          {season === 'winter' && "Vegetation recovery rate optimal. Construction activity expected to peak in Jan."}
                      </p>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-700 bg-[#1e293b]/50">
                      <h5 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                          <TrendingUp size={12} className="text-emerald-500"/> Opportunity
                      </h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                          {season === 'brahmotsavam' && "Designate temporary zones in Sector C to prevent permanent encroachment."}
                          {season === 'summer' && "Deploy preventive fire breaks in Zone A before April 1st."}
                          {season === 'monsoon' && "Clear drainage channels in Sector 4 to mitigate flood risk."}
                          {season === 'winter' && "Ideal window for conducting annual forest audit."}
                      </p>
                  </div>
              </div>
          </div>

          {/* Decor */}
          <div className={`absolute -bottom-10 -right-10 w-64 h-64 rounded-full blur-3xl opacity-10 bg-${activeConfig.color}-500`}></div>
      </div>

      {/* 3. EVENT TIMELINE */}
      <div className="p-6 rounded-2xl border bg-[#0B1120] border-slate-800 shadow-xl">
          <h3 className="font-tech text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Calendar className="text-slate-500" size={18} /> EVENT CORRELATION TIMELINE
          </h3>
          
          <div className="relative pt-2 pb-2">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700 transform -translate-y-1/2"></div>
              
              <div className="grid grid-cols-5 gap-4 relative z-10">
                  {[
                      { year: 'Sep 2022', event: 'Brahmotsavam', impact: '+34 ha', type: 'neg' },
                      { year: 'May 2023', event: 'Summer Peak', impact: '12 Fires', type: 'neg' },
                      { year: 'Aug 2023', event: 'Monsoon', impact: '+120 ha Flood', type: 'neu' },
                      { year: 'Sep 2023', event: 'Brahmotsavam', impact: '+23 ha', type: 'pos' }, // Reduced impact
                      { year: 'Nov 2024', event: 'Road Project', impact: '+67 ha', type: 'neg' },
                  ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center text-center group">
                          <div className={`w-3 h-3 rounded-full mb-4 border-2 border-[#0B1120] ${item.type === 'neg' ? 'bg-red-500' : item.type === 'pos' ? 'bg-emerald-500' : 'bg-blue-500'} group-hover:scale-125 transition-transform`}></div>
                          <div className="text-[10px] font-mono text-slate-500">{item.year}</div>
                          <div className="text-xs font-bold text-white mt-1">{item.event}</div>
                          <div className={`text-[10px] font-bold mt-0.5 ${item.type === 'neg' ? 'text-red-400' : item.type === 'pos' ? 'text-emerald-400' : 'text-blue-400'}`}>{item.impact}</div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};
