import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Invoice, Lead, Quotation } from '../types';

export const Sales: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'quotations' | 'invoices'>('invoices');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching with orgId query param to demonstrate API design compliance
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
      case 'invoices':
        downloadCSV(invoices, 'invoices_export');
        break;
      case 'leads':
        downloadCSV(leads, 'leads_export');
        break;
      case 'quotations':
        downloadCSV(quotations, 'quotations_export');
        break;
    }
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
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
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
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{inv.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{inv.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-slate-900">${inv.total.toFixed(2)}</td>
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
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{lead.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.status === 'qualified' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-slate-900">${lead.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

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
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{q.leadName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{q.items.length} items</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-slate-900">${q.total.toLocaleString()}</td>
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
    </div>
  );
};