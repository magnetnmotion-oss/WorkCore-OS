
import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { apiFetch } from '../lib/api';
import { generateBusinessInsights } from '../services/geminiService';
import { Insight, BusinessMetrics, ViewState, User } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewState, data?: any) => void;
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/metrics').then(m => {
      const data = m as BusinessMetrics;
      setMetrics(data);
      setLoading(false);
      if (data.totalRevenue > 0 || data.activeLeads > 0) {
        generateBusinessInsights(data).then(setInsights);
      }
    });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Terminal...</p>
    </div>
  );

  const isFirstTimeUser = !metrics || (metrics.totalRevenue === 0 && metrics.activeLeads === 0 && metrics.lowStockItems === 0 && metrics.pendingInvoices === 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            {isFirstTimeUser ? `Welcome, ${user.fullName.split(' ')[0]}` : 'Command Center'}
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
            Workspace: {isFirstTimeUser ? 'Ready for deployment' : 'Nairobi Logistics Hub • Live'}
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-[#151b2d] border border-white/5 p-2 rounded-2xl">
           <div className="flex -space-x-2 mr-3">
              {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#151b2d] bg-slate-700 flex items-center justify-center text-[10px] font-bold">U{i}</div>)}
           </div>
           <button onClick={() => onNavigate(ViewState.COMMS)} className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
              Team Pulse
           </button>
        </div>
      </div>

      {isFirstTimeUser ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-gradient-to-br from-[#151b2d] to-[#0a0f1e] rounded-[40px] p-8 lg:p-12 text-white relative overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute top-0 right-0 w-[60%] h-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-4 tracking-tighter italic uppercase underline decoration-orange-500 underline-offset-8">Initialization</h2>
                <p className="text-slate-400 mb-10 max-w-md text-lg font-medium leading-relaxed">
                  The OMMI core is online. Connect your business streams to activate real-time intelligence.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: '01', label: 'Sales OS', view: ViewState.SALES, desc: 'Add first revenue record' },
                    { id: '02', label: 'Inventory OS', view: ViewState.INVENTORY, desc: 'Sync your warehouse' },
                    { id: '03', label: 'Team OS', view: ViewState.HR, desc: 'Onboard your staff' },
                    { id: '04', label: 'Comms OS', view: ViewState.COMMS, desc: 'Link WhatsApp & Email' }
                  ].map(step => (
                    <button 
                      key={step.id}
                      onClick={() => onNavigate(step.view)}
                      className="flex items-center space-x-5 p-6 bg-white/5 border border-white/5 rounded-[24px] text-left hover:bg-white/10 transition-all group"
                    >
                      <div className="text-2xl font-black text-slate-700 group-hover:text-blue-500 transition-colors">
                        {step.id}
                      </div>
                      <div>
                        <p className="font-black text-xs uppercase tracking-[0.2em]">{step.label}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{step.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#151b2d] p-8 rounded-[40px] border border-white/5">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">AI Co-Pilot Status</h3>
              <div className="bg-[#0a0f1e] rounded-3xl p-8 text-center space-y-6 border border-white/5">
                 <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-500/5">
                    <svg className="w-10 h-10 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <div>
                    <p className="text-sm font-black uppercase text-white tracking-widest">Calibration</p>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold leading-relaxed uppercase tracking-tighter">Gemini is scanning for data streams. Feed the OS to generate growth insights.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard title="Revenue" value={`KES ${(metrics?.totalRevenue || 0).toLocaleString()}`} trend="12.4%" trendUp onClick={() => onNavigate(ViewState.FINANCE)} />
            <StatCard title="Pipeline" value={`${metrics?.activeLeads || 0} Leads`} trend="8" trendUp onClick={() => onNavigate(ViewState.SALES)} />
            <StatCard title="Inventory" value={`${metrics?.lowStockItems || 0} Alerts`} trend={metrics?.lowStockItems ? "Low" : "Optimal"} trendUp={!metrics?.lowStockItems} onClick={() => onNavigate(ViewState.INVENTORY)} />
            <StatCard title="Billing" value={`${metrics?.pendingInvoices || 0} Unpaid`} onClick={() => onNavigate(ViewState.SALES)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-[#151b2d] p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px]"></div>
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div>
                       <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Net Cash Flow</h3>
                       <p className="text-4xl font-black text-white tracking-tighter">KES 719,750</p>
                       <div className="mt-4 flex items-center space-x-4">
                          <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-black uppercase text-slate-400">Incoming</span></div>
                          <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[10px] font-black uppercase text-slate-400">Outgoing</span></div>
                       </div>
                    </div>
                    <div className="w-full md:w-auto flex flex-col space-y-2">
                       <button onClick={() => onNavigate(ViewState.FINANCE)} className="bg-white/5 hover:bg-white/10 border border-white/5 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all text-center">Open Ledger</button>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Operations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', view: ViewState.OPERATIONS, color: 'text-blue-400' },
                  { label: 'Marketing', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', view: ViewState.MARKETING, color: 'text-pink-400' },
                  { label: 'Team OS', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', view: ViewState.HR, color: 'text-purple-400' }
                ].map(mod => (
                  <button key={mod.label} onClick={() => onNavigate(mod.view)} className="bg-[#151b2d] p-8 rounded-[32px] border border-white/5 flex flex-col items-center space-y-4 hover:border-blue-500/40 transition-all group shadow-lg">
                    <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ${mod.color} group-hover:scale-110 transition-transform`}>
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mod.icon} /></svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{mod.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <section className="bg-[#151b2d] p-8 rounded-[40px] border border-white/5 shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">AI Insights</h3>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                </div>
                <div className="space-y-6">
                  {insights.length > 0 ? insights.map((insight) => (
                    <button key={insight.id} onClick={() => onNavigate(ViewState.SALES)} className="w-full text-left p-6 rounded-[24px] bg-[#0a0f1e] border border-white/5 hover:border-blue-500/30 transition-all group">
                      <div className="flex items-center space-x-3 mb-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${insight.type === 'opportunity' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : insight.type === 'risk' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-blue-500'}`}></div>
                         <p className="text-[11px] font-black uppercase text-white tracking-widest group-hover:text-blue-400">{insight.title}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-tighter">{insight.description}</p>
                    </button>
                  )) : (
                    <div className="py-12 text-center">
                       <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Processing Intelligence...</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
