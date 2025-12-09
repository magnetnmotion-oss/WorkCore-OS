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

type TimeRange = 'weekly' | 'monthly' | 'yearly';

// Mock data for ranges that aren't provided by the main API endpoint yet
const EXTRA_RANGE_DATA = {
  weekly: [
    { label: 'Mon', amount: 45000 },
    { label: 'Tue', amount: 52000 },
    { label: 'Wed', amount: 49000 },
    { label: 'Thu', amount: 62000 },
    { label: 'Fri', amount: 68000 },
    { label: 'Sat', amount: 74000 },
    { label: 'Sun', amount: 55000 },
  ],
  yearly: [
    { label: '2020', amount: 850000 },
    { label: '2021', amount: 980000 },
    { label: '2022', amount: 1200000 },
    { label: '2023', amount: 1450000 },
    { label: '2024', amount: 1680000 },
  ]
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics>(MOCK_METRICS);
  
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  // New state for chart filtering
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

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

  // Determine chart data based on selection
  const getChartData = () => {
    if (timeRange === 'weekly') return EXTRA_RANGE_DATA.weekly;
    if (timeRange === 'yearly') return EXTRA_RANGE_DATA.yearly;
    // Default to monthly (from API)
    return metrics.revenueTrend.map(d => ({ label: d.month, amount: d.amount }));
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading dashboard...</div>;
  }

  // --- EMPTY STATE DASHBOARD FOR NEW USERS ---
  if (isFreshAccount) {
    return (
      <div className="space-y-8 animate-fade-in p-8 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 min-h-[80vh] shadow-xl">
        <div>
          <h2 className="text-3xl font-bold text-white drop-shadow-sm">Welcome to OMMI! 👋</h2>
          <p className="text-white/90 mt-2 text-lg">Your operating system is ready. Start by adding your business data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={() => onNavigate(ViewState.SALES)}
            className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-left transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Sales & Invoicing</h3>
            <p className="text-slate-500 text-sm mt-1">Create your first invoice and track revenue.</p>
            <span className="text-blue-600 text-sm font-bold mt-4 block group-hover:underline">Get Started &rarr;</span>
          </button>

          <button 
            onClick={() => onNavigate(ViewState.INVENTORY)}
            className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-left transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Inventory</h3>
            <p className="text-slate-500 text-sm mt-1">Add products and manage stock levels.</p>
            <span className="text-purple-600 text-sm font-bold mt-4 block group-hover:underline">Add Items &rarr;</span>
          </button>

          <button 
            onClick={() => onNavigate(ViewState.HR)}
            className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-left transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Team & HR</h3>
            <p className="text-slate-500 text-sm mt-1">Add employees and manage payroll.</p>
            <span className="text-green-600 text-sm font-bold mt-4 block group-hover:underline">Add Team &rarr;</span>
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
      <div className="space-y-8 animate-fade-in pb-8">
        {/* OVERVIEW SECTION - ORANGE GRADIENT BACKGROUND */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Overview</h1>
                    <p className="text-white/90 text-lg">Welcome back, here's what's happening today.</p>
                </div>
                <button 
                  onClick={() => fetchInsights(metrics)}
                  disabled={loadingInsights}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center disabled:opacity-70 border border-blue-700"
                >
                  {loadingInsights ? (
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                     <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  Refresh Insights
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Revenue" 
                  value={`KES ${metrics.totalRevenue.toLocaleString()}`} 
                  trend="12.5%" 
                  trendUp={true} 
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  variant="glass"
                />
                <StatCard 
                  title="Active Leads" 
                  value={metrics.activeLeads} 
                  trend="4.2%" 
                  trendUp={true} 
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                  variant="glass"
                />
                <StatCard 
                  title="Pending Invoices" 
                  value={metrics.pendingInvoices} 
                  trend="2.1%" 
                  trendUp={false} 
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  variant="glass"
                />
                <StatCard 
                  title="Low Stock Items" 
                  value={metrics.lowStockItems} 
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>}
                  variant="glass"
                />
            </div>
        </div>

        {/* REST OF DASHBOARD - WHITE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Analytics */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="text-lg font-bold text-slate-900">Revenue Analytics (KES)</h3>
                  <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    {['Weekly', 'Monthly', 'Yearly'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range.toLowerCase() as TimeRange)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                          timeRange === range.toLowerCase() 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(val: number) => `KES ${val.toLocaleString()}`}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* AI Insights */}
            <div className="bg-[#fffbeb] p-6 rounded-2xl border border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-32 h-32 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <span className="bg-orange-500 text-white p-1.5 rounded-lg mr-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </span>
                    Automated Insights
                </h3>
                
                <div className="space-y-4 relative z-10">
                    {insights.length > 0 ? (
                        insights.map(insight => (
                            <div key={insight.id} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                                <h4 className="font-bold text-slate-800 text-sm mb-1">{insight.title}</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">{insight.description}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-sm">
                           Click "Refresh Insights" to generate AI-powered analysis of your business performance.
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Invoices */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900">Recent Invoices</h3>
                    <button onClick={() => onNavigate(ViewState.SALES)} className="text-blue-600 text-sm font-medium hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                    {recentInvoices.map(inv => (
                        <div key={inv.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer" onClick={() => onNavigate(ViewState.INVOICE_DETAIL, inv.id)}>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">{inv.clientName}</p>
                                    <p className="text-xs text-slate-500">{inv.invoiceNumber}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm text-slate-900">KES {inv.total.toLocaleString()}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{inv.status}</span>
                            </div>
                        </div>
                    ))}
                    {recentInvoices.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No invoices found.</p>}
                </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900">Inventory Alerts</h3>
                    <button onClick={() => onNavigate(ViewState.INVENTORY)} className="text-blue-600 text-sm font-medium hover:underline">Manage Stock</button>
                </div>
                <div className="space-y-3">
                    {lowStockItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100 cursor-pointer" onClick={() => onNavigate(ViewState.INVENTORY_DETAIL, item.id)}>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">{item.name}</p>
                                    <p className="text-xs text-red-600 font-medium">{item.stockLevel} units left</p>
                                </div>
                            </div>
                            <button className="text-xs bg-white border border-red-200 text-red-700 px-3 py-1 rounded-lg font-bold hover:bg-red-50">Restock</button>
                        </div>
                    ))}
                     {lowStockItems.length === 0 && (
                        <div className="text-center py-8">
                            <div className="inline-block p-3 rounded-full bg-green-50 text-green-500 mb-2">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <p className="text-sm text-slate-500">All stock levels are healthy.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
  );
};