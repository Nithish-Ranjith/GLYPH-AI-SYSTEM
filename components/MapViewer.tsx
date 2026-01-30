import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layers, ZoomIn, ZoomOut, Maximize, RefreshCw, Eye, EyeOff, Activity, Filter, Map as MapIcon, Download, AlertTriangle, CalendarDays, MapPin, X, History, ArrowRight, CloudLightning, Flame, TrendingUp, TrendingDown, Minus, Play, Pause, SkipForward, SkipBack, ShieldCheck, Globe, Grid3X3, ScanLine, Users, CloudRain, Sun } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Tooltip, useMap, useMapEvents, Polygon, Marker, Rectangle } from 'react-leaflet';
import { LatLngTuple, DivIcon, LatLngBoundsExpression } from 'leaflet';
import { TIRUPATI_COORDS, CLASS_COLORS, TRANSITION_COLOR, AOI_BOUNDS, EVENT_SAMPLING_OPTIONS, TRANSLATIONS, RISK_ZONES, SEASONAL_RISK_ZONES } from '../constants';
import { LULCClass, PixelPoint, ChartDataPoint, TransitionData, Language, AnalysisReport, Theme, AnalyticsMode, PolicyConfig, MapLayer, Season } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { generateMapReport } from '../services/reportGenerator';
import { SimulationEngine } from '../services/simulationEngine';

const MapController = ({ target }: { target?: { lat: number, lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 14, { duration: 2, easeLinearity: 0.25 });
    }
  }, [target, map]);
  return null;
};

// 1. Grid Renderer - PIXEL-WISE RASTER (For Pixel View)
const GridLayer = React.memo(({ 
  points, year, confidenceThreshold, showHotspots, onVisibleStatsUpdate, onPixelClick, mode, activeLayer
}: { 
  points: PixelPoint[], year: number, confidenceThreshold: number, showHotspots: boolean, onVisibleStatsUpdate: (pts: PixelPoint[]) => void, onPixelClick: (p: PixelPoint) => void, mode: AnalyticsMode, activeLayer: MapLayer
}) => {
  
  const visiblePoints = useMemo(() => points.filter(p => p.confidence >= 0.55), [points]);

  useEffect(() => {
    const highlyConfident = points.filter(p => p.confidence >= confidenceThreshold);
    onVisibleStatsUpdate(highlyConfident);
  }, [visiblePoints, confidenceThreshold]); 

  return (
    <>
      {visiblePoints.map(p => {
        // --- CHRONOS TIME-LAPSE LOGIC ---
        const currentClass = year >= p.transitionYear ? p.class2024 : p.class2018;
        const isChange = p.class2018 !== p.class2024;
        
        if (showHotspots && (!isChange || p.confidence < 0.75)) return null;
        if (p.confidence < confidenceThreshold && !showHotspots && activeLayer === 'lulc_grid') return null;

        let color = CLASS_COLORS[currentClass];
        let opacity = 0.6;
        let stroke = false;
        let weight = 0;
        let radius = p.radius;

        // --- LAYER VISUALIZATION LOGIC ---
        
        // 1. SENTINEL-1 SAR MODE (Simulated Pixel Representation)
        if (activeLayer === 's1_sar') {
             // SAR Logic: High backscatter (bright) for Urban/Double Bounce. Low (dark) for Water.
             const isUrban = currentClass === 'Built-up';
             const isWater = currentClass === 'Water';
             const isForest = currentClass === 'Forest';

             // Simulate Grayscale intensity based on class reflection
             let intensity = 50; 
             if (isUrban) intensity = 220 + (p.variation * 30); // Very Bright
             else if (isWater) intensity = 20; // Very Dark
             else if (isForest) intensity = 100 + (p.variation * 80); // Speckle Noise look

             color = `rgb(${intensity}, ${intensity}, ${intensity})`;
             opacity = 0.8;
             radius = p.radius * 1.2; 
        }
        
        // 2. SENTINEL-2 OPTICAL MODE (Simulated False Color)
        else if (activeLayer === 's2_optical') {
            // False Color Infrared (Vegetation = Red/NIR)
             const isVeg = currentClass === 'Forest' || currentClass === 'Agriculture';
             const isUrban = currentClass === 'Built-up';
             const isWater = currentClass === 'Water';

             if (isVeg) {
                 // Red channel high for NIR simulation
                 color = `rgb(${200 + p.variation * 55}, 50, 50)`; 
             } else if (isUrban) {
                 color = `rgb(180, 180, 190)`; // Grey/Cyan for concrete
             } else if (isWater) {
                 color = '#000033'; // Deep blue/black
             } else {
                 color = '#8B4513'; // Brown earth
             }
             opacity = 0.7;
        }

        // 3. LULC GRID MODE (Default)
        else {
            if (p.confidence > 0.85) opacity = 0.85;
            if (mode !== 'historical') opacity = opacity * 0.3; // Dim background in other modes

            const justChanged = isChange && year === p.transitionYear;
            
            if (justChanged) {
                color = TRANSITION_COLOR;
                opacity = 1.0;
                stroke = true;
                weight = 2;
                radius = p.radius * 1.5;
            }
            if (showHotspots) {
                stroke = true;
                weight = 1;
            }
        }

        return (
          <Circle
            key={`px-${p.id}`}
            center={[p.lat + p.jitterLat, p.lng + p.jitterLng]}
            radius={radius} 
            pathOptions={{
              fillColor: color,
              fillOpacity: opacity, 
              stroke: stroke,
              color: '#ffffff',
              weight: weight,
              className: showHotspots ? 'raster-pixel animate-pulse' : 'raster-pixel' 
            }}
            eventHandlers={{
                click: (e) => {
                    e.originalEvent.stopPropagation();
                    onPixelClick(p);
                }
            }}
          >
            <Tooltip direction="top" className="custom-dark-tooltip" sticky>
               <span className="text-xs font-mono font-bold">
                  {currentClass} 
                  {activeLayer === 's1_sar' && ' [SAR Backscatter: -12dB]'}
                  {activeLayer === 's2_optical' && ' [NDVI: 0.65]'}
                  {isChange ? (year >= p.transitionYear ? ` (Changed in ${p.transitionYear})` : ` (Will change in ${p.transitionYear})`) : ''}
               </span>
            </Tooltip>
          </Circle>
        )
      })}
    </>
  );
});

