import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Payment, Expense } from '../types';

export const Finance: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');
  const [loading, setLoading] = useState(true);
  
  // Detail Modal States
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Add Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'General',
    amount: '',
    description: ''
  });

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

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description) return;
    try {
      const created = await apiFetch('/api/v1/expenses', {
        method: 'POST',
        body: JSON.stringify(newExpense)
      });
      setExpenses(prev => [created, ...prev]);
      setShowExpenseModal(false);
      setNewExpense({ category: 'General', amount: '', description: '' });
      alert("Expense recorded.");
    } catch (e) {
      alert("Failed to record expense");
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
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Record Expense
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('payments')}
            className={`${activeTab === 'payments' ? 'border-blue-800 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`${activeTab === 'expenses' ? 'border-blue-800 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
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
                <tr 
                  key={p.id} 
                  onClick={() => setSelectedPayment(p)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-900 font-mono">{p.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 capitalize">{p.provider}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{p.date}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">KES {p.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                <tr 
                  key={e.id}
                  onClick={() => setSelectedExpense(e)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{e.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{e.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{e.date}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">-KES {e.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Record Expense</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (KES)</label>
                    <input 
                      type="number" 
                      value={newExpense.amount} 
                      onChange={e => setNewExpense({...newExpense, amount: e.target.value})} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800" 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                      value={newExpense.category} 
                      onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none"
                    >
                       <option>General</option>
                       <option>Travel</option>
                       <option>Office</option>
                       <option>Software</option>
                       <option>Marketing</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      value={newExpense.description} 
                      onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800 h-24 resize-none" 
                    />
                 </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                 <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button onClick={handleAddExpense} className="px-6 py-2 bg-blue-800 text-white font-medium hover:bg-blue-900 rounded-lg">Save Record</button>
              </div>
           </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in relative">
              <button 
                onClick={() => setSelectedPayment(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Payment Details</h3>
              
              <div className="space-y-4">
                 <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Amount Received</span>
                    <span className="text-3xl font-bold text-slate-900">KES {selectedPayment.amount.toLocaleString()}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                       <p className="text-slate-500 mb-1">Transaction ID</p>
                       <p className="font-mono text-slate-900 font-medium">{selectedPayment.id}</p>
                    </div>
                    <div>
                       <p className="text-slate-500 mb-1">Date</p>
                       <p className="text-slate-900 font-medium">{selectedPayment.date}</p>
                    </div>
                    <div>
                       <p className="text-slate-500 mb-1">Provider</p>
                       <p className="text-slate-900 font-medium capitalize">{selectedPayment.provider}</p>
                    </div>
                    <div>
                       <p className="text-slate-500 mb-1">Linked Invoice</p>
                       <p className="text-blue-800 font-medium cursor-pointer hover:underline">{selectedPayment.invoiceId}</p>
                    </div>
                 </div>

                 <div className="border-t border-slate-100 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-slate-500">Status</span>
                       <span className={`px-3 py-1 text-sm font-bold rounded-full ${selectedPayment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {selectedPayment.status.toUpperCase()}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in relative">
              <button 
                onClick={() => setSelectedExpense(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Expense Record</h3>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-sm font-bold text-slate-500 uppercase">{selectedExpense.category}</p>
                       <h4 className="text-lg font-bold text-slate-900 mt-1">{selectedExpense.description}</h4>
                    </div>
                    <span className="text-xl font-bold text-slate-900">KES {selectedExpense.amount.toLocaleString()}</span>
                 </div>
                 
                 <div className="py-4 border-t border-b border-slate-100 grid grid-cols-2 gap-4 text-sm">
                    <div>
                       <p className="text-slate-500 mb-1">Date Occurred</p>
                       <p className="text-slate-900">{selectedExpense.date}</p>
                    </div>
                    <div>
                       <p className="text-slate-500 mb-1">Expense ID</p>
                       <p className="text-slate-900 font-mono">{selectedExpense.id}</p>
                    </div>
                 </div>

                 <div className="text-sm">
                    <p className="text-slate-500 mb-2">Attachments</p>
                    <div className="flex space-x-2">
                       <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       </div>
                       <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};