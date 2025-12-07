import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '../components/StatCard';
import { apiFetch } from '../lib/api';
import { MOCK_METRICS } from '../constants'; 
import { generateBusinessInsights } from '../services/geminiService';
import { Insight, BusinessMetrics, Invoice, Item, Task, Message, ViewState } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewState, data?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics>(MOCK_METRICS);
  
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Check if account is fresh (no revenue, no invoices)
  const isFreshAccount = metrics.totalRevenue === 0 && recentInvoices.length === 0 && lowStockItems.length === 0;

  const fetchInsights = async (currentMetrics: BusinessMetrics) => {
    setLoadingInsights(true);
    const results = await generateBusinessInsights(currentMetrics);
    setInsights(results);
    setLoadingInsights(false);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, inv, items, tasks, msgs] = await Promise.all([
          apiFetch('/api/v1/metrics'),
          apiFetch('/api/v1/invoices'),
          apiFetch('/api/v1/items'),
          apiFetch('/api/v1/tasks'),
          apiFetch('/api/v1/messages')
        ]);

        setMetrics(m as BusinessMetrics);
        
        const allInvoices = inv as Invoice[];
        setRecentInvoices(allInvoices.slice(0, 5));

        const allItems = items as Item[];
        setLowStockItems(allItems.filter(i => i.stockLevel <= i.reOrderLevel).slice(0, 5));

        const allTasks = tasks as Task[];
        setPendingTasks(
          allTasks
            .filter(t => t.status !== 'done')
            .sort((a, b) => (a.priority === 'high' ? -1 : 1))
            .slice(0, 5)
        );

        const allMsgs = msgs as Message[];
        setRecentMessages(allMsgs.slice(0, 5));

        // Only fetch insights if there is data
        if ((m as BusinessMetrics).totalRevenue > 0) {
            fetchInsights(m as BusinessMetrics);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading dashboard...</div>;
  }

  // --- EMPTY STATE DASHBOARD FOR NEW USERS ---
  if (isFreshAccount) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome to OMMI! 👋</h2>
          <p className="text-slate-500 mt-2 text-lg">Your operating system is ready. Start by adding your business data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={() => onNavigate(ViewState.SALES)}
            className="group p-6 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-700">Add First Sale</h3>
            <p className="text-sm text-slate-500 mt-1">Create an invoice or record a cash sale to start tracking revenue.</p>
          </button>

          <button 
            onClick={() => onNavigate(ViewState.INVENTORY)}
            className="group p-6 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-green-700">Add Inventory</h3>
            <p className="text-sm text-slate-500 mt-1">List your products or services to manage stock levels.</p>
          </button>

          <button 
            onClick={() => onNavigate(ViewState.HR)}
            className="group p-6 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-purple-700">Add Employee</h3>
            <p className="text-sm text-slate-500 mt-1">Register your team members to manage payroll and HR.</p>
          </button>

          <button 
            onClick={() => onNavigate(ViewState.OPERATIONS)}
            className="group p-6 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-amber-700">Create Project</h3>
            <p className="text-sm text-slate-500 mt-1">Start a new project or task to organize operations.</p>
          </button>

          <button 
            onClick={() => onNavigate(ViewState.COMMS)}
            className="group p-6 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-cyan-700">Connect Channels</h3>
            <p className="text-sm text-slate-500 mt-1">Link your Email or WhatsApp to start communicating.</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
          <p className="text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => fetchInsights(metrics)}
            disabled={loadingInsights}
            className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors disabled:opacity-50"
          >
             {loadingInsights ? (
               <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
             ) : (
               <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             )}
             {loadingInsights ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        </div>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`KES ${metrics.totalRevenue.toLocaleString()}`} 
          trend="12.5%" 
          trendUp={true}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          title="Active Leads" 
          value={metrics.activeLeads} 
          trend="4.2%" 
          trendUp={true}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <StatCard 
          title="Pending Invoices" 
          value={metrics.pendingInvoices} 
          trend="2.1%" 
          trendUp={false}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard 
          title="Low Stock Items" 
          value={metrics.lowStockItems} 
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Analytics (KES)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="amount" stroke="#1e40af" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Automated Insights</h3>
          </div>
          
          <div className="space-y-4">
            {insights.length === 0 && !loadingInsights && (
               <div className="text-center py-8 text-slate-400">
                 <p>No new insights generated yet.</p>
               </div>
            )}
            
            {loadingInsights ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-24 bg-slate-100 rounded-lg"></div>
                <div className="h-24 bg-slate-100 rounded-lg"></div>
              </div>
            ) : (
              insights.map((insight) => (
                <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'opportunity' ? 'bg-green-50 border-green-500' :
                  insight.type === 'risk' ? 'bg-amber-50 border-amber-500' :
                  'bg-blue-50 border-blue-600'
                }`}>
                  <h4 className={`text-sm font-bold ${
                    insight.type === 'opportunity' ? 'text-green-800' :
                    insight.type === 'risk' ? 'text-amber-800' :
                    'text-blue-800'
                  }`}>{insight.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.actionable && (
                    <button className="mt-2 text-xs font-semibold underline opacity-80 hover:opacity-100">
                      View Details →
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detailed Snapshots Grid */}
      <h3 className="text-xl font-bold text-slate-900 pt-4">Recent Activity</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sales Snapshot */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Recent Invoices</h3>
              <button onClick={() => onNavigate(ViewState.SALES)} className="text-sm text-blue-800 font-medium hover:underline">View All</button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                 <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                       <th className="pb-2 font-medium">Invoice</th>
                       <th className="pb-2 font-medium">Client</th>
                       <th className="pb-2 font-medium text-right">Amount</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {recentInvoices.map(inv => (
                       <tr 
                         key={inv.id} 
                         onClick={() => onNavigate(ViewState.INVOICE_DETAIL, inv.id)}
                         className="cursor-pointer hover:bg-slate-50 transition-colors"
                       >
                          <td className="py-2.5 font-medium text-slate-900">{inv.invoiceNumber}</td>
                          <td className="py-2.5 text-slate-500">{inv.clientName}</td>
                          <td className="py-2.5 text-right font-medium text-slate-900">KES {inv.total.toLocaleString()}</td>
                       </tr>
                    ))}
                    {recentInvoices.length === 0 && (
                      <tr><td colSpan={3} className="py-4 text-center text-slate-400">No recent invoices</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Inventory Snapshot */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Inventory Alerts</h3>
              <button onClick={() => onNavigate(ViewState.INVENTORY)} className="text-sm text-blue-800 font-medium hover:underline">Manage</button>
           </div>
           <ul className="space-y-3">
              {lowStockItems.length === 0 ? (
                <li className="text-sm text-slate-400 py-2">Stock levels are healthy.</li>
              ) : lowStockItems.map(item => (
                 <li 
                   key={item.id} 
                   onClick={() => onNavigate(ViewState.INVENTORY_DETAIL, item.id)}
                   className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                 >
                    <div>
                      <span className="block text-slate-700 font-medium">{item.name}</span>
                      <span className="text-xs text-slate-500">{item.sku}</span>
                    </div>
                    <span className="text-red-700 font-bold bg-red-100 px-2.5 py-1 rounded-md text-xs">{item.stockLevel} left</span>
                 </li>
              ))}
           </ul>
        </div>

         {/* Tasks Snapshot */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Pending Priority Tasks</h3>
              <button onClick={() => onNavigate(ViewState.OPERATIONS)} className="text-sm text-blue-800 font-medium hover:underline">Operations Board</button>
           </div>
            <ul className="space-y-4">
              {pendingTasks.length === 0 ? (
                 <li className="text-sm text-slate-400">No pending high priority tasks.</li>
              ) : pendingTasks.map(task => (
                 <li 
                   key={task.id} 
                   onClick={() => onNavigate(ViewState.OPERATIONS)}
                   className="flex items-start space-x-3 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors"
                 >
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <div className="flex-1 min-w-0">
                       <p className="text-slate-900 font-medium truncate">{task.title}</p>
                       <p className="text-xs text-slate-500">Due {task.dueDate} • {task.assignedTo}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide ${task.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>{task.priority}</span>
                 </li>
              ))}
           </ul>
        </div>

         {/* Messages Snapshot */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Latest Messages</h3>
              <button onClick={() => onNavigate(ViewState.COMMS)} className="text-sm text-blue-800 font-medium hover:underline">Inbox</button>
           </div>
            <div className="space-y-4">
              {recentMessages.length === 0 ? (
                 <p className="text-sm text-slate-400">Inbox is empty.</p>
              ) : recentMessages.map(msg => (
                 <div 
                   key={msg.id} 
                   onClick={() => onNavigate(ViewState.COMMS)}
                   className="flex items-start space-x-3 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors"
                 >
                    <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${msg.channel === 'WhatsApp' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                       <span className="text-[10px] font-bold uppercase">{msg.channel[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-baseline">
                          <p className={`font-medium truncate ${msg.unread ? 'text-slate-900' : 'text-slate-600'}`}>{msg.sender}</p>
                          <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{msg.time}</span>
                       </div>
                       <p className={`text-xs truncate ${msg.unread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{msg.preview}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};