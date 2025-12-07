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
    name: '', sku: '', costPrice: 0, sellPrice: 0, stockLevel: 0, description: ''
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
      setItems(prev => [...prev, added]);
      setShowAddModal(false);
      setNewItem({ name: '', sku: '', costPrice: 0, sellPrice: 0, stockLevel: 0, description: '' });
      alert("Item added successfully!");
    } catch (e) {
      alert("Failed to add item");
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
          <p className="text-slate-500">Track stock levels across warehouses.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => downloadCSV(items, 'inventory_export')}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Item
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('stock')}
            className={`${activeTab === 'stock' ? 'border-blue-800 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${activeTab === 'orders' ? 'border-blue-800 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Purchase Orders
          </button>
        </nav>
      </div>

      {activeTab === 'stock' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900">{warehouses[0]?.name || 'Central Warehouse'}</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Capacity</span>
                   <span className="font-medium text-slate-900">85%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2">
                   <div className="bg-blue-800 h-2 rounded-full" style={{ width: '85%' }}></div>
                 </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
               <h3 className="font-bold text-slate-900 mb-4">Low Stock Alerts</h3>
               <ul className="space-y-3">
                 {items.filter(i => i.stockLevel <= i.reOrderLevel).map(item => (
                   <li 
                     key={item.id} 
                     onClick={() => onNavigate && onNavigate(ViewState.INVENTORY_DETAIL, item.id)}
                     className="flex items-center justify-between text-sm p-2 bg-red-50 rounded cursor-pointer hover:bg-red-100 transition-colors"
                   >
                     <span className="text-slate-700 font-medium">{item.name} <span className="text-slate-500 font-normal">({item.sku})</span></span>
                     <span className="text-red-600 font-bold">{item.stockLevel} left</span>
                   </li>
                 ))}
                 {items.filter(i => i.stockLevel <= i.reOrderLevel).length === 0 && (
                   <p className="text-sm text-slate-400">Stock levels are healthy.</p>
                 )}
               </ul>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-slate-400">Loading inventory...</div>
              ) : items.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                   <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                   </div>
                   <h3 className="text-lg font-bold text-slate-900">No Inventory Items</h3>
                   <p className="text-slate-500 mb-6">Add your products to start tracking stock.</p>
                   <button onClick={() => setShowAddModal(true)} className="bg-blue-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-900">Add First Item</button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Cost</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {items.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => onNavigate && onNavigate(ViewState.INVENTORY_DETAIL, item.id)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{item.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-500">KES {item.costPrice.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900 font-medium">KES {item.sellPrice.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.stockLevel <= item.reOrderLevel ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {item.stockLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
           <div className="text-slate-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
           </div>
           <h3 className="text-lg font-bold text-slate-900">No Purchase Orders</h3>
           <p className="text-slate-500 mb-6">Create a purchase order to restock your inventory.</p>
           <button className="bg-blue-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors">
              Create Order
           </button>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl animate-fade-in">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Add New Product</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                    <input 
                      type="text" 
                      value={newItem.name} 
                      onChange={e => setNewItem({...newItem, name: e.target.value})} 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800" 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SKU (Optional)</label>
                    <input 
                      type="text" 
                      value={newItem.sku} 
                      onChange={e => setNewItem({...newItem, sku: e.target.value})} 
                      placeholder="Leave empty to auto-generate"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price (KES)</label>
                       <input 
                         type="number" 
                         value={newItem.costPrice} 
                         onChange={e => setNewItem({...newItem, costPrice: Number(e.target.value)})} 
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800" 
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (KES)</label>
                       <input 
                         type="number" 
                         value={newItem.sellPrice} 
                         onChange={e => setNewItem({...newItem, sellPrice: Number(e.target.value)})} 
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800" 
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                       <input 
                         type="number" 
                         value={newItem.stockLevel} 
                         onChange={e => setNewItem({...newItem, stockLevel: Number(e.target.value)})} 
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800" 
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                       <input 
                         type="text" 
                         value={newItem.description} 
                         onChange={e => setNewItem({...newItem, description: e.target.value})} 
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-800" 
                       />
                    </div>
                 </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                 <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button onClick={handleAddItem} className="px-6 py-2 bg-blue-800 text-white font-medium hover:bg-blue-900 rounded-lg">Save Product</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};