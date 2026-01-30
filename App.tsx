
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { History, LineChart, ShieldCheck, Send, Calendar } from 'lucide-react';
import { User, LiveWeatherData, ViewMode, TransitionData, Language, AnalysisReport, Theme, PolicyConfig, AnalyticsMode, Season } from './types';
import { MapViewer } from './components/MapViewer';
import { LoginScreen } from './components/LoginScreen';
import { DecisionSupportSystem } from './components/DecisionSupportSystem';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LiveMonitorView } from './components/views/LiveMonitorView';
import { HistoricalView } from './components/views/HistoricalView';
import { ForecastingView } from './components/views/ForecastingView';
import { PolicyView } from './components/views/PolicyView';
import { TemporalView } from './components/views/TemporalView';
import { SettingsView } from './components/views/SettingsView';
import { ReportsView } from './components/views/ReportsView';
import { verifyDataWithGemini, composeAlertEmail } from './services/geminiService';
import { TRANSLATIONS } from './constants';
import { SimulationEngine } from './services/simulationEngine';

const MainApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.MONITOR); // Default to Monitor
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [lang, setLang] = useState<Language>('en'); 
  const [theme, setTheme] = useState<Theme>('dark');
  
  // Real-time Context
  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  
  // App State - INITIALIZED FROM ENGINE
  const engine = useMemo(() => SimulationEngine.getInstance(), []);
  const [alerts, setAlerts] = useState<AnalysisReport[]>(engine.getAlerts());
  
  // Data State
  const [stats2018] = useState<Record<string, number>>(engine.stats!.counts2018);
  const [stats2024] = useState<Record<string, number>>(engine.stats!.counts2024);
  const [transitionData] = useState<TransitionData[]>(engine.stats!.transitions);

  // TRIAD + TEMPORAL STATE
  const [analyticsMode, setAnalyticsMode] = useState<AnalyticsMode>('historical');
  const [policyConfig, setPolicyConfig] = useState<PolicyConfig>({ bufferRadius: 500, verticalMandate: false, landBanking: false });
  const [temporalSeason, setTemporalSeason] = useState<Season>('summer');

  // Weather Logic with Fallback Simulation
  const fetchLiveWeather = useCallback(async () => {
     try {
         // Using current_weather=true for lighter payload and direct windspeed
         const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=13.6288&longitude=79.4192&current_weather=true&timezone=auto');
         
         if (res.ok) {
             const data = await res.json();
             // Open-Meteo returns 'current_weather' object which has windspeed
             setWeather({
                 temperature: data.current_weather.temperature,
                 precipitation: 0, // Not provided in basic current_weather, assumed 0 or fetch separately if needed
                 cloudCover: 20, // Proxy or default
                 windSpeed: data.current_weather.windspeed,
                 isDay: data.current_weather.is_day === 1
             });
         } else {
            throw new Error("API Failed");
         }
     } catch (e) {
         // Fallback Simulation (Sine wave based on hour)
         const hour = new Date().getHours();
         const tempBase = 28 + Math.sin((hour - 6) * Math.PI / 12) * 5; // Peak at 12
         const windBase = 12 + Math.random() * 5;
         setWeather({
             temperature: parseFloat(tempBase.toFixed(1)),
             precipitation: 0,
             cloudCover: 15,
             windSpeed: parseFloat(windBase.toFixed(1)),
             isDay: hour > 6 && hour < 18
         });
     }
  }, []);

  useEffect(() => {
    if (user) {
        fetchLiveWeather();
        const interval = setInterval(fetchLiveWeather, 60000);
        return () => clearInterval(interval);
    }
  }, [fetchLiveWeather, user]);

  const handleLogout = () => {
      setUser(null);
      setCurrentView(ViewMode.MONITOR); // Reset view on logout
  };

  const t = (key: string) => TRANSLATIONS[lang][key] || key;
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#020617]' : 'bg-slate-50';
  const textColor = isDark ? 'text-slate-200' : 'text-slate-800';

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className={`flex h-screen ${bgColor} ${textColor} overflow-hidden font-sans relative`}>
      
      {/* SIDEBAR */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={sidebarOpen} 
        theme={theme} 
        lang={lang} 
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* HEADER */}
        <Header user={user} theme={theme} setTheme={setTheme} weather={weather} title={t(currentView === ViewMode.ANALYTICS ? 'app.analytics' : (currentView === ViewMode.MONITOR ? 'app.title' : 'app.title'))} />

        {/* MAIN VIEW CONTENT */}
        <main className={`flex-1 overflow-hidden relative flex ${bgColor}`}>
           <div className="flex-1 h-full flex flex-col">

              {/* 1. LIVE MONITOR (HOME) */}
              {currentView === ViewMode.MONITOR && (
                  <LiveMonitorView theme={theme} userDept={user.department} lang={lang} />
              )}

              {/* 2. TRIAD ANALYTICS INTERFACE (RE-ENGINEERED LAYOUT) */}
              {currentView === ViewMode.ANALYTICS && (
                 <div className="flex h-full w-full overflow-hidden">
                    
                    {/* LEFT COLUMN: SCROLLABLE CONTENT (Map + Stats) */}
                    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative">
                        
                        {/* Sticky Navigation Tabs */}
                        <div className={`sticky top-0 z-40 py-4 backdrop-blur-md border-b flex justify-center shrink-0 ${isDark ? 'bg-[#020617]/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
                            <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
                                <button onClick={() => setAnalyticsMode('historical')} className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${analyticsMode === 'historical' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-500 hover:text-slate-400'}`}>
                                    <History size={14}/> Historical
                                </button>
                                <button onClick={() => setAnalyticsMode('forecasting')} className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${analyticsMode === 'forecasting' ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40' : 'text-slate-500 hover:text-slate-400'}`}>
                                    <LineChart size={14}/> Forecasting
                                </button>
                                <button onClick={() => setAnalyticsMode('policy')} className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${analyticsMode === 'policy' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-500 hover:text-slate-400'}`}>
                                    <ShieldCheck size={14}/> Policy Sim
                                </button>
                                <button onClick={() => setAnalyticsMode('temporal')} className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${analyticsMode === 'temporal' ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/40' : 'text-slate-500 hover:text-slate-400'}`}>
                                    <Calendar size={14}/> Seasonal & Events
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content Body */}
                        <div className="p-6 space-y-6">
                            
                            {/* MAP SECTION - Expanded Width & Fixed Height */}
                            <div className={`w-full h-[550px] rounded-2xl overflow-hidden border shadow-2xl relative shrink-0 ${isDark ? 'border-slate-700 bg-[#0B1120]' : 'border-slate-300 bg-white'}`}>
                                <MapViewer 
                                    department={user.department}
                                    lang={lang}
                                    theme={theme}
                                    alerts={alerts}
                                    mode={analyticsMode}
                                    policyConfig={policyConfig}
                                    temporalSeason={temporalSeason}
                                />
                            </div>

                            {/* ANALYTICS SECTION - Vertically Stacked & Neat */}
                            <div className="w-full">
                                 {analyticsMode === 'historical' && (
                                     <HistoricalView theme={theme} stats2018={stats2018} stats2024={stats2024} transitionData={transitionData} />
                                 )}
                                 {analyticsMode === 'forecasting' && (
                                     <ForecastingView theme={theme} />
                                 )}
                                 {analyticsMode === 'policy' && (
                                     <PolicyView policyConfig={policyConfig} setPolicyConfig={setPolicyConfig} />
                                 )}
                                 {analyticsMode === 'temporal' && (
                                     <TemporalView season={temporalSeason} setSeason={setTemporalSeason} />
                                 )}
                            </div>
                            
                            <div className="h-20"></div> {/* Spacer for bottom breathing room */}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: FIXED CHAT AGENT (LOCKED) */}
                    <div className={`w-[420px] shrink-0 h-full border-l ${isDark ? 'border-slate-800 bg-[#0B1120]' : 'border-slate-200 bg-slate-50'} relative z-30 shadow-2xl`}>
                        <DecisionSupportSystem stats={stats2024} activeScenarioId={null} />
                    </div>

                 </div>
              )}

              {/* 3. SETTINGS VIEW */}
              {currentView === ViewMode.SETTINGS && (
                  <SettingsView 
                    user={user} 
                    theme={theme} 
                    setTheme={setTheme} 
                    lang={lang}
                    setLang={setLang}
                    onLogout={handleLogout} 
                  />
              )}

              {/* 4. REPORTS VIEW (NEW) */}
              {currentView === ViewMode.REPORTS && (
                   <div className="h-full w-full overflow-hidden">
                      <ReportsView alerts={alerts} setAlerts={setAlerts} lang={lang} />
                   </div>
              )}
           </div>
        </main>
      </div>
    </div>
  );
};

export default MainApp;
