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
      <svg className="absolute inset-0 w-full h-full text-white pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top Right Corner Concentric Rings and Polymer Hexagon */}
        <g className="opacity-[0.14] origin-[800px_200px] animate-[spin_100s_linear_infinite]" style={{ transformOrigin: '800px 200px' }}>
          <circle cx="800" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="800" cy="200" r="240" fill="none" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="800" cy="200" r="320" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12 6" />
          
          {/* Hexagonal structural silhouette */}
          <polygon 
            points="
              800,100 
              886.6,150 
              886.6,250 
              800,300 
              713.4,250 
              713.4,150
            " 
            fill="rgba(99, 102, 241, 0.05)" 
            stroke="currentColor" 
            strokeWidth="1.5" 
          />
          <line x1="800" y1="200" x2="800" y2="100" stroke="currentColor" strokeWidth="1" />
          <line x1="800" y1="200" x2="886.6" y2="150" stroke="currentColor" strokeWidth="1" />
          <line x1="800" y1="200" x2="886.6" y2="250" stroke="currentColor" strokeWidth="1" />
          <line x1="800" y1="200" x2="800" y2="300" stroke="currentColor" strokeWidth="1" />
          <line x1="800" y1="200" x2="713.4" y2="250" stroke="currentColor" strokeWidth="1" />
          <line x1="800" y1="200" x2="713.4" y2="150" stroke="currentColor" strokeWidth="1" />
        </g>
 
        {/* Bottom Left Corner Molecular Network Silhouette */}
        <g className="opacity-[0.12] origin-[200px_800px] animate-[spin_180s_linear_infinite_reverse]" style={{ transformOrigin: '200px 800px' }}>
          <circle cx="200" cy="800" r="120" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="200" cy="800" r="280" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="8 8" />
          
          {/* Molecular bonds wireframes */}
          <g transform="translate(-100, -100)">
            <circle cx="200" cy="800" r="8" fill="currentColor" />
            <circle cx="250" cy="720" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="200" y1="800" x2="250" y2="720" stroke="currentColor" strokeWidth="1.5" />
 
            <circle cx="130" cy="780" r="5" fill="currentColor" />
            <line x1="200" y1="800" x2="130" y2="780" stroke="currentColor" strokeWidth="1.5" />
 
            <circle cx="230" cy="920" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="200" y1="800" x2="200" y2="920" stroke="currentColor" strokeWidth="1.5" />
          </g>
        </g>
 
        {/* Engineering Crosshairs / Cad Grid Markings */}
        <g className="opacity-[0.15] text-amber-500">
          {/* Left vertical timeline line */}
          <line x1="80" y1="0" x2="80" y2="1000" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 9" />
          {/* Top horizontal alignment line */}
          <line x1="0" y1="120" x2="1000" y2="120" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 12" />
 
          {/* Corner crosshairs */}
          <path d="M 50,50 L 50,30 M 50,50 L 30,50 M 50,50 L 50,70 M 50,50 L 70,50" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </g>
 
        {/* Concentric Amber Orb / Scope Center-Right */}
        <g className="opacity-[0.12] text-amber-500 origin-[850px_750px] animate-[spin_150s_linear_infinite]" style={{ transformOrigin: '850px 750px' }}>
          <circle cx="850" cy="750" r="300" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M 850,450 A 300,300 0 0,1 950,750" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M 750,750 A 300,300 0 0,1 850,1050" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="850" cy="750" r="6" fill="currentColor" />
        </g>
      </svg>

      {/* Decorative Solid Gradient Silhouette shapes blurred behind glass */}
      <div className="absolute top-[35%] left-[15%] w-[12rem] h-[12rem] bg-indigo-500/10 rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] pointer-events-none opacity-30 blur-[40px] animate-[pulse_8s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[25%] right-[25%] w-[15rem] h-[15rem] bg-amber-500/5 rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] pointer-events-none opacity-20 blur-[50px] animate-[pulse_10s_ease-in-out_infinite]"></div>
    </div>
  );
};

export default BackgroundShapes;
