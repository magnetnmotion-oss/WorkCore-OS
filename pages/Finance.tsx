import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Payment, Expense } from '../types';

export const Finance: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/payments'),
      apiFetch('/api/v1/expenses')
    ]).then(([p, e]) => {
      setPayments(p);
      setExpenses(e);
      setLoading(false);
    });
  }, []);

  const handleExport = () => {
    if (activeTab === 'payments') {
      downloadCSV(payments, 'payments_export');
    } else {
      downloadCSV(expenses, 'expenses_export');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Finance</h2>
          <p className="text-slate-500">Payments & Expenses reconciliation.</p>
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
            + Record Expense
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('payments')}
            className={`${activeTab === 'payments' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`${activeTab === 'expenses' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Expenses
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading finance data...</div>
      ) : activeTab === 'payments' ? (
        <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ref ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 text-sm text-slate-900 font-mono">{p.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{p.provider}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{p.date}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">${p.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{e.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{e.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{e.date}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">-${e.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};