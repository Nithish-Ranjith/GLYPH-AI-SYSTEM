
import React from 'react';
import { Sun, Moon, Server, Wind, CloudRain } from 'lucide-react';
import { User, LiveWeatherData, Theme, ViewMode } from '../../types';

interface HeaderProps {
  user: User;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  weather: LiveWeatherData | null;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ user, theme, setTheme, weather, title }) => {
  const isDark = theme === 'dark';
  const borderColor = isDark ? 'border-slate-800' : 'border-slate-200';

  return (
    <header className={`h-20 ${isDark ? 'bg-[#0B1120]/80' : 'bg-white/80'} backdrop-blur-md border-b ${borderColor} flex items-center justify-between px-8 shrink-0 z-30`}>
      <div className="flex items-center gap-6">
        <h2 className={`text-2xl font-tech font-bold ${isDark ? 'text-white' : 'text-slate-900'} tracking-wider`}>
          {title}
        </h2>
        {weather && (
             <div className="hidden md:flex items-center gap-4 ml-6 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Sun size={14} className="text-amber-400"/>
                    <span>{weather.temperature}°C</span>
                </div>
                <div className="w-px h-3 bg-slate-600"></div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Wind size={14} className="text-cyan-400"/>
                    <span>{weather.windSpeed} km/h</span>
                </div>
             </div>
        )}
      </div>
      
      <div className="flex items-center gap-8">
        <div className={`flex items-center gap-4 pl-8 border-l ${borderColor}`}>
          <div className="text-right hidden md:block">
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
            <p className="text-[10px] text-cyan-500 uppercase mt-1.5 tracking-wider">{user.department}</p>
          </div>
          <img src={user.avatar} className="w-10 h-10 rounded-lg border border-slate-600 bg-slate-800 shadow-md" alt="Profile" />
        </div>
      </div>
    </header>
  );
};
