
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Tooltip, Rectangle } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { Map as MapIcon, BarChart3, Info, Layers } from 'lucide-react';
import { LatLngTuple, LatLngBoundsExpression } from 'leaflet';
import { TIRUPATI_COORDS, CLASS_COLORS } from '../constants';
import { PixelPoint, ComparativeDataPoint, LULCClass } from '../types';

interface ComparativeAnalysisProps {
    chartData: ComparativeDataPoint[];
}

// --- LOCAL GRID UTILS ---
const noise = (x: number, y: number) => {
    return Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 - Math.floor(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
};

const generateComparativeGrid = (resolution = 0.002): PixelPoint[] => {
  const points: PixelPoint[] = [];
  const latStart = 13.58;
  const latEnd = 13.68;
  const lngStart = 79.35;
  const lngEnd = 79.50;
  let idCounter = 0;

  // Major Feature Coordinates - MATCHING MapViewer.tsx Logic
  const TIRUPATI_CENTER = { lat: 13.6288, lng: 79.4192 };
  const RENIGUNTA_HUB = { lat: 13.6450, lng: 79.4900 }; 
  const RAYALACHERUVU = { lat: 13.5900, lng: 79.3700 }; 
  const HILL_BOUNDARY_LAT = 13.6550; 

  for (let lat = latStart; lat <= latEnd; lat += resolution) {
    for (let lng = lngStart; lng <= lngEnd; lng += resolution) {
      
      // DENSITY TUNING: Render ~40%
      if (Math.random() > 0.40) continue;

      idCounter++;
      const dCity = Math.sqrt(Math.pow(lat - TIRUPATI_CENTER.lat, 2) + Math.pow(lng - TIRUPATI_CENTER.lng, 2));
      const dRenigunta = Math.sqrt(Math.pow(lat - RENIGUNTA_HUB.lat, 2) + Math.pow(lng - RENIGUNTA_HUB.lng, 2));
      const dLake = Math.sqrt(Math.pow(lat - RAYALACHERUVU.lat, 2) + Math.pow(lng - RAYALACHERUVU.lng, 2));
      
      const n1 = noise(lat * 300, lng * 300);
      const n2 = noise(lat * 100, lng * 100);

      let cls18: LULCClass = 'Barren';
      
      // 1. FORESTS
      if (lat > HILL_BOUNDARY_LAT + (n1 * 0.003)) cls18 = 'Forest';
      // 2. WATER
      else if (dLake < 0.012 + (n2 * 0.002)) cls18 = 'Water';
      // 3. URBAN
      else if (dCity < 0.035 + (n1 * 0.005)) cls18 = 'Built-up';
      else if (dRenigunta < 0.02) cls18 = 'Built-up';
      // Corridor
      else if (lat > 13.62 && lat < 13.65 && lng > 79.42 && lng < 79.49) {
          const distToRoad = Math.abs(lat - 13.635);
          if (distToRoad < 0.006 + (n1 * 0.002)) cls18 = 'Built-up';
          else cls18 = 'Agriculture';
      }
      // 4. AGRICULTURE OR BARREN
      else {
          if (n1 > -0.2) cls18 = 'Agriculture';
          else cls18 = 'Barren';
      }

      // 2024 Logic
      let cls24: LULCClass = cls18;
      
      // Growth around city
      if ((cls18 === 'Agriculture' || cls18 === 'Barren') && dCity < 0.045 && dCity > 0.035 && Math.random() > 0.6) cls24 = 'Built-up';
      // Growth around Renigunta
      if ((cls18 === 'Agriculture' || cls18 === 'Barren') && dRenigunta < 0.03 && Math.random() > 0.6) cls24 = 'Built-up';
      // Encroachment
      if (cls18 === 'Forest' && lat < HILL_BOUNDARY_LAT + 0.008 && lng < 79.41 && Math.random() > 0.8) cls24 = 'Built-up';

      const jitterLat = (Math.random() - 0.5) * 0.0003; 
      const jitterLng = (Math.random() - 0.5) * 0.0003; 
      
      // Radius variation
      const radius = 60 + Math.random() * 40; // Slightly larger for comparative view

      // Confidence simulation
      let conf = 0.75 + Math.random() * 0.24; 
      const variation = Math.abs(n2);

      // Calc risk score
      let riskScore = 10;
      if (cls24 === 'Built-up') riskScore = 60;
      if (cls24 === 'Built-up' && cls18 === 'Forest') riskScore = 95;
      if (cls24 === 'Built-up' && cls18 === 'Water') riskScore = 90;

      // Add transitionYear
      const transitionYear = cls18 !== cls24 ? Math.floor(2019 + Math.random() * 5) : 0;

      points.push({
        id: `px-${idCounter}`,
        lat, lng, class2018: cls18, class2024: cls24, confidence: conf, variation, jitterLat, jitterLng, radius,
        riskScore,
        transitionYear
      });
    }
  }
  return points;
};

// Organic Zone Layer (Now Circles)
const ZoneLayer = React.memo(({ points, year }: { points: PixelPoint[], year: 2018 | 2024 }) => {

    return (
        <>
            {points.map(p => {
                const cls = year === 2018 ? p.class2018 : p.class2024;
                const isChange = p.class2018 !== p.class2024;
                let color = CLASS_COLORS[cls];
                
                // Dimmer magenta for changes
                let opacity = 0.85; 
                if (isChange && year === 2024) {
                    // Only high confidence changes
                    if (p.confidence > 0.8 && p.variation < 0.4) {
                        // Prompt 5: "Magenta should whisper".
                        color = '#E056FD';
                        opacity = 0.8;
                    } 
                }
                
                const renderLat = p.lat + p.jitterLat;
                const renderLng = p.lng + p.jitterLng;

                return (
                    <Circle
                        key={`${year}-${p.id}`}
                        center={[renderLat, renderLng]}
                        radius={p.radius}
                        pathOptions={{
                            fillColor: color,
                            fillOpacity: opacity,
                            stroke: false,
                            className: 'raster-pixel'
                        }}
                    >
                         <Tooltip direction="top" className="custom-dark-tooltip" sticky>
                            <span className="text-xs font-bold">{cls} {isChange ? '(Transformed)' : ''}</span>
                        </Tooltip>
                    </Circle>
                );
            })}
        </>
    );
});

export const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({ chartData }) => {
    const [viewMode, setViewMode] = useState<'map' | 'graph'>('map');
    const [comparisonYear, setComparisonYear] = useState<2018 | 2024>(2018);
    const [gridPoints, setGridPoints] = useState<PixelPoint[]>([]);

    useEffect(() => {
        // Use coarser resolution for performance
        const pts = generateComparativeGrid(0.002);
        setGridPoints(pts);
    }, []);

    return (
        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h3 className="font-tech text-xl text-white">Area Change Analysis (2018 vs 2024)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Spatio-temporal analysis of land use transformations.</p>
                </div>
                
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                    <button 
                        onClick={() => setViewMode('map')}
                        className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <MapIcon size={14}/> Map View
                    </button>
                    <button 
                        onClick={() => setViewMode('graph')}
                        className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'graph' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <BarChart3 size={14}/> Graph View
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="w-full h-[450px] relative rounded-lg border border-slate-800 bg-[#020617] overflow-hidden">
                {viewMode === 'map' && (
                    <div className="h-full w-full relative group">
                        
                        {/* Styled Year Toggle Pill (Matches Screenshot) */}
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[400] bg-[#0F172A]/90 backdrop-blur border border-slate-700 p-1.5 rounded-xl shadow-2xl flex gap-1">
                             <button 
                                onClick={() => setComparisonYear(2018)}
                                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex flex-col items-center leading-none gap-1 ${comparisonYear === 2018 ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                             >
                                <span className="opacity-50 text-[9px] uppercase tracking-wider font-bold">2018</span>
                                <span>Baseline</span>
                             </button>
                             <div className="w-px bg-slate-700/50 my-1 mx-1"></div>
                             <button 
                                onClick={() => setComparisonYear(2024)}
                                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex flex-col items-center leading-none gap-1 ${comparisonYear === 2024 ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                             >
                                <span className="opacity-50 text-[9px] uppercase tracking-wider font-bold">2024</span>
                                <span>Current</span>
                             </button>
                        </div>

                        <MapContainer 
                            center={TIRUPATI_COORDS} 
                            zoom={12} 
                            zoomControl={false} 
                            scrollWheelZoom={false} 
                            className="w-full h-full bg-[#020617]"
                            attributionControl={false}
                            style={{ height: '100%', width: '100%' }}
                        >
                             <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                opacity={0.4} 
                                className="basemap-layer"
                             />
                             <ZoneLayer points={gridPoints} year={comparisonYear} />
                        </MapContainer>
                        
                        <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-700 text-[10px] text-slate-400 flex items-center gap-2">
                             <Layers size={14} className="text-cyan-500 shrink-0"/>
                             <span>Resolution: Organic Zones (Probabilistic)</span>
                        </div>
                    </div>
                )}

                {viewMode === 'graph' && (
                    <div className="h-full w-full p-4">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} 
                                    cursor={{fill: '#1e293b'}}
                                />
                                <Legend verticalAlign="top" height={36}/>
                                <Bar dataKey="2018" fill="#64748b" name="2018 Baseline" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="2024" fill="#3b82f6" name="2024 Actual" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};
