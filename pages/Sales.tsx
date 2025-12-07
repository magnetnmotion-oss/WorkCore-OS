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
      apiFetch('/api/v1/leads?orgId=org-1'),
      apiFetch('/api/v1/quotations?orgId=org-1'),
      apiFetch('/api/v1/invoices?orgId=org-1')
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

  const handleAddLineItem = () => {
    setNewInvoiceData({
      ...newInvoiceData,
      items: [...newInvoiceData.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const newItems = [...newInvoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setNewInvoiceData({ ...newInvoiceData, items: newItems });
  };

  const handleRemoveLineItem = (index: number) => {
    const newItems = newInvoiceData.items.filter((_, i) => i !== index);
    setNewInvoiceData({ ...newInvoiceData, items: newItems });
  };

  const handleCreateInvoice = async () => {
    if (!newInvoiceData.clientName || !newInvoiceData.dueDate) {
        alert("Please fill in client name and due date");
        return;
    }
    
    // Calculate totals for items
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
      alert("Invoice Created Successfully!");
    } catch (e) {
      alert("Failed to create invoice");
    }
  };

  const handleCreateClick = () => {
      if (activeTab === 'invoices') setShowCreateModal(true);
      else alert(`Create ${activeTab} feature coming in next update!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sales</h2>
          <p className="text-slate-500">Manage leads, quotations, and invoices.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExport}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
          <button 
            onClick={handleCreateClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New {activeTab === 'leads' ? 'Lead' : activeTab === 'quotations' ? 'Quote' : 'Invoice'}
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab('invoices')} className={`${activeTab === 'invoices' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Invoices</button>
          <button onClick={() => setActiveTab('leads')} className={`${activeTab === 'leads' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Leads</button>
          <button onClick={() => setActiveTab('quotations')} className={`${activeTab === 'quotations' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Quotations</button>
        </nav>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading sales data...</div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'invoices' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {invoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      onClick={() => onNavigate && onNavigate(ViewState.INVOICE_DETAIL, inv.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{inv.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{inv.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-slate-900">KES {inv.total.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : inv.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Leads Table - Rendered only if tab active */}
            {activeTab === 'leads' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Source</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {leads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{lead.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.status === 'qualified' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-slate-900">KES {lead.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Quotations Table - Rendered only if tab active */}
            {activeTab === 'quotations' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Lead</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Expires</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {quotations.map((q) => (
                    <tr 
                      key={q.id} 
                      onClick={() => setSelectedQuotation(q)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{q.leadName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{q.items.length} items</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-slate-900">KES {q.total.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${q.status === 'sent' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{q.expiresAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Create New Invoice</h3>
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                        <input 
                          type="text" 
                          value={newInvoiceData.clientName} 
                          onChange={e => setNewInvoiceData({...newInvoiceData, clientName: e.target.value})} 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                        <input 
                          type="date" 
                          value={newInvoiceData.dueDate} 
                          onChange={e => setNewInvoiceData({...newInvoiceData, dueDate: e.target.value})} 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                    </div>
                 </div>

                 <div className="border-t border-slate-200 pt-4">
                    <h4 className="font-bold text-slate-900 mb-3">Line Items</h4>
                    {newInvoiceData.items.map((item, idx) => (
                       <div key={idx} className="grid grid-cols-12 gap-2 mb-3 items-end">
                          <div className="col-span-6">
                             <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                             <input 
                                type="text" 
                                value={item.description}
                                onChange={e => updateLineItem(idx, 'description', e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm outline-none"
                             />
                          </div>
                          <div className="col-span-2">
                             <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                             <input 
                                type="number" 
                                value={item.quantity}
                                onChange={e => updateLineItem(idx, 'quantity', Number(e.target.value))}
                                className="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm outline-none"
                             />
                          </div>
                          <div className="col-span-3">
                             <label className="block text-xs font-medium text-slate-500 mb-1">Price (KES)</label>
                             <input 
                                type="number" 
                                value={item.unitPrice}
                                onChange={e => updateLineItem(idx, 'unitPrice', Number(e.target.value))}
                                className="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm outline-none"
                             />
                          </div>
                          <div className="col-span-1 text-center pb-2">
                             <button onClick={() => handleRemoveLineItem(idx)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                          </div>
                       </div>
                    ))}
                    <button onClick={handleAddLineItem} className="text-sm text-indigo-600 font-medium hover:underline">+ Add Item</button>
                 </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                 <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button onClick={handleCreateInvoice} className="px-6 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg">Create Invoice</button>
              </div>
           </div>
        </div>
      )}

      {/* Re-using previous modals for Lead/Quote details... */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl animate-fade-in relative">
              <button onClick={() => setSelectedLead(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="flex items-center space-x-4 mb-6">
                 <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-xl font-bold text-slate-500">{selectedLead.name.charAt(0)}</div>
                 <div><h3 className="text-xl font-bold text-slate-900">{selectedLead.name}</h3><p className="text-sm text-slate-500">{selectedLead.company} • {selectedLead.email}</p></div>
              </div>
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg"><p className="text-xs text-slate-500 uppercase font-bold">Status</p><p className="font-medium text-slate-900 capitalize">{selectedLead.status}</p></div>
                    <div className="bg-slate-50 p-3 rounded-lg"><p className="text-xs text-slate-500 uppercase font-bold">Potential Value</p><p className="font-medium text-green-700">KES {selectedLead.value.toLocaleString()}</p></div>
                 </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                 <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50">Edit</button>
                 <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Convert to Deal</button>
              </div>
           </div>
        </div>
      )}

      {selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-2xl p-8 shadow-2xl animate-fade-in relative">
              <button onClick={() => setSelectedQuotation(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-4">
                 <div><h3 className="text-2xl font-bold text-slate-900">Quotation</h3><p className="text-sm text-slate-500 text-mono">Ref: {selectedQuotation.id}</p></div>
                 <div className="text-right"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedQuotation.status === 'sent' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'}`}>{selectedQuotation.status}</span></div>
              </div>
              <table className="w-full mb-6">
                 <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase text-left"><th className="py-2">Description</th><th className="py-2 text-center">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Total</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {selectedQuotation.items.map((item, i) => (
                       <tr key={i} className="text-sm"><td className="py-3 text-slate-900">{item.description}</td><td className="py-3 text-center text-slate-600">{item.quantity}</td><td className="py-3 text-right text-slate-600">KES {item.unitPrice.toLocaleString()}</td><td className="py-3 text-right font-medium text-slate-900">KES {item.total.toLocaleString()}</td></tr>
                    ))}
                 </tbody>
              </table>
              <div className="flex justify-end border-t border-slate-200 pt-4"><div className="text-right"><p className="text-sm text-slate-500 mb-1">Grand Total</p><p className="text-2xl font-bold text-indigo-600">KES {selectedQuotation.total.toLocaleString()}</p></div></div>
           </div>
        </div>
      )}
    </div>
  );
};