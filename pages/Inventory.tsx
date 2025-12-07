import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Item, Warehouse, ViewState } from '../types';

interface InventoryProps {
  onNavigate?: (view: ViewState, data: any) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

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
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Add Item
          </button>
        </div>
      </div>

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
               <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '85%' }}></div>
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
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Item List</h3>
        </div>
        <div className="overflow-x-auto">
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
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading inventory...</td></tr>
              ) : items.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onNavigate && onNavigate(ViewState.INVENTORY_DETAIL, item.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{item.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-500">${item.costPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900 font-medium">${item.sellPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.stockLevel <= item.reOrderLevel ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {item.stockLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};