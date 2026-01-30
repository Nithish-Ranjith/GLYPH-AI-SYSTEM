
import React from 'react';
import { BarChart3, FileWarning, Settings, Server, LayoutDashboard } from 'lucide-react';
import { ViewMode, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';

interface SidebarProps {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  isOpen: boolean;
  theme: 'light' | 'dark';
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, theme, lang }) => {
  const isDark = theme === 'dark';
  const sidebarColor = isDark ? 'bg-[#0B1120]' : 'bg-white';
  const borderColor = isDark ? 'border-slate-800' : 'border-slate-200';
  const t = TRANSLATIONS[lang];

  const navItems = [
    { id: ViewMode.MONITOR, label: t['nav.monitor'], icon: LayoutDashboard },
    { id: ViewMode.ANALYTICS, label: t['nav.analytics'], icon: BarChart3 },
    { id: ViewMode.REPORTS, label: t['nav.reports'], icon: FileWarning },
    { id: ViewMode.SETTINGS, label: t['nav.config'], icon: Settings },
    { id: ViewMode.SYSTEM_KERNEL, label: t['nav.kernel'], icon: Server },
  ];

  return (
    <aside className={`${isOpen ? 'w-72' : 'w-20'} ${sidebarColor} border-r ${borderColor} transition-all duration-300 flex flex-col shrink-0 z-40`}>
      <div className={`h-20 flex items-center px-6 border-b ${borderColor}`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-cyan-900/40">GL</div>
          {isOpen && <div>
            <span className={`font-tech font-bold text-lg tracking-widest ${isDark ? 'text-white' : 'text-slate-900'} block`}>GLYPH</span>
            <span className="text-[10px] text-slate-500 font-mono">{t['app.subtitle']}</span>
          </div>}
        </div>
      </div>

      <nav className="flex-1 py-8 space-y-2 px-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
              currentView === item.id 
                ? `bg-cyan-950/40 text-cyan-500 border border-cyan-800/50 shadow-inner` 
                : `${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`
            }`}
          >
            <item.icon size={22} />
            {isOpen && <span className="font-medium text-sm tracking-wide">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};
