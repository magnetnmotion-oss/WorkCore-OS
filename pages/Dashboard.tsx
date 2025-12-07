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

        fetchInsights(m as BusinessMetrics);
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors disabled:opacity-50"
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
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Automated Insights</h3>
          </div>
          
          <div className="space-y-4">
            {insights.length === 0 && !loadingInsights && (
               <div className="text-center py-8 text-slate-400">
                 <p>No new insights.</p>
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
                  'bg-blue-50 border-blue-500'
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
              <button onClick={() => onNavigate(ViewState.SALES)} className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
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
              <button onClick={() => onNavigate(ViewState.INVENTORY)} className="text-sm text-indigo-600 font-medium hover:underline">Manage</button>
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
              <button onClick={() => onNavigate(ViewState.OPERATIONS)} className="text-sm text-indigo-600 font-medium hover:underline">Operations Board</button>
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
              <button onClick={() => onNavigate(ViewState.COMMS)} className="text-sm text-indigo-600 font-medium hover:underline">Inbox</button>
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