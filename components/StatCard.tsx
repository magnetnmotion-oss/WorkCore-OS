import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'glass';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon, variant = 'default' }) => {
  const baseClasses = "rounded-xl p-6 flex items-start justify-between transition-all hover:shadow-lg";
  
  const variants = {
    default: "bg-white shadow-sm border border-slate-100",
    glass: "bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg"
  };

  const textColors = {
    default: { title: "text-slate-500", value: "text-slate-900", sub: "text-slate-400" },
    glass: { title: "text-white/80", value: "text-white", sub: "text-white/70" }
  };

  const colors = textColors[variant];

  return (
    <div className={`${baseClasses} ${variants[variant]}`}>
      <div>
        <p className={`text-sm font-medium mb-1 ${colors.title}`}>{title}</p>
        <h3 className={`text-2xl font-bold ${colors.value}`}>{value}</h3>
        {trend && (
          <p className={`text-xs font-medium mt-2 flex items-center ${
            variant === 'glass' 
              ? (trendUp ? 'text-green-100' : 'text-red-100') 
              : (trendUp ? 'text-green-600' : 'text-red-600')
          }`}>
            <span className="mr-1">{trendUp ? '↑' : '↓'}</span>
            {trend}
            <span className={`ml-1 font-normal ${colors.sub}`}>vs last month</span>
          </p>
        )}
      </div>
      {icon && (
        <div className={`p-3 rounded-lg ${variant === 'glass' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-900'}`}>
          {icon}
        </div>
      )}
    </div>
  );
};