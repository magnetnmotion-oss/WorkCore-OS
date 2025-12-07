import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { apiFetch } from '../lib/api';
import { MarketingCampaign, MarketingTemplate } from '../types';

export const Marketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'templates'>('dashboard');
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Campaign Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignChannel, setNewCampaignChannel] = useState<'WhatsApp' | 'Email' | 'SMS'>('WhatsApp');

  // Detail View State
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/marketing/campaigns'),
      apiFetch('/api/v1/marketing/templates')
    ]).then(([c, t]) => {
      setCampaigns(c);
      setTemplates(t);
      setLoading(false);
    });
  }, []);

  const handleCreateCampaign = async () => {
    if (!newCampaignName) return;
    try {
      const newCamp = await apiFetch('/api/v1/marketing/campaigns', {
        method: 'POST',
        body: JSON.stringify({ name: newCampaignName, channel: newCampaignChannel })
      });
      setCampaigns(prev => [newCamp, ...prev]);
      setShowCreateModal(false);
      setNewCampaignName('');
      alert("Campaign Created Successfully!");
    } catch (e) {
      alert("Failed to create campaign");
    }
  };

  const chartData = campaigns.map(c => ({
    name: c.name,
    clicks: c.clickCount,
    conversions: c.conversionCount,
    revenue: c.revenueGenerated
  })).reverse(); 

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Marketing & Growth</h2>
          <p className="text-slate-500">Manage campaigns, track performance, and grow your customer base.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Create Campaign
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {['dashboard', 'campaigns', 'templates'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading marketing data...</div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                     <p className="text-sm font-medium text-slate-500">Total Campaigns</p>
                     <h3 className="text-2xl font-bold text-slate-900 mt-1">{campaigns.length}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                     <p className="text-sm font-medium text-slate-500">Total Clicks</p>
                     <h3 className="text-2xl font-bold text-indigo-600 mt-1">{campaigns.reduce((acc, c) => acc + c.clickCount, 0).toLocaleString()}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                     <p className="text-sm font-medium text-slate-500">Revenue Generated</p>
                     <h3 className="text-2xl font-bold text-green-600 mt-1">${campaigns.reduce((acc, c) => acc + c.revenueGenerated, 0).toLocaleString()}</h3>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Clicks & Conversions Chart */}
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-80">
                     <h3 className="text-lg font-bold text-slate-900 mb-4">Campaign Performance</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis dataKey="name" hide />
                           <YAxis />
                           <Tooltip />
                           <Legend />
                           <Bar dataKey="clicks" fill="#4F46E5" name="Clicks" />
                           <Bar dataKey="conversions" fill="#10B981" name="Conversions" />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-80">
                     <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Attribution</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                           <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                 <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis dataKey="name" hide />
                           <YAxis />
                           <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                           <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                     <tr>
                        <th className="px-6 py-4">Campaign Name</th>
                        <th className="px-6 py-4">Channel</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Sent</th>
                        <th className="px-6 py-4 text-right">Clicks</th>
                        <th className="px-6 py-4 text-right">Revenue</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {campaigns.map(camp => (
                        <tr 
                          key={camp.id} 
                          onClick={() => setSelectedCampaign(camp)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                           <td className="px-6 py-4 font-medium text-slate-900">{camp.name}</td>
                           <td className="px-6 py-4">
                              <span className={`flex items-center text-sm ${camp.channel === 'WhatsApp' ? 'text-green-600' : camp.channel === 'Email' ? 'text-blue-600' : 'text-slate-600'}`}>
                                 {camp.channel}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                                 camp.status === 'active' ? 'bg-green-100 text-green-700' : 
                                 camp.status === 'completed' ? 'bg-slate-100 text-slate-600' : 
                                 'bg-yellow-100 text-yellow-700'
                              }`}>
                                 {camp.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right text-sm text-slate-500">{camp.sentCount.toLocaleString()}</td>
                           <td className="px-6 py-4 text-right text-sm font-medium text-indigo-600">{camp.clickCount.toLocaleString()}</td>
                           <td className="px-6 py-4 text-right text-sm font-bold text-green-600">${camp.revenueGenerated.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
               {templates.map(tpl => (
                  <div key={tpl.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative">
                     <div className="flex justify-between items-start mb-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${
                           tpl.channel === 'WhatsApp' ? 'bg-green-50 text-green-700 border-green-200' : 
                           tpl.channel === 'Email' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                           'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>{tpl.channel}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="text-indigo-600 text-sm font-medium hover:underline">Edit</button>
                        </div>
                     </div>
                     <h4 className="font-bold text-slate-900 mb-2">{tpl.name}</h4>
                     <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 font-mono mb-4 h-24 overflow-hidden border border-slate-100">
                        {tpl.content}
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {tpl.variables.map(v => (
                           <span key={v} className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">
                              {`{{${v}}}`}
                           </span>
                        ))}
                     </div>
                  </div>
               ))}
               
               {/* Create Template Card */}
               <div className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer min-h-[250px]">
                  <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="font-medium">Create New Template</span>
               </div>
            </div>
          )}
        </>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
               <h3 className="text-lg font-bold text-slate-900 mb-4">Launch Campaign</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name</label>
                     <input 
                       type="text" 
                       value={newCampaignName}
                       onChange={e => setNewCampaignName(e.target.value)}
                       className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                       placeholder="e.g. Summer Sale"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Channel</label>
                     <div className="grid grid-cols-3 gap-2">
                        {['WhatsApp', 'Email', 'SMS'].map((chan) => (
                           <button
                              key={chan}
                              onClick={() => setNewCampaignChannel(chan as any)}
                              className={`py-2 text-sm font-medium rounded-lg border ${newCampaignChannel === chan ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                           >
                              {chan}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={handleCreateCampaign} className="px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg">Launch</button>
               </div>
            </div>
         </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl w-full max-w-3xl p-8 shadow-2xl animate-fade-in relative overflow-hidden">
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedCampaign.name}</h2>
                    <p className="text-sm text-slate-500">Launched on {selectedCampaign.startDate} via {selectedCampaign.channel}</p>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedCampaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                 }`}>
                    {selectedCampaign.status}
                 </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                 <div className="bg-slate-50 p-4 rounded-xl text-center">
                    <span className="block text-slate-500 text-xs font-bold uppercase mb-1">Delivered</span>
                    <span className="text-2xl font-bold text-slate-900">{selectedCampaign.deliveredCount}</span>
                 </div>
                 <div className="bg-indigo-50 p-4 rounded-xl text-center">
                    <span className="block text-indigo-500 text-xs font-bold uppercase mb-1">Clicks</span>
                    <span className="text-2xl font-bold text-indigo-700">{selectedCampaign.clickCount}</span>
                 </div>
                 <div className="bg-green-50 p-4 rounded-xl text-center">
                    <span className="block text-green-500 text-xs font-bold uppercase mb-1">Conversions</span>
                    <span className="text-2xl font-bold text-green-700">{selectedCampaign.conversionCount}</span>
                 </div>
                 <div className="bg-yellow-50 p-4 rounded-xl text-center">
                    <span className="block text-yellow-600 text-xs font-bold uppercase mb-1">Revenue</span>
                    <span className="text-2xl font-bold text-yellow-700">${selectedCampaign.revenueGenerated.toLocaleString()}</span>
                 </div>
              </div>

              {/* Conversion Funnel */}
              <div className="h-64 w-full">
                 <h3 className="font-bold text-slate-900 mb-4">Conversion Funnel</h3>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={[
                       { name: 'Sent', value: selectedCampaign.sentCount },
                       { name: 'Delivered', value: selectedCampaign.deliveredCount },
                       { name: 'Clicked', value: selectedCampaign.clickCount },
                       { name: 'Converted', value: selectedCampaign.conversionCount },
                    ]}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                       <XAxis type="number" />
                       <YAxis type="category" dataKey="name" width={80} />
                       <Tooltip cursor={{fill: 'transparent'}} />
                       <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={30}>
                          {
                             [0,1,2,3].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))
                          }
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};