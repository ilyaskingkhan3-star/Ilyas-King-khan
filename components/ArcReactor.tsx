
import React from 'react';

interface ArcReactorProps {
  isActive: boolean;
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
}

const ArcReactor: React.FC<ArcReactorProps> = ({ isActive, status }) => {
  const getColor = () => {
    switch (status) {
      case 'ERROR': return '#ef4444';
      case 'CONNECTING': return '#eab308';
      case 'CONNECTED': return isActive ? '#22d3ee' : '#0891b2';
      default: return '#1e293b';
    }
  };

  const color = getColor();

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer Atmospheric Glow */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-1000 ${isActive ? 'scale-125 opacity-30' : 'scale-100 opacity-10'}`}
        style={{ 
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          filter: 'blur(30px)' 
        }}
      />
      
      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 overflow-visible">
        <defs>
          <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" />
            <stop offset="40%" stopColor={color} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer Tech Ring - Slow Rotation */}
        <g className="animate-[spin_20s_linear_infinite]">
          <circle 
            cx="100" cy="100" r="95" 
            fill="none" stroke={color} strokeWidth="0.5" 
            strokeDasharray="1, 15" 
            className="opacity-20"
          />
          <circle 
            cx="100" cy="100" r="90" 
            fill="none" stroke={color} strokeWidth="1" 
            strokeDasharray="40 10 20 10" 
            className="opacity-40"
          />
        </g>
        
        {/* Secondary Tech Ring - Counter Rotation */}
        <g className="animate-[spin_15s_linear_infinite_reverse]">
          <circle 
            cx="100" cy="100" r="82" 
            fill="none" stroke={color} strokeWidth="2" 
            strokeDasharray="5 155" 
            strokeLinecap="round"
            className="opacity-60"
          />
          <circle 
            cx="100" cy="100" r="78" 
            fill="none" stroke={color} strokeWidth="0.5" 
            strokeDasharray="2 2" 
            className="opacity-20"
          />
        </g>

        {/* Inner Mechanics - Active State Focus */}
        <g className={isActive ? 'animate-[spin_4s_linear_infinite]' : 'opacity-40'}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <g key={angle} transform={`rotate(${angle} 100 100)`}>
              <rect
                x="98" y="30" width="4" height="15"
                fill={color}
                rx="1"
                className="opacity-80"
              />
              <circle cx="100" cy="52" r="1.5" fill={color} />
            </g>
          ))}
        </g>

        {/* Data Scan Rings */}
        <circle 
          cx="100" cy="100" r="60" 
          fill="none" stroke={color} strokeWidth="1" 
          strokeDasharray="100 277" 
          className={`transition-opacity duration-500 ${isActive ? 'animate-[spin_2s_linear_infinite] opacity-60' : 'opacity-0'}`}
        />

        {/* Core Structure */}
        <circle cx="100" cy="100" r="28" fill="none" stroke={color} strokeWidth="1" className="opacity-20" />
        <circle cx="100" cy="100" r="22" fill="none" stroke={color} strokeWidth="4" strokeDasharray="10 5" className="opacity-30" />
        
        {/* Pulsing Central Core */}
        <circle 
          cx="100" cy="100" r={isActive ? "18" : "15"} 
          fill="url(#coreGradient)" 
          className={`transition-all duration-500 ${isActive ? 'animate-pulse' : 'opacity-60'}`}
          filter="url(#glow)"
        />
        
        {/* Center Point */}
        <circle cx="100" cy="100" r="4" fill="white" className={isActive ? 'shadow-white shadow-2xl' : 'opacity-40'} />
      </svg>
    </div>
  );
};

export default ArcReactor;
