import React from 'react';
import { useTheme } from './ThemeContext';

const BackgroundShapes = () => {
  const { theme, darkBg, lightBg } = useTheme();

  // Check if current active background is the rotating SVG overlay preset
  const isRotatingSvgActive = theme === 'dark' 
    ? darkBg === 'rotating-svg-dark' 
    : lightBg === 'rotating-svg-light';

  const isSunlightActive = theme === 'light' && lightBg === 'warm-sunlight';
  const isIndigoAuroraActive = theme === 'light' && lightBg === 'radial-soft';

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 0A. Vibrant Oceanic Fluid Waves (Default Light Mode) */}
      {isIndigoAuroraActive && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-90 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Oceanic Sky Blue to Cyan Gradient */}
              <linearGradient id="waveGradOceanSky" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(14, 165, 233, 0.42)" />
                <stop offset="50%" stopColor="rgba(56, 189, 248, 0.24)" />
                <stop offset="100%" stopColor="rgba(186, 230, 253, 0.05)" />
              </linearGradient>

              {/* Deep Sea Azure Gradient */}
              <linearGradient id="waveGradDeepAzure" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(2, 132, 199, 0.38)" />
                <stop offset="60%" stopColor="rgba(14, 165, 233, 0.20)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </linearGradient>

              {/* Turquoise Aqua Foam Gradient */}
              <linearGradient id="waveGradTurquoise" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(6, 182, 212, 0.32)" />
                <stop offset="70%" stopColor="rgba(45, 212, 191, 0.15)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </linearGradient>
            </defs>

            {/* Layer 1: Deep Azure Ocean Wave */}
            <path
              d="M 0,280 C 320,120 540,420 900,240 C 1180,100 1340,320 1440,200 L 1440,0 L 0,0 Z"
              fill="url(#waveGradDeepAzure)"
            />

            {/* Layer 2: Main Sky Blue Fluid Wave */}
            <path
              d="M 0,480 C 380,320 650,560 1020,380 C 1260,260 1380,440 1440,360 L 1440,0 L 0,0 Z"
              fill="url(#waveGradOceanSky)"
            />

            {/* Layer 3: Turquoise Aqua Accent Wave */}
            <path
              d="M 0,600 C 420,440 700,680 1100,480 C 1300,380 1400,520 1440,460 L 1440,0 L 0,0 Z"
              fill="url(#waveGradTurquoise)"
            />

            {/* Layer 4: Oceanic Wave Crest Contour Ribbons */}
            <path
              d="M 0,180 Q 380,480 760,240 T 1440,420"
              fill="none"
              stroke="rgba(2, 132, 199, 0.55)"
              strokeWidth="3.5"
              strokeDasharray="14 10"
            />
            <path
              d="M 0,320 Q 480,140 960,380 T 1440,200"
              fill="none"
              stroke="rgba(14, 165, 233, 0.50)"
              strokeWidth="2.5"
            />
            <path
              d="M 0,440 C 400,280 700,520 1050,340 C 1280,220 1400,380 1440,300"
              fill="none"
              stroke="rgba(6, 182, 212, 0.50)"
              strokeWidth="3"
            />
          </svg>
        </div>
      )}
      {/* 0. Expanding Crisp White Glistening Sunlight Beams (Originating from Top-Right Diagonal) */}
      {isSunlightActive && (
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-85 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMaxYMin slice">
            <defs>
              {/* Crisp White Ray Gradient */}
              <linearGradient id="whiteSunRayGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.75)" />
                <stop offset="35%" stopColor="rgba(255, 255, 255, 0.35)" />
                <stop offset="70%" stopColor="rgba(251, 191, 36, 0.12)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </linearGradient>

              {/* Luminous Pure White Sun Core Glow */}
              <radialGradient id="pureWhiteSunSource" cx="100%" cy="0%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
                <stop offset="25%" stopColor="rgba(254, 240, 138, 0.60)" />
                <stop offset="60%" stopColor="rgba(251, 191, 36, 0.20)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </radialGradient>
            </defs>

            {/* Intense White Glistening Sun Source at Top-Right */}
            <circle cx="980" cy="-20" r="280" fill="url(#pureWhiteSunSource)" />

            {/* Crisp Diagonal Glistening White Sunlight Rays */}
            <g fill="url(#whiteSunRayGrad)" className="animate-[pulse_5s_ease-in-out_infinite]" style={{ filter: 'blur(4px)' }}>
              {/* Broad luminous white ambient diagonal shaft */}
              <polygon points="980,-20 -150,550 -150,900" opacity="0.45" />

              {/* Distinct Glistening Pure White Ray Shafts */}
              <polygon points="980,-20 -80,300 -20,360" />
              <polygon points="980,-20 80,580 180,660" />
              <polygon points="980,-20 320,780 430,880" />
              <polygon points="980,-20 520,950 620,1000" />
              <polygon points="980,-20 740,1000 820,1000" />
            </g>
          </svg>
        </div>
      )}

      {/* 1. Large Ambient Blurs (Depth Glows) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-indigo-500/10 blur-[150px] animate-pulse pointer-events-none" style={{ animationDuration: '12s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-amber-500/5 blur-[130px] animate-pulse pointer-events-none" style={{ animationDuration: '18s' }}></div>
      <div className="absolute top-[30%] right-[20%] w-[35rem] h-[35rem] rounded-full bg-indigo-600/5 blur-[140px] animate-pulse pointer-events-none" style={{ animationDuration: '15s' }}></div>

      {/* 2. Tech Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)', 
        backgroundSize: '32px 32px' 
      }}></div>

      {/* 3. Rotating SVG Vector Shapes — Render ONLY when selected in User Profile */}
      {isRotatingSvgActive && (
        <svg 
          className={`absolute inset-0 w-full h-full pointer-events-none ${
            theme === 'light' ? 'text-indigo-950/20' : 'text-white/20'
          }`} 
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Concentric Rings and Polymer Hexagon (Rightside 80% X, 35% Y) */}
          <g className="opacity-75 animate-[spin_100s_linear_infinite]" style={{ transformOrigin: '800px 350px' }}>
            <circle cx="800" cy="350" r="90" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="800" cy="350" r="130" fill="none" stroke="currentColor" strokeWidth="0.75" />
            <circle cx="800" cy="350" r="170" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 4" />

            {/* Hexagonal structural silhouette */}
            <polygon
              points="800,300 843,325 843,375 800,400 757,375 757,325"
              fill="rgba(99, 102, 241, 0.05)"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <line x1="800" y1="350" x2="800" y2="300" stroke="currentColor" strokeWidth="0.75" />
            <line x1="800" y1="350" x2="843" y2="325" stroke="currentColor" strokeWidth="0.75" />
            <line x1="800" y1="350" x2="843" y2="375" stroke="currentColor" strokeWidth="0.75" />
            <line x1="800" y1="350" x2="800" y2="400" stroke="currentColor" strokeWidth="0.75" />
            <line x1="800" y1="350" x2="757" y2="375" stroke="currentColor" strokeWidth="0.75" />
            <line x1="800" y1="350" x2="757" y2="325" stroke="currentColor" strokeWidth="0.75" />
          </g>
        </svg>
      )}

      {/* Decorative Solid Gradient Silhouette shapes blurred behind glass */}
      <div className="absolute top-[35%] left-[15%] w-[12rem] h-[12rem] bg-indigo-500/10 rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] pointer-events-none opacity-30 blur-[40px] animate-[pulse_8s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[25%] right-[25%] w-[15rem] h-[15rem] bg-amber-500/5 rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] pointer-events-none opacity-20 blur-[50px] animate-[pulse_10s_ease-in-out_infinite]"></div>
    </div>
  );
};

export default BackgroundShapes;
