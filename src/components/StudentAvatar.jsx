import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { pathsData } from '../utils/pathsData';
import { useGameStore } from '../store/gameStore';

// Helper to interpolate position based on progress
const calculatePosition = (pathId, progress) => {
  const nodes = pathsData[pathId];
  if (!nodes || nodes.length === 0) return { x: 0, y: 0 };
  
  if (progress <= nodes[0].progress) return { x: nodes[0].x, y: nodes[0].y };
  if (progress >= nodes[nodes.length - 1].progress) {
    const lastNode = nodes[nodes.length - 1];
    return { x: lastNode.x, y: lastNode.y };
  }

  // Find the segment we are in
  let startNode = nodes[0];
  let endNode = nodes[1];
  for (let i = 0; i < nodes.length - 1; i++) {
    if (progress >= nodes[i].progress && progress <= nodes[i + 1].progress) {
      startNode = nodes[i];
      endNode = nodes[i + 1];
      break;
    }
  }

  // Linear interpolation
  const segmentProgress = endNode.progress - startNode.progress;
  const currentSegmentProgress = progress - startNode.progress;
  const ratio = segmentProgress === 0 ? 0 : currentSegmentProgress / segmentProgress;

  const x = startNode.x + (endNode.x - startNode.x) * ratio;
  const y = startNode.y + (endNode.y - startNode.y) * ratio;

  return { x, y };
};

export default function StudentAvatar({ student, isDraggingMap }) {
  const { seasons, activeSeasonId } = useGameStore();
  const season = seasons[activeSeasonId];
  const [isHovered, setIsHovered] = useState(false);

  // Calculate base position
  const { x: baseX, y: baseY } = useMemo(() => {
    return calculatePosition(student.pathId, student.progress);
  }, [student.pathId, student.progress]);

  // Cluster Layout Logic
  // We look at all students in the same path with the exact same progress to offset them
  const { x, y } = useMemo(() => {
    if (!season?.students) return { x: baseX, y: baseY };
    
    // Find peers at the exact same location
    const peers = season.students.filter(
      s => s.pathId === student.pathId && s.progress === student.progress
    );

    if (peers.length <= 1) return { x: baseX, y: baseY };

    // Find my index among peers
    const myIndex = peers.findIndex(s => s.id === student.id);
    
    // Distribute in a circle around the base point
    const radius = 25; // How far they spread
    const angle = (myIndex / peers.length) * 2 * Math.PI;
    
    return {
      x: baseX + Math.cos(angle) * radius,
      y: baseY + Math.sin(angle) * radius
    };
  }, [baseX, baseY, season?.students, student.id, student.pathId, student.progress]);

  return (
    <motion.div
      // animate position smoothly when it changes
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 60, damping: 15 }}
      className="absolute top-0 left-0 -ml-4 -mt-4 z-30" // center the 8x8 w/h
      onMouseEnter={() => !isDraggingMap && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Avatar Circle */}
        <div 
          className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center cursor-pointer relative z-10"
          style={{ 
            backgroundColor: 'var(--bg-tertiary)', 
            border: student.hasJerusalemBadge ? '2px solid var(--gold)' : '2px solid var(--border-color)',
            boxShadow: student.hasJerusalemBadge ? '0 0 15px rgba(217, 119, 6, 0.8)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
          }}
        >
          {student.avatar ? (
            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>{student.name.substring(0, 2)}</span>
          )}
        </div>

        {/* Name Label */}
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded text-[10px] whitespace-nowrap pointer-events-none opacity-80 shadow-md"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {student.name.split(' ')[0]}
        </div>

        {/* Tooltip on Hover */}
        {isHovered && (
          <div 
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg p-3 shadow-2xl z-50 pointer-events-none"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <div className="text-center mb-2 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <p className="font-bold font-['Reem_Kufi'] text-lg" style={{ color: 'var(--text-primary)' }}>{student.name}</p>
              {student.hasJerusalemBadge && <p className="text-xs mt-1 font-bold shadow-sm" style={{ color: 'var(--gold)' }}>🏅 فاتح القدس</p>}
            </div>
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-primary)' }}>
              <span className="opacity-70">النقاط:</span>
              <span className="font-bold" style={{ color: 'var(--gold)' }}>{student.points}</span>
            </div>
            <div className="flex justify-between text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
              <span className="opacity-70">التقدم:</span>
              <span style={{ color: 'var(--gold)' }}>{student.progress.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
              <span className="opacity-70">الترتيب:</span>
              <span>
                {student.currentRank} 
                {student.currentRank < student.previousRank && <span className="text-green-400 text-xs ml-1">⬆ +{student.previousRank - student.currentRank}</span>}
                {student.currentRank > student.previousRank && <span className="text-red-400 text-xs ml-1">⬇ -{student.currentRank - student.previousRank}</span>}
                {student.currentRank === student.previousRank && <span className="text-gray-400 text-xs ml-1">-</span>}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