// 2. Satellite Zone Renderer (For Satellite View)
const SatelliteZoneLayer = React.memo(({ activeLayer, year, points }: { activeLayer: MapLayer, year: number, points: PixelPoint[] }) => {
    
    // Dynamic Zone Generation derived from GEE data (simulated via points)
    const dynamicZones = useMemo(() => {
        // We only render zones if we have points to work with
        if (points.length === 0) return [];

        const clusters: Record<string, { latSum: number, lngSum: number, count: number, riskSum: number, types: Record<string, number> }> = {};
        // Finer Grid size for tighter clusters (approx 600m)
        const GRID = 0.006; 

        points.forEach(p => {
            // Filter: Only high confidence pixels contribute to zones
            if (p.confidence < 0.60) return;
            
            // Spatial Hash
            const key = `${Math.floor(p.lat/GRID)}-${Math.floor(p.lng/GRID)}`;
            
            if(!clusters[key]) clusters[key] = { latSum: 0, lngSum: 0, count: 0, riskSum: 0, types: {} };
            
            const cell = clusters[key];
            cell.latSum += p.lat;
            cell.lngSum += p.lng;
            cell.count++;
            cell.riskSum += p.riskScore;
            
            // Use the class corresponding to the current year view
            const cls = year === 2024 ? p.class2024 : p.class2018;
            cell.types[cls] = (cell.types[cls] || 0) + 1;
        });

        const zones: { id: string, lat: number, lng: number, label: string, color: string, risk: number, radius: number }[] = [];
        
        Object.values(clusters).forEach(c => {
            // Minimum density threshold to form a zone (reduces noise)
            if (c.count < 10) return; 
            
            const lat = c.latSum / c.count;
            const lng = c.lngSum / c.count;
            const avgRisk = c.riskSum / c.count;
            
            // Determine dominant type in this cluster
            let domType = 'Barren';
            let maxCount = 0;
            
            Object.entries(c.types).forEach(([t, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    domType = t;
                }
            });

            // Logic to classify the ZONE based on dominant pixel type
            let label = '';
            let color = '';

            if (domType === 'Built-up') {
                if (avgRisk > 75) {
                    label = 'High Density Urban';
                    color = '#dc2626'; // Red
                } else {
                    label = 'Urban Sprawl';
                    color = '#f97316'; // Orange
                }
            } else if (domType === 'Water') {
                 if (avgRisk > 80) {
                     label = 'Critical Water Loss';
                     color = '#ef4444';
                 } else {
                     label = 'Hydrology';
                     color = '#3b82f6';
                 }
            } else if (domType === 'Forest') {
                if (avgRisk > 85) {
                    label = 'Forest Encroachment';
                    color = '#ef4444';
                }
                // We typically don't label healthy forest as "Risk Zones" to avoid map clutter
            }

            if (label) {
                zones.push({
                    id: `z-${lat.toFixed(4)}-${lng.toFixed(4)}`,
                    lat, lng, label, color, 
                    risk: Math.round(avgRisk),
                    radius: 350 + (c.count * 5) // Radius scales with density
                });
            }
        });
        
        return zones;

    }, [points, year, activeLayer]);

    // Only show zones in appropriate layers
    if (activeLayer !== 'lulc_grid' && activeLayer !== 'change_heatmap') return null;

    return (
        <>
            {dynamicZones.map((zone) => (
                <React.Fragment key={zone.id}>
                    {/* Core Zone Area */}
                    <Circle
                        center={[zone.lat, zone.lng]}
                        radius={zone.radius}
                        pathOptions={{
                            fillColor: zone.color,
                            fillOpacity: 0.15,
                            stroke: true,
                            color: zone.color,
                            weight: 1.5,
                            dashArray: '4, 4'
                        }}
                    />
                    {/* Central Pulse Indicator */}
                    <Circle
                        center={[zone.lat, zone.lng]}
                        radius={zone.radius * 0.3}
                        pathOptions={{
                            fillColor: zone.color,
                            fillOpacity: 0.4,
                            stroke: false,
                            className: 'animate-pulse'
                        }}
                    >
                        <Tooltip direction="center" permanent className="bg-transparent border-none shadow-none text-white font-bold text-xs">
                            <div className="text-center drop-shadow-md">
                                <div className="uppercase tracking-wider text-[8px] opacity-90">{zone.label}</div>
                                <div className="text-sm">{zone.risk}%</div>
                            </div>
                        </Tooltip>
                    </Circle>
                </React.Fragment>
            ))}
        </>
    );
});

