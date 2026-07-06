/**
 * ReadOnlyMapCanvas.jsx
 *
 * A full read-only version of the interactive map for use in StudentPortal.
 * Identical visuals to MapCanvas (same background, paths, nodes, decorations,
 * all student avatars) but:
 *   - No editing / point assignment
 *   - The logged-in student is highlighted with a golden pulsing halo
 *   - Missing points info shown in a fixed overlay
 *   - Draggable + zoomable like the real map
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { pathsData, MAP_VIEWBOX } from '../../utils/pathsData';
import { buildSmoothSVGPath } from '../../utils/positionCalculator';
import { useGameStore } from '../../store/gameStore';
import MapNode from './MapNode';
import JerusalemMarker from './JerusalemMarker';
import StudentAvatar, { StudentTooltip } from '../student/StudentAvatar';

const { width: VW, height: VH } = MAP_VIEWBOX;

// ─── Reuse the same defs from MapCanvas ─────────────────────────
function MapDefs() {
  return (
    <defs>
      <radialGradient id="ro-parchment-grad" cx="50%" cy="45%" r="65%">
        <stop offset="0%"   stopColor="var(--parchment-stop0)" />
        <stop offset="45%"  stopColor="var(--parchment-stop45)" />
        <stop offset="100%" stopColor="var(--parchment-stop100)" />
      </radialGradient>
      <linearGradient id="ro-terrain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#1a2a1a" stopOpacity="0.4" />
        <stop offset="30%"  stopColor="#2a1a08" stopOpacity="0.3" />
        <stop offset="70%"  stopColor="#1e1508" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#0f0a04" stopOpacity="0.35" />
      </linearGradient>
      <radialGradient id="ro-sea-grad" cx="30%" cy="50%" r="70%">
        <stop offset="0%"   stopColor="var(--sea-stop0)"   stopOpacity="0.9" />
        <stop offset="100%" stopColor="var(--sea-stop100)" stopOpacity="0.95" />
      </radialGradient>
      <linearGradient id="ro-path1-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#52d68a" />
        <stop offset="50%"  stopColor="#2d9a5f" />
        <stop offset="100%" stopColor="#52d68a" />
      </linearGradient>
      <linearGradient id="ro-path2-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#60b4f5" />
        <stop offset="50%"  stopColor="#2a7fc4" />
        <stop offset="100%" stopColor="#60b4f5" />
      </linearGradient>
      <radialGradient id="ro-jerusalem-radiance" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#d4af37" stopOpacity="0.7" />
        <stop offset="40%"  stopColor="#d4af37" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ro-vignette" cx="50%" cy="50%" r="70%">
        <stop offset="60%"  stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
      </radialGradient>
      <filter id="ro-node-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="ro-gold-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feColorMatrix in="blur" type="matrix"
          values="1 0.7 0 0 0  0.5 0.35 0 0 0  0 0 0 0 0  0 0 0 0.8 0" result="goldBlur" />
        <feMerge><feMergeNode in="goldBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="drop-shadow">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.8)" />
      </filter>
      {/* Gradient IDs used by StudentTooltip */}
      <linearGradient id="path1-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#52d68a" /><stop offset="50%" stopColor="#2d9a5f" />
        <stop offset="100%" stopColor="#52d68a" />
      </linearGradient>
      <linearGradient id="path2-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60b4f5" /><stop offset="50%" stopColor="#2a7fc4" />
        <stop offset="100%" stopColor="#60b4f5" />
      </linearGradient>
    </defs>
  );
}

// ─── Same decorations as MapCanvas ──────────────────────────────
function MapDecorations() {
  return (
    <g opacity="0.7">
      {/* Mediterranean Sea */}
      <ellipse cx="50" cy="400" rx="110" ry="280"
        fill="url(#ro-sea-grad)" opacity="0.8" />
      <text x="55" y="320" fontSize="11" fontFamily="Reem Kufi, serif"
        fill="rgba(255,255,255,0.5)" textAnchor="middle">البحر الأبيض المتوسط</text>
      {/* Persian Gulf hint */}
      <ellipse cx="1340" cy="200" rx="55" ry="150"
        fill="url(#ro-sea-grad)" opacity="0.5" />
      <text x="1335" y="150" fontSize="10" fontFamily="Reem Kufi, serif"
        fill="rgba(255,255,255,0.4)" textAnchor="middle">الخليج العربي</text>
      {/* Mountains */}
      {[
        [860,310],[900,290],[880,275],[920,265],[940,280],
        [490,290],[520,275],[510,260],[540,250],[560,265],
        [350,450],[380,430],[370,415],
      ].map(([mx,my],i) => (
        <polygon key={i}
          points={`${mx-16},${my+20} ${mx},${my-8} ${mx+16},${my+20}`}
          fill="var(--mtn-fill)" stroke="var(--mtn-stroke)" strokeWidth="0.8"
          opacity="0.75" />
      ))}
      {/* Desert stippling */}
      {Array.from({length: 40}, (_,i) => (
        <circle key={`d${i}`}
          cx={600 + (i % 8) * 60 + Math.sin(i) * 20}
          cy={200 + Math.floor(i / 8) * 55 + Math.cos(i) * 15}
          r="2" fill="rgba(160,120,60,0.2)" />
      ))}
      {/* Compass */}
      <g transform="translate(80, 830)">
        <circle r="30" fill="rgba(10,8,3,0.7)" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
        <text textAnchor="middle" y="-16" fontSize="10" fill="#d4af37" fontFamily="serif">N</text>
        <text textAnchor="middle" y="22"  fontSize="10" fill="#8a7050" fontFamily="serif">S</text>
        <text textAnchor="middle" x="20"  y="4"  fontSize="10" fill="#8a7050" fontFamily="serif">E</text>
        <text textAnchor="middle" x="-20" y="4"  fontSize="10" fill="#8a7050" fontFamily="serif">W</text>
        <polygon points="0,-20 -4,0 0,-6 4,0" fill="#d4af37" />
        <polygon points="0,20 -4,0 0,6 4,0"  fill="#8a7050" />
      </g>
    </g>
  );
}

