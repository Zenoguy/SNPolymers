import React from 'react';

const BackgroundShapes = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Large Ambient Blurs (Depth Glows) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-indigo-500/10 blur-[150px] animate-pulse pointer-events-none" style={{ animationDuration: '12s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-amber-500/5 blur-[130px] animate-pulse pointer-events-none" style={{ animationDuration: '18s' }}></div>
      <div className="absolute top-[30%] right-[20%] w-[35rem] h-[35rem] rounded-full bg-indigo-600/5 blur-[140px] animate-pulse pointer-events-none" style={{ animationDuration: '15s' }}></div>

      {/* 2. Tech Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ 
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', 
        backgroundSize: '32px 32px' 
      }}></div>

      {/* 3. SVG Shape Silhouettes */}
      <svg className="absolute inset-0 w-full h-full text-white pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {/* Top Right Corner Concentric Rings and Polymer Hexagon */}
        <g className="opacity-[0.14] origin-[80%_20%] animate-[spin_100s_linear_infinite]" style={{ transformOrigin: '80% 20%' }}>
          <circle cx="80%" cy="20%" r="180" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="80%" cy="20%" r="240" fill="none" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="80%" cy="20%" r="320" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12 6" />
          
          {/* Hexagonal structural silhouette */}
          <polygon 
            points="
              80%,10% 
              88.66%,15% 
              88.66%,25% 
              80%,30% 
              71.34%,25% 
              71.34%,15%
            " 
            fill="rgba(99, 102, 241, 0.05)" 
            stroke="currentColor" 
            strokeWidth="1.5" 
          />
          <line x1="80%" y1="20%" x2="80%" y2="10%" stroke="currentColor" strokeWidth="1" />
          <line x1="80%" y1="20%" x2="88.66%" y2="15%" stroke="currentColor" strokeWidth="1" />
          <line x1="80%" y1="20%" x2="88.66%" y2="25%" stroke="currentColor" strokeWidth="1" />
          <line x1="80%" y1="20%" x2="80%" y2="30%" stroke="currentColor" strokeWidth="1" />
          <line x1="80%" y1="20%" x2="71.34%" y2="25%" stroke="currentColor" strokeWidth="1" />
          <line x1="80%" y1="20%" x2="71.34%" y2="15%" stroke="currentColor" strokeWidth="1" />
        </g>
 
        {/* Bottom Left Corner Molecular Network Silhouette */}
        <g className="opacity-[0.12] origin-[20%_80%] animate-[spin_180s_linear_infinite_reverse]" style={{ transformOrigin: '20% 80%' }}>
          <circle cx="20%" cy="80%" r="120" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="20%" cy="80%" r="280" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="8 8" />
          
          {/* Molecular bonds wireframes */}
          <g transform="translate(-100, -100)">
            <circle cx="20%" cy="80%" r="8" fill="currentColor" />
            <circle cx="25%" cy="72%" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="20%" y1="80%" x2="25%" y2="72%" stroke="currentColor" strokeWidth="1.5" />
 
            <circle cx="13%" cy="78%" r="5" fill="currentColor" />
            <line x1="20%" y1="80%" x2="13%" y2="78%" stroke="currentColor" strokeWidth="1.5" />
 
            <circle cx="23%" cy="92%" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="20%" y1="80%" x2="20%" y2="92%" stroke="currentColor" strokeWidth="1.5" />
          </g>
        </g>
 
        {/* Engineering Crosshairs / Cad Grid Markings */}
        <g className="opacity-[0.15] text-amber-500">
          {/* Left vertical timeline line */}
          <line x1="8%" y1="0%" x2="8%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 9" />
          {/* Top horizontal alignment line */}
          <line x1="0%" y1="12%" x2="100%" y2="12%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 12" />
 
          {/* Corner crosshairs */}
          <path d="M 50,50 L 50,30 M 50,50 L 30,50 M 50,50 L 50,70 M 50,50 L 70,50" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </g>
 
        {/* Concentric Amber Orb / Scope Center-Right */}
        <g className="opacity-[0.12] text-amber-500 origin-[85%_75%] animate-[spin_150s_linear_infinite]" style={{ transformOrigin: '85% 75%' }}>
          <circle cx="85%" cy="75%" r="300" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M 85%,45% A 300,300 0 0,1 95%,75%" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M 75%,75% A 300,300 0 0,1 85%,105%" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="85%" cy="75%" r="6" fill="currentColor" />
        </g>
      </svg>

      {/* Decorative Solid Gradient Silhouette shapes blurred behind glass */}
      <div className="absolute top-[35%] left-[15%] w-[12rem] h-[12rem] bg-indigo-500/10 rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] pointer-events-none opacity-30 blur-[40px] animate-[pulse_8s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[25%] right-[25%] w-[15rem] h-[15rem] bg-amber-500/5 rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] pointer-events-none opacity-20 blur-[50px] animate-[pulse_10s_ease-in-out_infinite]"></div>
    </div>
  );
};

export default BackgroundShapes;