// 3. Trend Alert Markers (Historical)
const TrendMarkers = ({ alerts, mode }: { alerts: AnalysisReport[], mode: AnalyticsMode }) => {
  if (mode !== 'historical' && mode !== 'forecasting') return null; 

  return (
    <>
      {alerts.map(alert => {
        if (!alert.lat || !alert.lng) return null;
        const opacity = mode === 'forecasting' ? 0.5 : 1; 
        
        const customIcon = new DivIcon({
          className: 'trend-bubble-icon',
          html: `<div class="trend-bubble" style="opacity: ${opacity}; background: ${alert.severity === 'high' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
                   ${alert.title}
                 </div>`,
          iconSize: undefined,
          iconAnchor: [0, 0]
        });
        return <Marker key={alert.id} position={[alert.lat, alert.lng]} icon={customIcon} />;
      })}
    </>
  );
};

// 4. Policy Zones (Policy)
const PolicyLayer = ({ mode, config }: { mode: AnalyticsMode, config: PolicyConfig }) => {
    if (mode !== 'policy') return null;

    return (
        <>
            {RISK_ZONES.map(zone => (
                <Circle 
                    key={`policy-${zone.id}`}
                    center={[zone.lat, zone.lng]}
                    radius={config.bufferRadius} // Dynamic Radius
                    pathOptions={{
                        color: '#10b981', // Emerald-500
                        fillColor: '#10b981',
                        fillOpacity: 0.3,
                        weight: 2
                    }}
                >
                   <Tooltip direction="top" permanent className="bg-emerald-900 border-emerald-500 text-emerald-100 font-bold text-[10px] rounded">
                        🛡️ Protected Buffer ({config.bufferRadius}m)
                    </Tooltip>
                </Circle>
            ))}
        </>
    );
};

// 5. Risk Zones (Forecasting)
const RiskLayer = ({ mode }: { mode: AnalyticsMode }) => {
    if (mode !== 'forecasting') return null;

    return (
        <>
            {RISK_ZONES.map(zone => (
                <Circle 
                    key={`risk-${zone.id}`}
                    center={[zone.lat, zone.lng]}
                    radius={zone.radius}
                    pathOptions={{
                        color: '#f97316', // Orange
                        fillColor: '#f97316',
                        fillOpacity: 0.2,
                        weight: 1,
                        dashArray: '6, 6'
                    }}
                >
                    <Tooltip direction="center" className="bg-transparent border-none text-orange-500 font-bold text-[10px] shadow-none">
                        {zone.riskLevel}% RISK
                    </Tooltip>
                </Circle>
            ))}
        </>
    );
};

