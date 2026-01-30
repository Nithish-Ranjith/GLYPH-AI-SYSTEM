
import React, { useState } from 'react';
import { User, Department } from '../types';
import { Building2, Trees, Droplets, Shield, Map, Activity, Lock, Mail, ArrowRight, AlertCircle, Fingerprint } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const DEPARTMENTS: { dept: Department; role: string; icon: React.ReactNode; color: string; border: string }[] = [
  {
    dept: 'Urban Planning',
    role: 'Chief Town Planner',
    icon: <Building2 size={18} />,
    color: 'bg-indigo-600',
    border: 'border-indigo-500'
  },
  {
    dept: 'Forestry',
    role: 'Divisional Forest Officer',
    icon: <Trees size={18} />,
    color: 'bg-emerald-600',
    border: 'border-emerald-500'
  },
  {
    dept: 'Water Works',
    role: 'Hydrology Engineer',
    icon: <Droplets size={18} />,
    color: 'bg-cyan-600',
    border: 'border-cyan-500'
  },
  {
    dept: 'General Administration',
    role: 'Municipal Commissioner',
    icon: <Shield size={18} />,
    color: 'bg-amber-600',
    border: 'border-amber-500'
  }
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate Auth Delay
    setTimeout(() => {
        // Hardcoded Credentials for Demo
        if (email === 'admin@tirupati.gov.in' && password === 'glyph2024') {
             onLogin({
                 name: 'Sri. Commissioner',
                 role: 'Municipal Commissioner',
                 department: 'General Administration',
                 avatar: 'https://ui-avatars.com/api/?name=Commissioner&background=0F172A&color=fff'
             });
        } else if (email === 'forest@tirupati.gov.in' && password === 'glyph2024') {
             onLogin({
                 name: 'Dr. Forest Head',
                 role: 'Divisional Forest Officer',
                 department: 'Forestry',
                 avatar: 'https://ui-avatars.com/api/?name=Forest+Head&background=0F172A&color=fff'
             });
        } else {
             setError('ACCESS DENIED: Invalid Governance ID or Passcode.');
             setIsLoading(false);
        }
    }, 1500);
  };

  const handleDemoSelect = (dept: typeof DEPARTMENTS[0]) => {
    onLogin({
      name: dept.role === 'Municipal Commissioner' ? 'Sri. Commissioner' : `Dr. ${dept.dept.split(' ')[0]} Head`,
      role: dept.role,
      department: dept.dept,
      avatar: `https://ui-avatars.com/api/?name=${dept.role.replace(' ', '+')}&background=0F172A&color=fff`
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#020617] flex items-center justify-center p-4 font-sans">
      {/* Background Grid Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] animate-[spin_60s_linear_infinite]" 
              style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="bg-[#0B1120] rounded-2xl border border-slate-800 shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[600px]">
        
        {/* Left Side: Branding */}
        <div className="md:w-5/12 bg-[#0F172A] text-white p-10 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(8,145,178,0.4)]">
              <span className="text-2xl font-bold font-tech tracking-tighter">GL</span>
            </div>
            <h1 className="text-4xl font-bold font-tech mb-2 tracking-wide">GLYPH</h1>
            <p className="text-slate-400 text-sm leading-relaxed">Next-Gen Digital Twin Platform for Tirupati Urban Governance & Environmental Monitoring.</p>
          </div>
          
          <div className="space-y-4 relative z-10">
             <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Activity size={12}/> System Status
                </h4>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    OPERATIONAL // LATENCY: 12ms
                </div>
             </div>
             
             <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                 <Shield size={12}/> ENCRYPTED CONNECTION (AES-256)
             </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mb-16"></div>
        </div>

        {/* Right Side: Auth & Demo */}
        <div className="md:w-7/12 bg-[#0B1120] flex flex-col">
          
          {/* 1. SECURE LOGIN FORM */}
          <div className="flex-1 p-10 pb-6">
              <h2 className="text-xl font-bold text-white mb-6 font-tech tracking-wide flex items-center gap-2">
                  <Lock size={20} className="text-cyan-500"/> SECURE ACCESS GATEWAY
              </h2>

              <form onSubmit={handleAuth} className="space-y-5">
                  <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Governance ID</label>
                      <div className="relative group">
                          <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                          <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@tirupati.gov.in"
                            className="w-full bg-[#1e293b]/50 border border-slate-700 text-white text-sm rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600 font-mono"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Passcode</label>
                      <div className="relative group">
                          <Fingerprint className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                          <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-[#1e293b]/50 border border-slate-700 text-white text-sm rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600 font-mono"
                          />
                      </div>
                  </div>

                  {error && (
                      <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/10 p-3 rounded-lg border border-red-900/30 animate-in slide-in-from-top-1">
                          <AlertCircle size={14} /> {error}
                      </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                      {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                          <>AUTHENTICATE <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                      )}
                  </button>
              </form>
          </div>

          {/* 2. COMPACT DEMO OPTIONS */}
          <div className="bg-[#0f172a]/50 border-t border-slate-800 p-8 pt-6">
              <div className="flex items-center gap-4 mb-4">
                  <div className="h-px bg-slate-700 flex-1"></div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Or access via demo protocols</span>
                  <div className="h-px bg-slate-700 flex-1"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d.dept}
                    onClick={() => handleDemoSelect(d)}
                    className="flex items-center gap-3 p-2.5 bg-[#1e293b]/40 border border-slate-700/50 rounded-lg hover:border-slate-600 hover:bg-[#1e293b] transition-all group text-left"
                  >
                    <div className={`w-8 h-8 rounded-md ${d.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                      {d.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-300 text-xs truncate group-hover:text-white">{d.dept}</h3>
                      <p className="text-[9px] text-slate-500 font-mono uppercase truncate">{d.role}</p>
                    </div>
                  </button>
                ))}
              </div>
          </div>

        </div>

      </div>
    </div>
  );
};
