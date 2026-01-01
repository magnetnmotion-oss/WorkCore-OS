
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Item, Warehouse, ViewState } from '../types';

interface InventoryProps {
  onNavigate?: (view: ViewState, data: any) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'orders'>('stock');
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: '', sku: '', costPrice: 0, sellPrice: 0, stockLevel: 0, reOrderLevel: 10, description: ''
  });

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/items'),
      apiFetch('/api/v1/warehouses')
    ]).then(([i, w]) => {
      setItems(i);
      setWarehouses(w);
      setLoading(false);
    });
  }, []);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.costPrice || !newItem.sellPrice) {
      alert("Please fill in required fields");
      return;
    }
    try {
      const added = await apiFetch('/api/v1/items', {
        method: 'POST',
        body: JSON.stringify(newItem)
      });
      setItems(prev => [added, ...prev]);
      setShowAddModal(false);
      setNewItem({ name: '', sku: '', costPrice: 0, sellPrice: 0, stockLevel: 0, reOrderLevel: 10, description: '' });
    } catch (e) {
      alert("Failed to add item");
    }
  };

  const lowStockItems = items.filter(i => i.stockLevel <= i.reOrderLevel);

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory OS</h2>
          <p className="text-slate-500 text-sm">Stock Monitoring & Warehousing.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => downloadCSV(items, 'inventory_export')}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center"
          >
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition-all"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-3xl"></div>
           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Stock Value</p>
           <h3 className="text-3xl font-bold">KES {items.reduce((acc, i) => acc + (i.stockLevel * i.sellPrice), 0).toLocaleString()}</h3>
           <p className="text-xs text-slate-400 mt-4 font-medium">{items.length} Unique SKUs tracked</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Critical Stock Alerts</h3>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{lowStockItems.length} Low</span>
           </div>
           <div className="flex space-x-4 overflow-x-auto pb-2 hide-scrollbar">
              {lowStockItems.length > 0 ? lowStockItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => onNavigate && onNavigate(ViewState.INVENTORY_DETAIL, item.id)}
                  className="min-w-[180px] bg-red-50 border border-red-100 p-4 rounded-2xl text-left group hover:bg-red-100 transition-all"
                >
                   <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">{item.sku}</p>
                   <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                   <p className="text-xs font-black text-red-600 mt-1">{item.stockLevel} units left</p>
                </button>
              )) : (
                <p className="text-sm text-slate-400 font-medium">All items are above threshold.</p>
              )}
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
           <div className="py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest animate-pulse">Syncing Warehouse Data...</div>
        ) : items.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
             <h3 className="text-xl font-bold text-slate-900">Inventory is empty</h3>
             <p className="text-slate-500 mt-1 mb-8 max-w-xs mx-auto">Start tracking stock levels and valuation by adding your first product SKU.</p>
             <button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-xl">Add Product</button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / Name</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Level</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onNavigate && onNavigate(ViewState.INVENTORY_DETAIL, item.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-blue-800 tracking-widest group-hover:underline uppercase">{item.sku}</p>
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-900">KES {item.sellPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cost: KES {item.costPrice.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                     <div className="flex flex-col items-center">
                        <span className={`text-lg font-black ${item.stockLevel <= item.reOrderLevel ? 'text-red-600' : 'text-slate-900'}`}>{item.stockLevel}</span>
                        <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                           <div className={`h-full ${item.stockLevel <= item.reOrderLevel ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (item.stockLevel / (item.reOrderLevel * 3)) * 100)}%` }}></div>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${item.stockLevel <= item.reOrderLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.stockLevel <= item.reOrderLevel ? 'Low Stock' : 'Good'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Item Modal Redesigned */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Add Product</h3>
                <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name</label>
                    <input 
                      type="text" 
                      value={newItem.name} 
                      onChange={e => setNewItem({...newItem, name: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-800" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU Code</label>
                       <input 
                         type="text" 
                         value={newItem.sku} 
                         onChange={e => setNewItem({...newItem, sku: e.target.value})} 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900" 
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                       <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none">
                          <option>General Stock</option>
                          <option>Raw Materials</option>
                          <option>Finished Goods</option>
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost Price</label>
                       <input 
                         type="number" 
                         value={newItem.costPrice} 
                         onChange={e => setNewItem({...newItem, costPrice: Number(e.target.value)})} 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900" 
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selling Price</label>
                       <input 
                         type="number" 
                         value={newItem.sellPrice} 
                         onChange={e => setNewItem({...newItem, sellPrice: Number(e.target.value)})} 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900" 
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Stock</label>
                       <input 
                         type="number" 
                         value={newItem.stockLevel} 
                         onChange={e => setNewItem({...newItem, stockLevel: Number(e.target.value)})} 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900" 
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reorder Alert At</label>
                       <input 
                         type="number" 
                         value={newItem.reOrderLevel} 
                         onChange={e => setNewItem({...newItem, reOrderLevel: Number(e.target.value)})} 
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900" 
                       />
                    </div>
                 </div>
              </div>
              <div className="mt-12 flex justify-end space-x-4 pt-8 border-t border-slate-100">
                 <button onClick={() => setShowAddModal(false)} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Discard</button>
                 <button onClick={handleAddItem} className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95">Sync Inventory</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
