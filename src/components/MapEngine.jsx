import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { pathsData } from '../utils/pathsData';
import { useGameStore } from '../store/gameStore';
import MapNode from './MapNode';
import StudentAvatar from './StudentAvatar';

export default function MapEngine() {
  const mapRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const { seasons, activeSeasonId } = useGameStore();
  const season = seasons[activeSeasonId];
  
  const generatePathD = (nodes) => {
    if (!nodes || nodes.length === 0) return '';
    return nodes.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ');
  };

  const path1D = generatePathD(pathsData.path1);
  const path2D = generatePathD(pathsData.path2);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden">
      <motion.div 
        ref={mapRef}
        drag
        dragConstraints={{ left: -600, right: 600, top: -400, bottom: 400 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
        className="w-[1400px] h-[900px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        
        {/* SVG Paths Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-xl" viewBox="0 0 1400 900">
          {/* Path 1 (Right) */}
          <path d={path1D} fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray="8,8" opacity="0.6" />
          
          {/* Path 2 (Left) */}
          <path d={path2D} fill="none" stroke="var(--blue)" strokeWidth="4" strokeDasharray="8,8" opacity="0.6" />
        </svg>

        {/* Nodes Layer */}
        {pathsData.path1.map((node, i) => (
          <MapNode 
            key={'p1_'+i} 
            node={node} 
            index={i + 1} 
            isDest={node.id === 'dest'}
            color="var(--bg-tertiary)" 
            borderColor="var(--primary)"
          />
        ))}
        {pathsData.path2.map((node, i) => {
          if (node.id === 'dest') return null; // Avoid rendering Jerusalem twice
          return (
            <MapNode 
              key={'p2_'+i} 
              node={node} 
              index={i + 1} 
              isDest={false}
              color="var(--bg-tertiary)" 
              borderColor="var(--blue)"
            />
          );
        })}

        {/* Students Layer */}
        {season?.students?.map((student) => (
          <StudentAvatar key={student.id} student={student} isDraggingMap={isDragging} />
        ))}

      </motion.div>
    </div>
  );
}
