
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-[#151b2d] p-6 rounded-[28px] border border-white/5 flex flex-col justify-between h-36 group transition-all hover:bg-[#1a233a] hover:border-blue-500/30 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-xl"
    >
      <div className="flex justify-between items-start w-full">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          {title}
        </p>
        {trend && (
           <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
             {trendUp ? '↑' : '↓'}{trend}
           </span>
        )}
      </div>
      <div className="text-3xl font-black text-white tracking-tight group-hover:scale-[1.02] transition-transform origin-left">
        {value}
      </div>
      <div className="text-[10px] font-bold text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-widest flex items-center">
        Analyze Data <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </button>
  );
};