// ─── Paths (same bezier curves) ─────────────────────────────────
function MapPaths() {
  const p1 = pathsData.path1;
  const p2 = pathsData.path2;
  const smoothPath1 = buildSmoothSVGPath(p1.map(n => ({ x: n.x, y: n.y })));
  const smoothPath2 = buildSmoothSVGPath(p2.filter(n => n.id !== 'dest').map(n => ({ x: n.x, y: n.y })));

  return (
    <g>
      {/* Path 1 shadow */}
      <path d={smoothPath1} fill="none" stroke="rgba(0,80,0,0.3)" strokeWidth="7" strokeLinecap="round" />
      {/* Path 1 main */}
      <path d={smoothPath1} fill="none" stroke="url(#ro-path1-grad)" strokeWidth="3.5"
        strokeLinecap="round" strokeDasharray="1,0" opacity="0.85" />
      {/* Path 2 shadow */}
      <path d={smoothPath2} fill="none" stroke="rgba(0,40,100,0.3)" strokeWidth="7" strokeLinecap="round" />
      {/* Path 2 main */}
      <path d={smoothPath2} fill="none" stroke="url(#ro-path2-grad)" strokeWidth="3.5"
        strokeLinecap="round" opacity="0.85" />
      {/* Convergence lines to Jerusalem */}
      <path
        d={`M ${p1[p1.length - 2].x} ${p1[p1.length - 2].y} L 700 820`}
        fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="2" strokeDasharray="4,4" />
      <path
        d={`M ${p2[p2.length - 2].x} ${p2[p2.length - 2].y} L 700 820`}
        fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="2" strokeDasharray="4,4" />
    </g>
  );
}