// 6. Temporal Layer (Seasons & Events)
const TemporalLayer = ({ mode, season }: { mode: AnalyticsMode, season: Season }) => {
    if (mode !== 'temporal') return null;

    // Filter zones based on the selected season
    const activeZones = SEASONAL_RISK_ZONES.filter(z => {
        if (season === 'brahmotsavam') return z.type === 'pilgrim';
        if (season === 'summer') return z.type === 'fire';
        if (season === 'monsoon') return z.type === 'flood';
        return false; 
    });

    return (
        <>
            {activeZones.map(zone => {
                let color = '#3b82f6'; // Default Blue
                if (zone.type === 'fire') color = '#f97316'; // Orange
                if (zone.type === 'pilgrim') color = '#d946ef'; // Fuchsia/Magenta

                return (
                    <React.Fragment key={zone.id}>
                        <Circle 
                            center={[zone.lat, zone.lng]}
                            radius={zone.radius}
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: 0.2,
                                weight: 2,
                                dashArray: season === 'brahmotsavam' ? '0' : '5, 5'
                            }}
                        >
                            <Tooltip direction="top" permanent className="bg-slate-900 border-slate-700 text-white font-bold text-[10px] rounded shadow-xl">
                                {zone.label}
                            </Tooltip>
                        </Circle>
                        {/* Pulse Effect for Events */}
                        <Circle 
                            center={[zone.lat, zone.lng]}
                            radius={zone.radius * 0.4}
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: 0.4,
                                weight: 0,
                                className: 'animate-pulse'
                            }}
                        />
                    </React.Fragment>
                );
            })}
        </>
    );
};

interface MapViewerProps {
  searchQuery?: string;
  department?: string;
  lang?: Language;
  theme?: Theme;
  flyToLocation?: { lat: number, lng: number } | null;
  alerts?: AnalysisReport[]; 
  mode?: AnalyticsMode;
  policyConfig?: PolicyConfig;
  activeLayer?: MapLayer; 
  confidenceFilter?: number;
  temporalSeason?: Season; // New Prop
}

