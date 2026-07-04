import React from 'react';
import { motion } from 'framer-motion';

export default function MapNode({ node, index, isDest, color, borderColor }) {
  if (isDest) {
    return (
      <div 
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-10"
        style={{ left: node.x, top: node.y }}
      >
        <motion.div 
          className="w-40 h-40 relative flex items-center justify-center drop-shadow-[0_0_20px_rgba(233,195,73,0.5)]"
          initial={{ y: 0 }}
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Placeholder for Dome of the Rock SVG/Image */}
          <div className="w-full h-full bg-[url('https://cdn-icons-png.flaticon.com/512/8821/8821590.png')] bg-contain bg-center bg-no-repeat drop-shadow-2xl brightness-110 sepia-[.3] hue-rotate-[-10deg]"></div>
        </motion.div>
        <div className="mt-2 glass-panel px-6 py-2 rounded-lg text-center shadow-[0_0_15px_rgba(233,195,73,0.3)]" style={{ border: '1px solid var(--gold)' }}>
          <h2 className="text-3xl font-bold font-['Reem_Kufi']" style={{ color: 'var(--gold)' }}>{node.name}</h2>
          <p className="text-sm font-['Amiri']" style={{ color: 'var(--text-primary)' }}>{node.subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10"
      style={{ left: node.x, top: node.y }}
    >
      {/* Number Circle */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: color, border: `2px solid ${borderColor}` }}>
        <span className="font-bold text-lg font-serif" style={{ color: 'var(--text-primary)' }}>{index}</span>
      </div>

      {/* Castle Icon & Label */}
      <div className="flex flex-col items-center">
        {/* Placeholder for Castle */}
        <div className="w-12 h-12 bg-[url('https://cdn-icons-png.flaticon.com/512/2855/2855299.png')] bg-contain bg-center bg-no-repeat opacity-90 drop-shadow-md brightness-75 sepia-[.5]"></div>
        
        {/* Text */}
        <div className="mt-1 px-3 py-1 rounded text-center shadow-md backdrop-blur-sm min-w-[80px]" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h3 className="font-bold text-base leading-tight drop-shadow-sm font-['Reem_Kufi']" style={{ color: 'var(--text-primary)' }}>{node.name}</h3>
          <p className="text-[10px] opacity-90 font-['Amiri']" style={{ color: 'var(--text-secondary)' }}>{node.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
