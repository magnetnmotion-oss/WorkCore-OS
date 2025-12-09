import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10", variant = 'dark' }) => {
  // Brand Colors: Blue #29abe2 (approx text), Orange #f7931e (approx dot)
  // When variant is 'light' (on dark background/orange login), text is White.
  // When variant is 'dark' (on light background), text is Blue.
  const textColor = variant === 'light' ? 'fill-white' : 'fill-[#29abe2]';
  
  return (
    <svg viewBox="0 0 160 60" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="OMMI Logo">
      <defs>
        <style>{`
          .ommi-text { font-family: 'Inter', sans-serif; font-weight: 700; letter-spacing: -1px; }
        `}</style>
      </defs>
      
      {/* Text "Ommi" */}
      <text x="5" y="45" fontSize="50" className={`ommi-text ${textColor}`}>
        Ommi
      </text>
      
      {/* Orange Accent Dot under the 'i' */}
      {/* Based on the visual provided, it's a small dot/square at the baseline of the 'i' */}
      <rect x="138" y="38" width="8" height="8" rx="4" fill="#f97316" /> 
    </svg>
  );
};