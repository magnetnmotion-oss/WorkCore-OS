import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { Invoice, Organization } from '../types';

interface InvoiceDetailProps {
  invoiceId: string;
  onBack: () => void;
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoiceId, onBack }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch by ID, but we'll fetch all and find it from mock
    Promise.all([
      apiFetch('/api/v1/invoices'),
      apiFetch('/api/v1/orgs/org-1')
    ]).then(([invoices, orgData]) => {
      const found = (invoices as Invoice[]).find(i => i.id === invoiceId);
      setInvoice(found || null);
      setOrg(orgData);
      setLoading(false);
    });
  }, [invoiceId]);

  const handleMpesaPayment = async () => {
    setPaying(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 2000));
    alert(`STK Push sent to client for Invoice ${invoice?.invoiceNumber}`);
    setPaying(false);
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading invoice...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 flex items-center space-x-2 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        <span>Back to Invoices</span>
      </button>

      {/* Invoice Paper */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-8 md:p-12 relative overflow-hidden">
        {/* Status Badge */}
        <div className={`absolute top-0 right-0 px-6 py-2 text-sm font-bold uppercase rounded-bl-xl ${
          invoice.status === 'paid' ? 'bg-green-500 text-white' : invoice.status === 'overdue' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-yellow-900'
        }`}>
          {invoice.status}
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-12">
           <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">INVOICE</h1>
              <p className="text-slate-500">#{invoice.invoiceNumber}</p>
           </div>
           <div className="text-right">
              <h3 className="font-bold text-slate-900 text-lg">{org?.name}</h3>
              <p className="text-sm text-slate-500">Nairobi, Kenya</p>
              <p className="text-sm text-slate-500">contact@workcore.os</p>
           </div>
        </div>

        {/* Client & Dates */}
        <div className="flex justify-between items-start mb-12">
           <div>
              <p className="text-xs uppercase font-bold text-slate-400 mb-1">Bill To</p>
              <h4 className="font-bold text-slate-900 text-lg">{invoice.clientName}</h4>
              <p className="text-sm text-slate-500">Client ID: {invoice.clientId}</p>
           </div>
           <div className="text-right space-y-2">
              <div>
                <span className="text-slate-500 text-sm mr-4">Invoice Date:</span>
                <span className="font-medium text-slate-900">{new Date().toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500 text-sm mr-4">Due Date:</span>
                <span className="font-medium text-slate-900">{invoice.dueDate}</span>
              </div>
           </div>
        </div>

        {/* Line Items */}
        <table className="w-full mb-12">
           <thead>
              <tr className="border-b-2 border-slate-100">
                 <th className="text-left py-3 text-sm font-bold text-slate-500 uppercase">Description</th>
                 <th className="text-center py-3 text-sm font-bold text-slate-500 uppercase">Qty</th>
                 <th className="text-right py-3 text-sm font-bold text-slate-500 uppercase">Price</th>
                 <th className="text-right py-3 text-sm font-bold text-slate-500 uppercase">Total</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                   <td className="py-4 text-slate-900 font-medium">{item.description}</td>
                   <td className="py-4 text-center text-slate-500">{item.quantity}</td>
                   <td className="py-4 text-right text-slate-500">${item.unitPrice.toLocaleString()}</td>
                   <td className="py-4 text-right text-slate-900 font-bold">${item.total.toLocaleString()}</td>
                </tr>
              ))}
           </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end border-t border-slate-100 pt-6">
           <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Subtotal</span>
                 <span className="font-medium text-slate-900">${invoice.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Tax (16%)</span>
                 <span className="font-medium text-slate-900">${(invoice.total * 0.16).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3 text-indigo-600">
                 <span>Total Due</span>
                 <span>${(invoice.total * 1.16).toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center print:hidden">
           <div className="flex space-x-3">
              <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50" onClick={() => window.print()}>
                 Print / PDF
              </button>
              <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50">
                 Email Invoice
              </button>
           </div>
           {invoice.status !== 'paid' && (
             <button 
               onClick={handleMpesaPayment}
               disabled={paying}
               className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center"
             >
                {paying ? 'Processing...' : 'Collect with M-Pesa'}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};