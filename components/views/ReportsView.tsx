
import React, { useState, useMemo } from 'react';
import { AnalysisReport, Department, Language } from '../../types';
import { FileText, Filter, Search, AlertTriangle, CheckCircle, Clock, Download, ExternalLink, Mail, MapPin } from 'lucide-react';
import { generateIncidentReport } from '../../services/reportGenerator';
import { composeAlertEmail } from '../../services/geminiService';
import { TRANSLATIONS } from '../../constants';

interface ReportsViewProps {
  alerts: AnalysisReport[];
  setAlerts: React.Dispatch<React.SetStateAction<AnalysisReport[]>>;
  lang: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ alerts, setAlerts, lang }) => {
  const [filterDept, setFilterDept] = useState<Department | 'All'>('All');
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'high' | 'medium' | 'low'>('All');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const t = TRANSLATIONS[lang];

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchDept = filterDept === 'All' || a.department === filterDept;
      const matchSev = filterSeverity === 'All' || a.severity === filterSeverity;
      const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.summary.toLowerCase().includes(search.toLowerCase());
      return matchDept && matchSev && matchSearch;
    });
  }, [alerts, filterDept, filterSeverity, search]);

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'high').length,
    pending: alerts.filter(a => !a.dispatched).length
  };

  const handleDispatch = async (id: string, alert: AnalysisReport) => {
    setProcessingId(id);
    // Simulate Gemini API call for drafting email
    await composeAlertEmail(alert.title, alert.summary, alert.department);
    
    // Update local state
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dispatched: true } : a));
    setProcessingId(null);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-3 gap-6 shrink-0">
        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-lg">
           <div className="w-12 h-12 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <FileText size={24} />
           </div>
           <div>
              <div className="text-2xl font-mono font-bold text-white">{stats.total}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t['reports.total']}</div>
           </div>
        </div>
        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-lg">
           <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center text-red-500 border border-red-500/20">
              <AlertTriangle size={24} />
           </div>
           <div>
              <div className="text-2xl font-mono font-bold text-white">{stats.critical}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t['reports.critical']}</div>
           </div>
        </div>
        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-lg">
           <div className="w-12 h-12 rounded-full bg-amber-900/20 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <Clock size={24} />
           </div>
           <div>
              <div className="text-2xl font-mono font-bold text-white">{stats.pending}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t['reports.pending']}</div>
           </div>
        </div>
      </div>

      {/* 2. FILTER BAR */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-4 shrink-0 shadow-lg">
         <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider mr-2">
             <Filter size={16} /> {t['reports.filters']}
         </div>
         
         <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-700">
             {(['All', 'high', 'medium', 'low'] as const).map(sev => (
                 <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${filterSeverity === sev ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                    {sev === 'All' ? 'All' : sev}
                 </button>
             ))}
         </div>

         <div className="h-6 w-px bg-slate-700 mx-2"></div>

         <select 
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
         >
             <option value="All">All Departments</option>
             <option value="Forestry">{t['class.Forest']}</option>
             <option value="Urban Planning">{t['class.Built-up']}</option>
             <option value="Water Works">{t['class.Water']}</option>
         </select>

         <div className="flex-1"></div>

         <div className="relative">
             <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
             <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t['reports.search']}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-cyan-500"
             />
         </div>
      </div>

      {/* 3. ALERTS TABLE */}
      <div className="flex-1 bg-[#0B1120] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-[#0F172A] text-slate-400 text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                          <th className="p-4 border-b border-slate-800">{t['reports.status']}</th>
                          <th className="p-4 border-b border-slate-800">{t['reports.severity']}</th>
                          <th className="p-4 border-b border-slate-800">{t['reports.dept']}</th>
                          <th className="p-4 border-b border-slate-800 w-1/3">{t['reports.details']}</th>
                          <th className="p-4 border-b border-slate-800">{t['reports.location']}</th>
                          <th className="p-4 border-b border-slate-800 text-right">{t['reports.actions']}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {filteredAlerts.length === 0 ? (
                          <tr>
                              <td colSpan={6} className="p-12 text-center text-slate-500">No alerts found matching current filters.</td>
                          </tr>
                      ) : (
                          filteredAlerts.map(alert => (
                              <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors group">
                                  <td className="p-4">
                                      {alert.dispatched ? (
                                          <span className="flex items-center gap-2 text-emerald-500 text-xs font-bold border border-emerald-900/50 bg-emerald-900/10 px-2 py-1 rounded w-fit">
                                              <CheckCircle size={12} /> {t['reports.sent']}
                                          </span>
                                      ) : (
                                          <span className="flex items-center gap-2 text-amber-500 text-xs font-bold border border-amber-900/50 bg-amber-900/10 px-2 py-1 rounded w-fit">
                                              <Clock size={12} /> {t['reports.open']}
                                          </span>
                                      )}
                                  </td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                          alert.severity === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                          alert.severity === 'medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                      }`}>
                                          {alert.severity}
                                      </span>
                                  </td>
                                  <td className="p-4 text-sm text-slate-300">{alert.department}</td>
                                  <td className="p-4">
                                      <div className="font-bold text-white text-sm mb-1">{alert.title}</div>
                                      <div className="text-xs text-slate-500 line-clamp-2">{alert.summary}</div>
                                      <div className="text-[10px] text-slate-600 mt-1 font-mono">{alert.date} • ID: {alert.id}</div>
                                  </td>
                                  <td className="p-4 text-sm text-slate-400 font-mono">
                                      {alert.lat ? (
                                          <div className="flex items-center gap-1">
                                              <MapPin size={12} className="text-cyan-600"/>
                                              {alert.lat.toFixed(3)}, {alert.lng?.toFixed(3)}
                                          </div>
                                      ) : 'N/A'}
                                  </td>
                                  <td className="p-4">
                                      <div className="flex items-center justify-end gap-2">
                                          <button 
                                            onClick={() => generateIncidentReport(alert)}
                                            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                                            title="Download PDF Report"
                                          >
                                              <Download size={16} />
                                          </button>
                                          
                                          {!alert.dispatched && (
                                              <button 
                                                onClick={() => handleDispatch(alert.id, alert)}
                                                disabled={!!processingId}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                              >
                                                  {processingId === alert.id ? (
                                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                  ) : (
                                                      <><Mail size={14} /> {t['reports.dispatch']}</>
                                                  )}
                                              </button>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>

    </div>
  );
};
