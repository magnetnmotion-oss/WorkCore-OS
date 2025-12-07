import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {trend && (
          <p className={`text-xs font-medium mt-2 flex items-center ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">{trendUp ? '↑' : '↓'}</span>
            {trend}
            <span className="text-slate-400 ml-1 font-normal">vs last month</span>
          </p>
        )}
      </div>
      {icon && (
        <div className="p-3 bg-blue-50 rounded-lg text-blue-900">
          {icon}
        </div>
      )}
    </div>
  );
};