export const MapViewer: React.FC<MapViewerProps> = ({ 
    department = 'General Administration', 
    lang = 'en', 
    theme = 'dark', 
    flyToLocation, 
    alerts = [],
    mode = 'historical' as AnalyticsMode,
    policyConfig = { bufferRadius: 500, verticalMandate: false, landBanking: false },
    activeLayer = 'lulc_grid',
    confidenceFilter = 0.70,
    temporalSeason = 'summer' as Season
}) => {
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(EVENT_SAMPLING_OPTIONS[4]);
  const [gridPoints, setGridPoints] = useState<PixelPoint[]>([]);
  const [selectedPixel, setSelectedPixel] = useState<PixelPoint | null>(null);
  
  // NEW: Map Style State
  const [viewStyle, setViewStyle] = useState<'pixel' | 'satellite'>('pixel');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const engine = SimulationEngine.getInstance();
    setGridPoints(engine.gridData);
  }, [selectedEvent]);

  useEffect(() => setSelectedPixel(null), [selectedEvent]);

  // CHRONOS LOOP
  useEffect(() => {
      if (isPlaying) {
          timerRef.current = setInterval(() => {
              setCurrentYear(prev => {
                  if (prev >= 2024) return 2018; 
                  return prev + 1;
              });
          }, 1200); 
      } else {
          if (timerRef.current) clearInterval(timerRef.current);
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying]);

  const panelClass = theme === 'dark' ? 'bg-[#0F172A]/90 backdrop-blur border-slate-700 text-slate-200' : 'bg-white/95 backdrop-blur border-slate-200 text-slate-800 shadow-xl';
  const textHighlightClass = theme === 'dark' ? 'text-white' : 'text-slate-900';

  // --- MAP STYLE LOGIC ---
  const getTileLayer = () => {
    if (viewStyle === 'satellite') {
       // ESRI World Imagery
       return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    }
    // Carto Basemaps for Pixel Mode
    return theme === 'dark' 
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  };

  const getTileClass = () => {
      if (viewStyle === 'satellite') {
          // If SAR is active in Satellite mode, apply grayscale/noise filter
          if (activeLayer === 's1_sar') return 'filter grayscale contrast-125 brightness-75 sepia-0';
          return ''; // Normal Satellite
      }
      return theme === 'dark' ? 'basemap-layer' : '';
  };

  return (
    <div className={`flex h-full w-full gap-8 font-sans ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
       <div className={`relative flex-1 rounded-2xl overflow-hidden border shadow-2xl ${theme === 'dark' ? 'border-slate-700 bg-[#0B1120]' : 'border-slate-300 bg-white'}`}>
          
          {/* Top Bar Overlay */}
          <div className={`absolute top-0 left-0 right-0 h-16 z-[500] border-b flex items-center justify-between px-6 ${panelClass} ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
             
             {/* LEFT: Mode Indicator */}
             <div className="flex items-center gap-4">
                <div className={`w-1.5 h-8 rounded-full ${mode === 'historical' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : mode === 'forecasting' ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : mode === 'policy' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-fuchsia-500 shadow-[0_0_10px_#d946ef]'}`}></div>
                <div>
                   <h2 className={`font-tech font-bold text-lg leading-none tracking-wide ${textHighlightClass} uppercase`}>{mode === 'temporal' ? 'SEASONAL' : mode} MODE</h2>
                   <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                       {mode === 'historical' && 'EVIDENCE-BASED BASELINE'}
                       {mode === 'forecasting' && 'PROBABILISTIC RISK PREDICTION'}
                       {mode === 'policy' && 'INTERVENTION SIMULATION'}
                       {mode === 'temporal' && 'EVENT-BASED CORRELATION'}
                   </p>
                </div>
             </div>

             {/* RIGHT: View Style Toggle & Time Controls */}
             <div className="flex items-center gap-6">
                 
                 {/* VIEW STYLE TOGGLE */}
                 <div className={`flex p-1 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                     <button 
                        onClick={() => setViewStyle('satellite')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewStyle === 'satellite' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                         <Globe size={14}/> Satellite
                     </button>
                     <button 
                        onClick={() => setViewStyle('pixel')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewStyle === 'pixel' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                         <Grid3X3 size={14}/> Pixel Grid
                     </button>
                 </div>

                 {mode === 'historical' && (
                     <div className="flex items-center gap-4 pl-6 border-l border-slate-700">
                         <span className={`text-2xl font-tech font-bold ${textHighlightClass}`}>{currentYear}</span>
                         <button onClick={() => setIsPlaying(!isPlaying)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500/20 text-red-500' : 'bg-cyan-600 text-white'}`}>
                             {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5"/>}
                         </button>
                     </div>
                 )}
             </div>
          </div>

          <MapContainer center={TIRUPATI_COORDS} zoom={13} zoomControl={false} className="w-full h-full bg-[#020617]">
             <TileLayer 
                url={getTileLayer()} 
                attribution='&copy; CARTO, &copy; Esri' 
                opacity={theme === 'dark' ? 0.9 : 1.0} 
                className={getTileClass()} 
             />
             <MapController target={flyToLocation} />
             
             {/* 
                CONDITIONAL LAYERS: 
                - Pixel View uses GridLayer 
                - Satellite View uses SatelliteZoneLayer (if LULC active)
             */}
             
             {viewStyle === 'pixel' && (
                 <GridLayer 
                    points={gridPoints} 
                    year={currentYear} 
                    confidenceThreshold={confidenceFilter} 
                    showHotspots={showHotspots} 
                    onVisibleStatsUpdate={() => {}} 
                    onPixelClick={setSelectedPixel} 
                    mode={mode} 
                    activeLayer={activeLayer}
                 />
             )}

             {viewStyle === 'satellite' && (
                 <SatelliteZoneLayer activeLayer={activeLayer} year={currentYear} points={gridPoints} />
             )}

             <TrendMarkers alerts={alerts} mode={mode} />
             <RiskLayer mode={mode} />
             <PolicyLayer mode={mode} config={policyConfig} />
             
             {/* NEW: Temporal Layer */}
             <TemporalLayer mode={mode} season={temporalSeason} />

             <Polygon positions={AOI_BOUNDS as LatLngTuple[]} pathOptions={{ color: '#06b6d4', fill: false, weight: 1, dashArray: '5, 5' }} />
          </MapContainer>

       </div>
    </div>
  );
};