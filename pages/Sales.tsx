
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Invoice, Lead, Quotation, ViewState } from '../types';

interface SalesProps {
  onNavigate?: (view: ViewState, data: any) => void;
}

export const Sales: React.FC<SalesProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'quotations' | 'invoices'>('invoices');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal States
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Create Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({
    clientName: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }]
  });

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/leads'),
      apiFetch('/api/v1/quotations'),
      apiFetch('/api/v1/invoices')
    ]).then(([l, q, i]) => {
      setLeads(l);
      setQuotations(q);
      setInvoices(i);
      setLoading(false);
    });
  }, []);

  const handleExport = () => {
    switch (activeTab) {
      case 'invoices': downloadCSV(invoices, 'invoices_export'); break;
      case 'leads': downloadCSV(leads, 'leads_export'); break;
      case 'quotations': downloadCSV(quotations, 'quotations_export'); break;
    }
  };

  const handleCreateInvoice = async () => {
    if (!newInvoiceData.clientName || !newInvoiceData.dueDate) {
        alert("Please fill in client name and due date");
        return;
    }
    
    const itemsWithTotal = newInvoiceData.items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
    }));

    try {
      const newInv = await apiFetch('/api/v1/invoices', {
        method: 'POST',
        body: JSON.stringify({ ...newInvoiceData, items: itemsWithTotal })
      });
      setInvoices(prev => [newInv, ...prev]);
      setShowCreateModal(false);
      setNewInvoiceData({ clientName: '', dueDate: '', items: [{ description: '', quantity: 1, unitPrice: 0 }] });
    } catch (e) {
      alert("Failed to create invoice");
    }
  };

  const handleCreateClick = () => {
      if (activeTab === 'invoices') setShowCreateModal(true);
      else alert(`Create ${activeTab} tool is loading...`);
  };

  const isEmpty = (activeTab === 'invoices' && invoices.length === 0) || 
                  (activeTab === 'leads' && leads.length === 0) || 
                  (activeTab === 'quotations' && quotations.length === 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sales OS</h2>
          <p className="text-slate-500 text-sm">Leads, Proposals, and Billing.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExport}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </button>
          <button 
            onClick={handleCreateClick}
            className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition-all transform active:scale-95"
          >
            + Create {activeTab === 'leads' ? 'Lead' : activeTab === 'quotations' ? 'Proposal' : 'Invoice'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-1 flex space-x-1 w-fit shadow-sm">
        {['invoices', 'leads', 'quotations'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-400 font-medium uppercase tracking-widest text-xs">Accessing Sales Database...</div>
      ) : isEmpty ? (
        <div className="bg-white rounded-[32px] border border-slate-200 p-16 text-center flex flex-col items-center justify-center space-y-6 shadow-sm">
           <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           </div>
           <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">No {activeTab} record found</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">Start your business activity by recording your first {activeTab.slice(0, -1)}. It takes less than 60 seconds.</p>
           </div>
           <button onClick={handleCreateClick} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl">
              Add Record
           </button>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'invoices' && (
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoices.map((inv) => (
                      <tr 
                        key={inv.id} 
                        onClick={() => onNavigate && onNavigate(ViewState.INVOICE_DETAIL, inv.id)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-8 py-5 text-sm font-bold text-blue-800 group-hover:underline">{inv.invoiceNumber}</td>
                        <td className="px-8 py-5 text-sm font-bold text-slate-900">{inv.clientName}</td>
                        <td className="px-8 py-5 text-sm text-slate-500">{inv.dueDate}</td>
                        <td className="px-8 py-5 text-sm font-black text-right text-slate-900">KES {inv.total.toLocaleString()}</td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}

            {activeTab === 'leads' && (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-8 py-5">
                         <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                         <p className="text-xs text-slate-500">{lead.company}</p>
                      </td>
                      <td className="px-8 py-5">
                         <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{lead.source}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${lead.status === 'qualified' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-black text-right text-slate-900">KES {lead.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Detail Modals - Same logic as before but with clickable components inside... */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-[40px] w-full max-w-2xl p-10 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">New Invoice</h3>
                <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Acme Corp"
                          value={newInvoiceData.clientName} 
                          onChange={e => setNewInvoiceData({...newInvoiceData, clientName: e.target.value})} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-800 transition-all" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Due</label>
                        <input 
                          type="date" 
                          value={newInvoiceData.dueDate} 
                          onChange={e => setNewInvoiceData({...newInvoiceData, dueDate: e.target.value})} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-800 transition-all" 
                        />
                    </div>
                 </div>

                 <div className="pt-4">
                    <div className="flex justify-between items-end mb-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Line Items</h4>
                       <button onClick={() => setNewInvoiceData({...newInvoiceData, items: [...newInvoiceData.items, { description: '', quantity: 1, unitPrice: 0 }]})} className="text-blue-700 text-xs font-bold hover:underline">+ Add New Line</button>
                    </div>
                    <div className="space-y-4">
                      {newInvoiceData.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center animate-fade-in">
                           <div className="flex-1">
                              <input placeholder="Service or product" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" value={item.description} onChange={e => {
                                 const items = [...newInvoiceData.items];
                                 items[idx].description = e.target.value;
                                 setNewInvoiceData({...newInvoiceData, items});
                              }} />
                           </div>
                           <div className="w-20">
                              <input type="number" placeholder="Qty" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-center" value={item.quantity} onChange={e => {
                                 const items = [...newInvoiceData.items];
                                 items[idx].quantity = Number(e.target.value);
                                 setNewInvoiceData({...newInvoiceData, items});
                              }} />
                           </div>
                           <div className="w-32">
                              <input type="number" placeholder="Price" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" value={item.unitPrice} onChange={e => {
                                 const items = [...newInvoiceData.items];
                                 items[idx].unitPrice = Number(e.target.value);
                                 setNewInvoiceData({...newInvoiceData, items});
                              }} />
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
              
              <div className="mt-12 flex justify-end space-x-4 pt-8 border-t border-slate-100">
                 <button onClick={() => setShowCreateModal(false)} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Discard</button>
                 <button onClick={handleCreateInvoice} className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95">Generate Invoice</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
