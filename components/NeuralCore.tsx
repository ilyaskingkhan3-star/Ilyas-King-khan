
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot } from 'lucide-react';

interface NeuralCoreProps {
  isActive: boolean;
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
  accentColor?: string;
  volume?: number; // 0 to 1
}

const NeuralBackground: React.FC<{ color: string; isActive: boolean }> = ({ color, isActive }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-black">
      {/* Deep Atmospheric Glows */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[100px]"
          style={{ backgroundColor: color }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-[100px]"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Particle 'U' Shape (from screenshot) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <svg viewBox="0 0 400 400" className="w-full h-full max-w-4xl">
          <defs>
            <filter id="particleGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <g filter="url(#particleGlow)">
            {[...Array(200)].map((_, i) => {
              // Generate points along a U-shape
              const t = i / 199; // 0 to 1
              let x, y;
              if (t < 0.4) {
                // Left vertical
                x = 120;
                y = 100 + (t / 0.4) * 150;
              } else if (t > 0.6) {
                // Right vertical
                x = 280;
                y = 250 - ((t - 0.6) / 0.4) * 150;
              } else {
                // Bottom curve
                const angle = Math.PI + ((t - 0.4) / 0.2) * Math.PI;
                x = 200 + Math.cos(angle) * 80;
                y = 250 + Math.sin(angle) * 40;
              }

              // Add some noise
              x += (Math.random() - 0.5) * 15;
              y += (Math.random() - 0.5) * 15;

              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={Math.random() * 1.5 + 0.5}
                  fill={color}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isActive ? [0.2, 0.8, 0.2] : 0.1,
                    scale: isActive ? [1, 1.5, 1] : 1
                  }}
                  transition={{ 
                    duration: Math.random() * 3 + 2, 
                    repeat: Infinity,
                    delay: Math.random() * 5
                  }}
                />
              );
            })}
          </g>
        </svg>
      </div>
      
      {/* Moving Grid - Subtle */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(${color}20 1px, transparent 1px), linear-gradient(90deg, ${color}20 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(circle at center, black, transparent 90%)'
        }}
      />

      {/* Neural Noise Overlay */}
      {isActive && (
        <motion.div 
          animate={{ opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 0.1, repeat: Infinity }}
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            filter: 'contrast(150%) brightness(1000%) invert(100%)'
          }}
        />
      )}
    </div>
  );
};

const NeuralCore: React.FC<NeuralCoreProps> = ({ isActive, status, accentColor = '#00f2ff', volume = 0 }) => {
  const getColor = () => {
    switch (status) {
      case 'ERROR': return '#ef4444';
      case 'CONNECTING': return '#eab308';
      case 'CONNECTED': return isActive ? accentColor : `${accentColor}80`;
      default: return '#1e293b';
    }
  };

  const color = getColor();
  const reactiveScale = 1 + (volume * 0.5);

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      <NeuralBackground color={color} isActive={isActive} />
      
      {/* Deep Atmospheric Glow */}
      <motion.div 
        animate={{
          scale: isActive ? [1 * reactiveScale, 1.2 * reactiveScale, 1 * reactiveScale] : 1,
          opacity: isActive ? [0.3, 0.6, 0.3] : 0.1,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full"
        style={{ 
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          filter: 'blur(60px)' 
        }}
      />
      
      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 overflow-visible">
        <defs>
          <radialGradient id="neuralGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" />
            <stop offset="40%" stopColor={color} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <filter id="neuralGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer Rotating Rings */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <circle 
            cx="100" cy="100" r="90" 
            fill="none" 
            stroke={color} 
            strokeWidth="0.5" 
            strokeDasharray="1 10"
            className="opacity-20"
          />
        </motion.g>

        <motion.g
          animate={{ 
            rotate: -360,
            scale: 1 + (volume * 0.1)
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <circle 
            cx="100" cy="100" r="85" 
            fill="none" 
            stroke={color} 
            strokeWidth="1" 
            strokeDasharray="20 40"
            className="opacity-10"
          />
        </motion.g>

        {/* Neural Web Filaments */}
        <g className={`transition-opacity duration-1000 ${isActive ? 'opacity-40' : 'opacity-10'}`}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <g key={angle} transform={`rotate(${angle} 100 100)`}>
              <motion.path 
                d="M100 100 C120 60, 160 80, 180 40" 
                fill="none" 
                stroke={color} 
                strokeWidth="0.5"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: isActive ? 1 : 0.2,
                  strokeWidth: 0.5 + (volume * 2)
                }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
              <motion.circle 
                cx="180" cy="40" r="1.5" 
                fill={color}
                animate={{ 
                  scale: isActive ? [1 + volume, 1.5 + volume, 1 + volume] : 1,
                  opacity: 0.5 + (volume * 0.5)
                }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              />
            </g>
          ))}
        </g>

        {/* Inner Rotating HUD Elements */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className={isActive ? 'opacity-60' : 'opacity-20'}
        >
          <path d="M100 40 L100 30 M100 170 L100 160 M40 100 L30 100 M170 100 L160 100" stroke={color} strokeWidth="2" />
        </motion.g>

        {/* Central Core */}
        <motion.g 
          animate={{
            scale: isActive ? [1 * reactiveScale, 1.1 * reactiveScale, 1 * reactiveScale] : 1,
            filter: volume > 0.7 ? 'url(#neuralGlow) drop-shadow(0 0 10px white)' : 'url(#neuralGlow)'
          }}
          className={volume > 0.8 ? 'animate-glitch' : ''}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Inner Glow */}
          <circle 
            cx="100" cy="100" r="30" 
            fill="url(#neuralGradient)" 
            filter="url(#neuralGlow)"
            className={isActive ? 'opacity-100' : 'opacity-40'}
          />
          
          {/* Core Detail */}
          <motion.path 
            d="M85 100 Q92 85 100 85 Q108 85 115 100 Q108 115 100 115 Q92 115 85 100" 
            fill="none" 
            stroke="white" 
            strokeWidth="0.5" 
            animate={{ 
              opacity: isActive ? [0.2 + volume, 0.6 + volume, 0.2 + volume] : 0.2,
              scale: 1 + volume
            }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
          
          {/* Avatar Icon */}
          <foreignObject x="85" y="85" width="30" height="30">
            <div className="w-full h-full flex items-center justify-center">
              <Bot 
                className={`w-5 h-5 transition-all duration-500 ${isActive ? 'text-white' : 'text-white/20'}`} 
                style={{ filter: isActive ? `drop-shadow(0 0 5px ${color})` : 'none' }}
              />
            </div>
          </foreignObject>
        </motion.g>

        {/* Synaptic Data Pulses */}
        <AnimatePresence>
          {isActive && (
            <g>
              {[0, 90, 180, 270].map((angle, i) => (
                <g key={`pulse-${angle}`} transform={`rotate(${angle} 100 100)`}>
                  <circle r={2 + (volume * 3)} fill="white" filter="url(#neuralGlow)">
                    <animateMotion 
                      dur={`${(2 + i * 0.5) / (1 + volume)}s`} 
                      repeatCount="indefinite" 
                      path="M100 100 C120 60, 160 80, 180 40" 
                    />
                  </circle>
                </g>
              ))}
            </g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
};

export default NeuralCore;


