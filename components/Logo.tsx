
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-8", variant = 'dark' }) => {
  const iconBg = "#1e40af"; // Vivid blue
  const scriptColor = "#f97316"; // Vibrant orange
  const textColor = variant === 'light' ? 'fill-white' : 'fill-slate-900';

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-auto aspect-square" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="26" fill={iconBg} />
        <path 
          d="M75 42c0-15-15-22-25-22-18 0-25 15-25 30 0 20 12 30 25 30 15 0 25-15 25-30 0-8-5-15-12-18-8-3-15-1-20 4s-4 10 0 15c4 4 10 3 14 0s3-8 0-11c-2-2-6-3-8-1-3 2-3 6 0 9 2 2 6 2 8 0"
          stroke={scriptColor}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`text-xl font-black tracking-tighter uppercase italic ${textColor}`}>Ommi</span>
    </div>
  );
};