// ─── Main component ──────────────────────────────────────────────
export default function ReadOnlyMapCanvas({ highlightStudentId }) {
  const containerRef = useRef(null);
  const panWrapperRef = useRef(null);
  const transformRef  = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingRef = useRef(false);
  const dragStart     = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const [hoveredNodeId, setHoveredNodeId]   = useState(null);
  const [hoveredStudent, setHoveredStudent] = useState(null);

  const { seasons, activeSeasonId, settings } = useGameStore();
  const season    = seasons[activeSeasonId];
  const students  = season?.students || [];
  const nodePoints = settings.nodePoints || {};

  const path1Nodes = pathsData.path1;
  const path2Nodes = pathsData.path2.filter(n => n.id !== 'dest');

  const applyTransform = useCallback((smooth = false) => {
    if (panWrapperRef.current) {
      panWrapperRef.current.style.transition = smooth ? 'transform 0.1s ease-out' : 'none';
      panWrapperRef.current.style.transform  =
        `translate(${transformRef.current.x}px, ${transformRef.current.y}px) scale(${transformRef.current.scale})`;
    }
  }, []);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      transformRef.current.scale = Math.min(Math.max(transformRef.current.scale * delta, 0.4), 4);
      applyTransform(true);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyTransform]);

  // Drag
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStart.current = { clientX: e.clientX, clientY: e.clientY,
      startX: transformRef.current.x, startY: transformRef.current.y };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !dragStart.current) return;
    transformRef.current.x = dragStart.current.startX + (e.clientX - dragStart.current.clientX);
    transformRef.current.y = dragStart.current.startY + (e.clientY - dragStart.current.clientY);
    applyTransform(false);
  }, [applyTransform]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Touch drag
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStart.current = { clientX: t.clientX, clientY: t.clientY,
      startX: transformRef.current.x, startY: transformRef.current.y };
  }, []);
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length !== 1 || !isDraggingRef.current) return;
    e.preventDefault();
    const t = e.touches[0];
    transformRef.current.x = dragStart.current.startX + (t.clientX - dragStart.current.clientX);
    transformRef.current.y = dragStart.current.startY + (t.clientY - dragStart.current.clientY);
    applyTransform(false);
  }, [applyTransform]);
  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  const handleNodeHover   = useCallback((id) => setHoveredNodeId(id), []);
  const handleStudentHover = useCallback((id, svgX, svgY) => {
    setHoveredStudent(id ? { id, x: svgX, y: svgY } : null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="map-canvas-wrapper select-none"
      style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Read-only badge */}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 20,
        background: 'rgba(10,8,3,0.85)', border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: '20px', padding: '4px 12px',
        color: '#d4af37', fontSize: '11px', fontFamily: 'Cairo, sans-serif',
        pointerEvents: 'none', backdropFilter: 'blur(6px)',
      }}>
        👁 وضع القراءة
      </div>

      {/* Pan wrapper */}
      <div ref={panWrapperRef} style={{
        transform: 'translate(0px, 0px) scale(1)',
        transformOrigin: 'center center',
        width: '100%', height: '100%',
      }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', display: 'block' }}>
          <MapDefs />

          {/* Background image */}
          <image href="/map-bg.png" x="0" y="0" width={VW} height={VH}
            preserveAspectRatio="xMidYMid slice" opacity="0.55" />

          {/* Parchment overlay */}
          <rect x="0" y="0" width={VW} height={VH} fill="url(#ro-parchment-grad)" opacity="0.65" />
          <rect x="0" y="0" width={VW} height={VH} fill="url(#ro-terrain-grad)" />

          <MapDecorations />

          {/* Jerusalem radiance */}
          <circle cx="700" cy="820" r="220" fill="url(#ro-jerusalem-radiance)" opacity="0.7" />

          <MapPaths />

          {/* Path 1 nodes */}
          {path1Nodes.map((node, idx) => {
            if (node.id === 'dest') return null;
            return (
              <MapNode key={node.id} node={node}
                pathColor="#2d9a5f" pathColorBright="#52d68a"
                index={idx + 1} requiredPoints={nodePoints[node.id]}
                onHoverChange={handleNodeHover} />
            );
          })}

          {/* Path 2 nodes */}
          {path2Nodes.map((node, idx) => (
            <MapNode key={node.id} node={node}
              pathColor="#2a7fc4" pathColorBright="#60b4f5"
              index={idx + 1} requiredPoints={nodePoints[node.id]}
              onHoverChange={handleNodeHover} />
          ))}

          {/* Jerusalem */}
          <JerusalemMarker x={700} y={820} />

          {/* All students */}
          {students.map((student) => (
            <StudentAvatar
              key={student.id}
              student={student}
              allStudents={students}
              isDragging={isDragging}
              onHoverChange={handleStudentHover}
              isHighlighted={student.id === highlightStudentId}
            />
          ))}

          {/* Hovered node tooltip elevation */}
          {hoveredNodeId && (() => {
            const allPathNodes = [...pathsData.path1, ...pathsData.path2.filter(n => n.id !== 'dest')];
            const hovNode = allPathNodes.find(n => n.id === hoveredNodeId);
            if (!hovNode) return null;
            const isPath1 = pathsData.path1.some(n => n.id === hoveredNodeId);
            return (
              <MapNode key={`ro-hov-${hoveredNodeId}`} node={hovNode}
                pathColor={isPath1 ? '#2d9a5f' : '#2a7fc4'}
                pathColorBright={isPath1 ? '#52d68a' : '#60b4f5'}
                index={0} requiredPoints={nodePoints[hovNode.id]}
                forceHover={true} onHoverChange={handleNodeHover} />
            );
          })()}

          {/* Student tooltip — top layer, absolute coords, no jump */}
          {hoveredStudent && (() => {
            const hs = students.find(s => s.id === hoveredStudent.id);
            if (!hs) return null;
            return (
              <StudentTooltip
                key={`ro-tooltip-${hoveredStudent.id}`}
                student={hs}
                svgX={hoveredStudent.x}
                svgY={hoveredStudent.y}
                onMouseEnter={() => {}}
                onMouseLeave={() => setHoveredStudent(null)}
              />
            );
          })()}

          {/* Vignette */}
          <rect x="0" y="0" width={VW} height={VH}
            fill="url(#ro-vignette)" pointerEvents="none" />
        </svg>
      </div>

      {/* Zoom controls */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, display: 'flex',
        flexDirection: 'column', gap: 6, zIndex: 20,
      }}>
        {[
          { label: '+', title: 'تكبير', onClick: () => { transformRef.current.scale = Math.min(transformRef.current.scale * 1.2, 4); applyTransform(true); }},
          { label: '⌂', title: 'إعادة ضبط', onClick: () => { transformRef.current = { x:0, y:0, scale:1 }; applyTransform(true); }},
          { label: '−', title: 'تصغير', onClick: () => { transformRef.current.scale = Math.max(transformRef.current.scale * 0.8, 0.4); applyTransform(true); }},
        ].map(btn => (
          <button key={btn.label} onClick={btn.onClick} title={btn.title}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
              background: 'rgba(18,14,5,0.9)', border: '1px solid rgba(212,175,55,0.4)',
              color: '#d4af37',
            }}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
