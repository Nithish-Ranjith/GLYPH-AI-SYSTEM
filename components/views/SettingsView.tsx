
import React, { useState } from 'react';
import { LogOut, Moon, Sun, Shield, Bell, Database, Cpu, Activity, Save, RefreshCw, Globe } from 'lucide-react';
import { User, Theme, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';

interface SettingsViewProps {
  user: User;
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Language;
  setLang: (l: Language) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, theme, setTheme, lang, setLang, onLogout }) => {
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#0B1120]' : 'bg-white';
  const borderColor = isDark ? 'border-slate-800' : 'border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const t = TRANSLATIONS[lang];

  // Local state for "dummy" settings
  const [sensitivity, setSensitivity] = useState(0.75);
  const [refreshRate, setRefreshRate] = useState('1m');
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true });

  return (
    <div className={`h-full w-full p-8 overflow-y-auto custom-scrollbar ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* SECTION 1: ACCOUNT & SESSION */}
        <div className={`p-6 rounded-2xl border ${borderColor} ${bgColor} shadow-lg`}>
           <div className="flex justify-between items-center mb-6">
              <h3 className={`font-tech text-xl font-bold flex items-center gap-2 ${textColor}`}>
                  <Shield size={20} className="text-emerald-500" /> {t['settings.account']}
              </h3>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20">
                  {t['settings.session']}
              </span>
           </div>
           
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <img src={user.avatar} className="w-16 h-16 rounded-xl border-2 border-slate-600" alt="Avatar"/>
                 <div>
                    <h4 className={`text-lg font-bold ${textColor}`}>{user.name}</h4>
                    <p className="text-sm text-slate-500 font-mono uppercase">{user.department} // {user.role}</p>
                    <p className="text-xs text-slate-500 mt-1">Session ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                 </div>
              </div>
              
              <button 
                onClick={onLogout}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 transition-all shadow-lg shadow-red-900/30"
              >
                  <LogOut size={16} /> {t['settings.signOut']}
              </button>
           </div>
        </div>

        {/* SECTION 2: SYSTEM APPEARANCE & LOCALIZATION */}
        <div className={`p-6 rounded-2xl border ${borderColor} ${bgColor} shadow-lg`}>
           <h3 className={`font-tech text-xl font-bold mb-6 flex items-center gap-2 ${textColor}`}>
               <Sun size={20} className="text-amber-500" /> {t['settings.appearance']}
           </h3>
           
           <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                 onClick={() => setTheme('light')}
                 className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${!isDark ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500/20' : 'bg-transparent border-slate-700 hover:bg-slate-800'}`}
              >
                 <Sun size={32} className={!isDark ? 'text-amber-500' : 'text-slate-500'} />
                 <span className={`font-bold ${!isDark ? 'text-slate-900' : 'text-slate-500'}`}>Light Mode</span>
              </button>

              <button 
                 onClick={() => setTheme('dark')}
                 className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${isDark ? 'bg-slate-800 border-cyan-500 ring-2 ring-cyan-500/20' : 'bg-transparent border-slate-200 hover:bg-slate-100'}`}
              >
                 <Moon size={32} className={isDark ? 'text-cyan-400' : 'text-slate-400'} />
                 <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-400'}`}>Dark Mode</span>
              </button>
           </div>

           {/* LANGUAGE SELECTOR */}
           <div>
               <label className="text-sm font-bold text-slate-400 mb-2 block flex items-center gap-2">
                   <Globe size={14} /> {t['settings.lang']}
               </label>
               <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setLang('en')}
                    className={`p-3 rounded-lg border text-sm font-bold transition-all ${lang === 'en' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => setLang('te')}
                    className={`p-3 rounded-lg border text-sm font-bold transition-all ${lang === 'te' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    తెలుగు (Telugu)
                  </button>
                  <button 
                    onClick={() => setLang('hi')}
                    className={`p-3 rounded-lg border text-sm font-bold transition-all ${lang === 'hi' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    हिंदी (Hindi)
                  </button>
               </div>
           </div>
        </div>

        {/* SECTION 3: SYSTEM KERNEL CONFIG */}
        <div className={`p-6 rounded-2xl border ${borderColor} ${bgColor} shadow-lg`}>
           <h3 className={`font-tech text-xl font-bold mb-6 flex items-center gap-2 ${textColor}`}>
               <Cpu size={20} className="text-cyan-500" /> {t['settings.kernel']}
           </h3>

           <div className="space-y-6">
               {/* Sensitivity Slider */}
               <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                           <Activity size={14} /> {t['settings.sensitivity']}
                       </label>
                       <span className="text-cyan-500 font-mono font-bold">{(sensitivity * 100).toFixed(0)}%</span>
                   </div>
                   <input 
                      type="range" min="0.1" max="1.0" step="0.05"
                      value={sensitivity}
                      onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                   />
               </div>

               {/* Refresh Rate */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                       <label className="text-sm font-bold text-slate-400 mb-2 block flex items-center gap-2">
                           <RefreshCw size={14} /> {t['settings.refresh']}
                       </label>
                       <select 
                          value={refreshRate}
                          onChange={(e) => setRefreshRate(e.target.value)}
                          className={`w-full p-3 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-cyan-500`}
                       >
                           <option value="realtime">Real-time Stream (Simulated)</option>
                           <option value="1m">Every 1 Minute</option>
                           <option value="15m">Every 15 Minutes</option>
                           <option value="1h">Hourly Batch</option>
                       </select>
                   </div>
                   
                   <div>
                       <label className="text-sm font-bold text-slate-400 mb-2 block flex items-center gap-2">
                           <Database size={14} /> {t['settings.retention']}
                       </label>
                       <select 
                          className={`w-full p-3 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-cyan-500`}
                       >
                           <option value="30d">30 Days (Standard)</option>
                           <option value="90d">90 Days (Extended)</option>
                           <option value="1y">1 Year (Compliance)</option>
                       </select>
                   </div>
               </div>
           </div>
        </div>

        {/* SECTION 4: NOTIFICATIONS */}
        <div className={`p-6 rounded-2xl border ${borderColor} ${bgColor} shadow-lg`}>
           <h3 className={`font-tech text-xl font-bold mb-6 flex items-center gap-2 ${textColor}`}>
               <Bell size={20} className="text-orange-500" /> {t['settings.notifications']}
           </h3>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700/50 bg-slate-800/20">
                  <div>
                      <h4 className={`font-bold text-sm ${textColor}`}>Email Reports</h4>
                      <p className="text-xs text-slate-500">Receive daily PDF summaries to {user.role.toLowerCase().replace(' ', '.')}@tirupati.gov.in</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.email ? 'bg-cyan-600' : 'bg-slate-600'}`}
                  >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-700/50 bg-slate-800/20">
                  <div>
                      <h4 className={`font-bold text-sm ${textColor}`}>SMS High Priority</h4>
                      <p className="text-xs text-slate-500">Immediate alerts for critical Red Zone encroachments.</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, sms: !prev.sms }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.sms ? 'bg-cyan-600' : 'bg-slate-600'}`}
                  >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${notifications.sms ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
              </div>
           </div>
        </div>
        
        {/* ACTION BAR */}
        <div className="flex justify-end pt-4">
            <button className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition-all">
                <Save size={18} /> {t['settings.save']}
            </button>
        </div>

      </div>
    </div>
  );
};
