import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch } from '../lib/api';
import { Item, StockMovement } from '../types';

interface InventoryDetailProps {
  itemId: string;
  onBack: () => void;
}

export const InventoryDetail: React.FC<InventoryDetailProps> = ({ itemId, onBack }) => {
  const [item, setItem] = useState<Item | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data fetch - real app would use specific endpoint
    apiFetch('/api/v1/items').then((items: Item[]) => {
       const found = items.find(i => i.id === itemId);
       setItem(found || null);
       setLoading(false);
       
       // Mock movements data since we don't have it in types yet
       setMovements([
         { id: 'sm-1', itemId: itemId, warehouseId: 'w-1', delta: 50, reason: 'Purchase Order #PO-001', date: '2024-05-01' },
         { id: 'sm-2', itemId: itemId, warehouseId: 'w-1', delta: -10, reason: 'Sales Order #INV-001', date: '2024-05-10' },
         { id: 'sm-3', itemId: itemId, warehouseId: 'w-1', delta: -5, reason: 'Damaged', date: '2024-05-15' },
         { id: 'sm-4', itemId: itemId, warehouseId: 'w-1', delta: 20, reason: 'Restock', date: '2024-06-01' },
       ]);
    });
  }, [itemId]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading item...</div>;
  if (!item) return <div className="p-8 text-center text-red-500">Item not found</div>;

  const stockHistoryData = movements.map(m => ({
    date: m.date,
    stock: item.stockLevel + m.delta // Simplified math for viz
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
         <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 flex items-center space-x-2 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Back to Inventory</span>
         </button>
         <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Edit Item</button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">+ New Stock Order</button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Main Details */}
         <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h1 className="text-2xl font-bold text-slate-900">{item.name}</h1>
                  <p className="text-slate-500 font-mono text-sm">{item.sku}</p>
               </div>
               <div className={`px-4 py-2 rounded-lg text-center ${item.stockLevel <= item.reOrderLevel ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  <span className="block text-2xl font-bold">{item.stockLevel}</span>
                  <span className="text-xs font-bold uppercase">In Stock</span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
               <div>
                  <p className="text-sm text-slate-500 mb-1">Cost Price</p>
                  <p className="text-xl font-medium text-slate-900">${item.costPrice.toFixed(2)}</p>
               </div>
               <div>
                  <p className="text-sm text-slate-500 mb-1">Selling Price</p>
                  <p className="text-xl font-medium text-slate-900">${item.sellPrice.toFixed(2)}</p>
               </div>
               <div>
                  <p className="text-sm text-slate-500 mb-1">Reorder Level</p>
                  <p className="text-lg font-medium text-slate-900">{item.reOrderLevel} units</p>
               </div>
               <div>
                  <p className="text-sm text-slate-500 mb-1">Description</p>
                  <p className="text-sm text-slate-700">{item.description}</p>
               </div>
            </div>

            <div className="h-64 w-full mt-6">
               <h3 className="font-bold text-slate-900 mb-4">Stock History</h3>
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stockHistoryData}>
                    <defs>
                      <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="stock" stroke="#4F46E5" fillOpacity={1} fill="url(#colorStock)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Movement Log */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h3 className="font-bold text-slate-900 mb-4">Recent Movements</h3>
            <div className="flex-1 overflow-y-auto space-y-4">
               {movements.map(move => (
                  <div key={move.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                     <div>
                        <p className="text-sm font-medium text-slate-900">{move.reason}</p>
                        <p className="text-xs text-slate-500">{move.date}</p>
                     </div>
                     <span className={`font-bold ${move.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {move.delta > 0 ? '+' : ''}{move.delta}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};