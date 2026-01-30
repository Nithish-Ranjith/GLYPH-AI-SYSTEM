
import React from 'react';
import { LULCClass, TransitionData } from '../types';
import { CLASS_COLORS } from '../constants';

interface TransitionMatrixProps {
  data: TransitionData[];
}

const classes: LULCClass[] = ['Forest', 'Water', 'Agriculture', 'Barren', 'Built-up'];

export const TransitionMatrix: React.FC<TransitionMatrixProps> = ({ data }) => {
  
  const getValue = (from: LULCClass, to: LULCClass) => {
    const entry = data.find(d => d.from === from && d.to === to);
    return entry ? entry.hectares : 0;
  };

  // Calculate total area for each source class to compute %
  const classTotals: Record<string, number> = {};
  classes.forEach(c => classTotals[c] = 0);
  data.forEach(d => {
      if (classTotals[d.from] !== undefined) {
          classTotals[d.from] += d.hectares;
      }
  });

  // Find max value excluding diagonal (no change) to normalize heatmap for changes
  const maxChangeValue = Math.max(...data.filter(d => d.from !== d.to).map(d => d.hectares), 1);
  const maxStableValue = Math.max(...data.filter(d => d.from === d.to).map(d => d.hectares), 1);

  const getCellStyles = (value: number, from: LULCClass, to: LULCClass) => {
    if (value === 0) return { bg: 'bg-[#0f172a]', text: 'text-slate-800' };
    
    // Diagonal (Stable)
    if (from === to) {
       const intensity = Math.min(1, Math.max(0.2, value / maxStableValue));
       return { 
           bg: `bg-slate-800`, 
           style: { backgroundColor: `rgba(30, 41, 59, ${intensity})`, border: '1px solid #334155' },
           text: 'text-slate-300 font-mono'
       };
    }

    // Changes (Heatmap Logic)
    // Normalize intensity 0.2 to 1.0 based on maxChangeValue
    const intensity = Math.min(1, Math.max(0.2, (value / maxChangeValue) * 1.5)); // Multiply by 1.5 to make smaller changes pop more
    
    // Critical Changes (To Built-up or Barren)
    if (to === 'Built-up' || to === 'Barren') {
        return {
            bg: 'bg-red-900',
            style: { backgroundColor: `rgba(127, 29, 29, ${intensity})` },
            text: 'text-white font-bold'
        };
    }

    // Positive/Neutral Changes
    return {
        bg: 'bg-blue-900',
        style: { backgroundColor: `rgba(30, 58, 138, ${intensity})` },
        text: 'text-blue-100'
    };
  };

  return (
    <div className="bg-[#0B1120] rounded-2xl shadow-xl border border-slate-800 p-8 h-full flex flex-col">
      <h3 className="font-tech text-xl font-semibold mb-6 text-white flex items-center gap-3">
        <div className="w-1.5 h-6 bg-cyan-500 rounded-full"></div>
        TRANSITION HEATMAP <span className="text-slate-500 text-sm font-sans font-normal ml-auto border border-slate-700 px-2 py-1 rounded">Intensity (Ha)</span>
      </h3>
      
      <div className="flex-1 flex flex-col justify-center">
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
                <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1 mb-1">
                    <div className="flex items-end justify-end pr-4 pb-2 text-xs font-bold text-slate-500 font-mono">FROM \ TO</div>
                    {classes.map(c => (
                        <div key={c} className="text-center pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b-2" style={{ borderColor: CLASS_COLORS[c] }}>
                            {c}
                        </div>
                    ))}
                </div>

                {classes.map(from => (
                    <div key={from} className="grid grid-cols-[100px_repeat(5,1fr)] gap-1 mb-1">
                        <div className="flex items-center justify-end pr-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-r border-slate-800">
                            {from}
                        </div>
                        {classes.map(to => {
                            const val = getValue(from, to);
                            const total = classTotals[from] || 1;
                            const percent = ((val / total) * 100).toFixed(1);
                            const styles = getCellStyles(val, from, to);
                            
                            return (
                                <div 
                                    key={`${from}-${to}`} 
                                    className={`h-12 flex flex-col items-center justify-center rounded text-xs transition-all hover:scale-105 hover:z-10 relative group ${styles.bg} ${styles.text}`}
                                    style={styles.style}
                                >
                                    {val > 0 && (
                                        <>
                                            <span className="leading-none">{val}</span>
                                            {/* Subtitle Percentage */}
                                            {from !== to && <span className="text-[9px] opacity-70 leading-none mt-0.5">{percent}%</span>}
                                            
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded border border-slate-700 whitespace-nowrap z-20 shadow-xl">
                                                {from} → {to}: {val} Ha ({percent}% of original {from})
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-8 text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700"></div> No Change
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-900/50"></div> Critical Conversion
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-900/50"></div> Neutral Change
                </div>
          </div>
      </div>
    </div>
  );
};
