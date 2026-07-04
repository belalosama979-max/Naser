/**
 * MapCanvas.jsx
 * The main interactive SVG map component.
 * Features: Parchment texture, geographic elements, two historical paths,
 * animated city nodes, Jerusalem centrepiece, draggable + zoomable.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pathsData, MAP_VIEWBOX } from '../../utils/pathsData';
import { buildSmoothSVGPath } from '../../utils/positionCalculator';
import { useGameStore } from '../../store/gameStore';
import MapNode from './MapNode';
import JerusalemMarker from './JerusalemMarker';
import StudentAvatar from '../student/StudentAvatar';

const { width: VW, height: VH } = MAP_VIEWBOX;

// ─── SVG Defs (gradients, filters, patterns) ─────────────────
function MapDefs() {
  return (
    <defs>
      {/* Parchment radial gradient - warm tones */}
      <radialGradient id="parchment-grad" cx="50%" cy="45%" r="65%">
        <stop offset="0%"   stopColor="var(--parchment-stop0)" />
        <stop offset="45%"  stopColor="var(--parchment-stop45)" />
        <stop offset="100%" stopColor="var(--parchment-stop100)" />
      </radialGradient>

      {/* Map terrain gradient — realistic desert/fertile crescent tones */}
      <linearGradient id="terrain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#1a2a1a" stopOpacity="0.4" />
        <stop offset="30%"  stopColor="#2a1a08" stopOpacity="0.3" />
        <stop offset="70%"  stopColor="#1e1508" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#0f0a04" stopOpacity="0.35" />
      </linearGradient>

      {/* Mediterranean Sea gradient */}
      <radialGradient id="sea-grad" cx="30%" cy="50%" r="70%">
        <stop offset="0%"   stopColor="var(--sea-stop0)" stopOpacity="0.9" />
        <stop offset="100%" stopColor="var(--sea-stop100)" stopOpacity="0.95" />
      </radialGradient>

      {/* Path 1 gradient (Emerald) */}
      <linearGradient id="path1-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#52d68a" />
        <stop offset="50%"  stopColor="#2d9a5f" />
        <stop offset="100%" stopColor="#52d68a" />
      </linearGradient>

      {/* Path 2 gradient (Ocean Blue) */}
      <linearGradient id="path2-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#60b4f5" />
        <stop offset="50%"  stopColor="#2a7fc4" />
        <stop offset="100%" stopColor="#60b4f5" />
      </linearGradient>

      {/* Jerusalem radiance */}
      <radialGradient id="jerusalem-radiance" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#d4af37" stopOpacity="0.7" />
        <stop offset="40%"  stopColor="#d4af37" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
      </radialGradient>

      {/* Vignette */}
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
        <stop offset="60%"  stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
      </radialGradient>

      {/* Glow filter for nodes */}
      <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Gold glow filter */}
      <filter id="gold-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feColorMatrix in="blur" type="matrix"
          values="1 0.7 0 0 0  0.5 0.35 0 0 0  0 0 0 0 0  0 0 0 0.8 0"
          result="goldBlur" />
        <feMerge>
          <feMergeNode in="goldBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Drop shadow */}
      <filter id="drop-shadow">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.8)" />
      </filter>

      {/* Noise texture pattern */}
      <filter id="noise-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feBlend in="SourceGraphic" mode="multiply" />
      </filter>

      {/* Clip for map bounds */}
      <clipPath id="map-clip">
        <rect x="0" y="0" width={VW} height={VH} />
      </clipPath>
    </defs>
  );
}

// ─── Geographic Decorations ────────────────────────────────────
function MapDecorations() {
  return (
    <g id="decorations">
      {/* Mediterranean Sea */}
      <path
        d="M 0,0 L 0,680 C 80,620 120,550 110,480 C 100,400 70,340 80,260 C 90,180 120,120 100,60 Z"
        fill="url(#sea-grad)"
        opacity="0.85"
      />
      {/* Sea waves text */}
      <text x="52" y="380" fontSize="11" fill="#3a7ab5" opacity="0.6"
        fontFamily="Cairo, sans-serif" textAnchor="middle" transform="rotate(-70, 52, 380)">
        البحر الأبيض المتوسط
      </text>

      {/* Mountain range 1 (right side - Iraq) */}
      {[
        [1100,120], [1130,100], [1160,115], [1190,95], [1220,108],
      ].map(([mx, my], i) => (
        <polygon
          key={`mtn1-${i}`}
          points={`${mx},${my+30} ${mx+15},${my} ${mx+30},${my+30}`}
          fill="var(--mtn-fill)" stroke="var(--mtn-stroke)" strokeWidth="0.5" opacity="0.6"
        />
      ))}

      {/* Mountain range 2 (upper center) */}
      {[
        [600,40], [630,25], [660,38], [690,22], [720,35],
        [750,20], [780,33],
      ].map(([mx, my], i) => (
        <polygon
          key={`mtn2-${i}`}
          points={`${mx},${my+25} ${mx+12},${my} ${mx+24},${my+25}`}
          fill="var(--mtn-fill)" stroke="var(--mtn-stroke)" strokeWidth="0.5" opacity="0.5"
        />
      ))}

      {/* River Tigris (rough line on the right side) */}
      <path
        d="M 1240,90 C 1210,140 1190,200 1160,260 C 1130,320 1100,370 1060,420 C 1020,470 980,510 940,550"
        fill="none" stroke="#1a4a6a" strokeWidth="2.5" opacity="0.35" strokeDasharray="6,4"
      />
      <text x="1165" y="180" fontSize="9" fill="#3a8aaa" opacity="0.5"
        fontFamily="Cairo, sans-serif" textAnchor="middle" transform="rotate(65, 1165, 180)">
        نهر دجلة
      </text>

      {/* River Euphrates */}
      <path
        d="M 1280,60 C 1260,100 1230,150 1190,195 C 1150,240 1110,280 1080,330"
        fill="none" stroke="#1a4a6a" strokeWidth="2" opacity="0.3" strokeDasharray="5,4"
      />
      <text x="1255" y="130" fontSize="9" fill="#3a8aaa" opacity="0.4"
        fontFamily="Cairo, sans-serif" textAnchor="middle" transform="rotate(70, 1255, 130)">
        الفرات
      </text>

      {/* Dead Sea */}
      <ellipse cx="720" cy="680" rx="35" ry="20" fill="#1a3a5c" opacity="0.4" />
      <text x="720" y="683" fontSize="8" fill="#4a8abc" opacity="0.5"
        fontFamily="Cairo, sans-serif" textAnchor="middle">
        البحر الميت
      </text>

      {/* Decorative corner ornaments */}
      <g opacity="0.3">
        <text x="30" y="40" fontSize="24" fill="#d4af37" fontFamily="serif">✦</text>
        <text x={VW - 50} y="40" fontSize="24" fill="#d4af37" fontFamily="serif">✦</text>
        <text x="30" y={VH - 20} fontSize="24" fill="#d4af37" fontFamily="serif">✦</text>
        <text x={VW - 50} y={VH - 20} fontSize="24" fill="#d4af37" fontFamily="serif">✦</text>
      </g>

      {/* Top border decoration */}
      <line x1="60" y1="18" x2={VW - 60} y2="18"
        stroke="#d4af37" strokeWidth="0.8" opacity="0.25" />
      <line x1="60" y1="22" x2={VW - 60} y2="22"
        stroke="#d4af37" strokeWidth="0.3" opacity="0.15" />

      {/* Bottom border decoration */}
      <line x1="60" y1={VH - 18} x2={VW - 60} y2={VH - 18}
        stroke="#d4af37" strokeWidth="0.8" opacity="0.25" />

      {/* Region Labels */}
      <text x="870" y="200" fontSize="13" fill="#c49a1a" opacity="0.35"
        fontFamily="Reem Kufi, serif" textAnchor="middle" letterSpacing="3">
        بلاد العراق
      </text>
      <text x="350" y="200" fontSize="13" fill="#c49a1a" opacity="0.35"
        fontFamily="Reem Kufi, serif" textAnchor="middle" letterSpacing="3">
        بلاد الشام
      </text>
      <text x="700" y="620" fontSize="11" fill="#c49a1a" opacity="0.3"
        fontFamily="Reem Kufi, serif" textAnchor="middle" letterSpacing="2">
        فلسطين
      </text>

      {/* Compass Rose (decorative, bottom-left) */}
      <CompassRose x={90} y={VH - 90} size={55} />
    </g>
  );
}

function CompassRose({ x, y, size }) {
  return (
    <g transform={`translate(${x}, ${y})`} opacity="0.5">
      {/* Outer ring */}
      <circle r={size * 0.9} fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.4" />
      <circle r={size * 0.7} fill="rgba(10,8,3,0.6)" stroke="#d4af37" strokeWidth="0.4" opacity="0.3" />

      {/* Cardinal points */}
      {[
        { angle: -90, label: 'ش' },
        { angle: 90, label: 'ج' },
        { angle: 0, label: 'ش' },
        { angle: 180, label: 'غ' },
      ].map(({ angle, label }, i) => {
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * size * 0.55;
        const ty = Math.sin(rad) * size * 0.55;
        const px = Math.cos(rad) * size * 0.8;
        const py = Math.sin(rad) * size * 0.8;
        const labels = ['ش', 'ج', 'شرق', 'غ'];
        const actualLabels = ['شمال', 'جنوب', 'شرق', 'غرب'];
        const shortLabels = ['ش', 'ج', 'ش', 'غ'];
        return (
          <g key={i}>
            {/* Arrow */}
            <line x1="0" y1="0" x2={px} y2={py}
              stroke="#d4af37" strokeWidth="1.2" opacity="0.7" />
            {/* Diamond tip */}
            <polygon
              points={`${px - 3},${py} ${px},${py - 3} ${px + 3},${py} ${px},${py + 3}`}
              fill="#d4af37" opacity="0.6" transform={`rotate(${angle}, ${px}, ${py})`}
            />
            {/* Label */}
            <text x={tx} y={ty + 4} textAnchor="middle" fontSize="7"
              fill="#d4af37" fontFamily="Reem Kufi, serif" opacity="0.8">
              {shortLabels[i]}
            </text>
          </g>
        );
      })}

      {/* Center dot */}
      <circle r="3" fill="#d4af37" opacity="0.7" />
    </g>
  );
}

// ─── Path Lines ────────────────────────────────────────────────
function MapPaths() {
  const path1D = buildSmoothSVGPath(pathsData.path1);
  const path2D = buildSmoothSVGPath(pathsData.path2);

  return (
    <g id="paths">
      {/* Path 1 shadow */}
      <path d={path1D} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="9"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Path 1 main */}
      <path d={path1D} fill="none" stroke="url(#path1-grad)" strokeWidth="4.5"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="12,6" opacity="0.85" />
      {/* Path 1 glow overlay */}
      <path d={path1D} fill="none" stroke="#52d68a" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="12,6" opacity="0.4" filter="url(#node-glow)" />

      {/* Path 2 shadow */}
      <path d={path2D} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="9"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Path 2 main */}
      <path d={path2D} fill="none" stroke="url(#path2-grad)" strokeWidth="4.5"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="12,6" opacity="0.85" />
      {/* Path 2 glow overlay */}
      <path d={path2D} fill="none" stroke="#60b4f5" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="12,6" opacity="0.4" filter="url(#node-glow)" />

      {/* Connecting lines near Jerusalem */}
      <path
        d={`M ${pathsData.path1[pathsData.path1.length - 2].x} ${pathsData.path1[pathsData.path1.length - 2].y} L 700 820`}
        fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="2" strokeDasharray="4,4"
      />
      <path
        d={`M ${pathsData.path2[pathsData.path2.length - 2].x} ${pathsData.path2[pathsData.path2.length - 2].y} L 700 820`}
        fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="2" strokeDasharray="4,4"
      />
    </g>
  );
}

// ─── Main MapCanvas Component ──────────────────────────────────
export default function MapCanvas() {
  const containerRef = useRef(null);
  const panWrapperRef = useRef(null);
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);
  const isDraggingRef = useRef(false);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [hoveredStudentId, setHoveredStudentId] = useState(null);

  // Stable callback — does not cause full re-render of all nodes
  const handleNodeHover = useCallback((id) => {
    setHoveredNodeId(id);
  }, []);

  // Stable callback for student avatar hover (elevation via re-render at end)
  const handleStudentHover = useCallback((id) => {
    setHoveredStudentId(id);
  }, []);

  const applyTransform = useCallback((smooth = false) => {
    if (panWrapperRef.current) {
      panWrapperRef.current.style.transition = smooth ? 'transform 0.1s ease-out' : 'none';
      panWrapperRef.current.style.transform = `translate(${transformRef.current.x}px, ${transformRef.current.y}px) scale(${transformRef.current.scale})`;
    }
  }, []);

  const { seasons, activeSeasonId, settings } = useGameStore();
  const season = seasons[activeSeasonId];
  const students = season?.students || [];
  const nodePoints = settings.nodePoints || {};

  // ── Register wheel event with passive:false to allow preventDefault ─
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      transformRef.current.scale = Math.min(Math.max(transformRef.current.scale * delta, 0.5), 3);
      applyTransform(true);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyTransform]);

  // ── Drag handlers ──────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStart.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: transformRef.current.x,
      startY: transformRef.current.y,
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.clientX;
    const dy = e.clientY - dragStart.current.clientY;
    transformRef.current.x = dragStart.current.startX + dx;
    transformRef.current.y = dragStart.current.startY + dy;
    applyTransform(false);
  }, [applyTransform]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // ── Touch handlers for mobile ─────────────────────────────
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      isDraggingRef.current = true;
      setIsDragging(true);
      dragStart.current = {
        clientX: t.clientX,
        clientY: t.clientY,
        startX: transformRef.current.x,
        startY: transformRef.current.y,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 1 && isDraggingRef.current && dragStart.current) {
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - dragStart.current.clientX;
      const dy = t.clientY - dragStart.current.clientY;
      transformRef.current.x = dragStart.current.startX + dx;
      transformRef.current.y = dragStart.current.startY + dy;
      applyTransform(false);
    }
  }, [applyTransform]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Path 1 nodes (excluding Jerusalem from path2 to avoid dup)
  const path1Nodes = pathsData.path1;
  const path2Nodes = pathsData.path2.filter(n => n.id !== 'dest');

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
      {/* Zoom/Pan wrapper */}
      <div
        ref={panWrapperRef}
        style={{
          transform: `translate(${transformRef.current.x}px, ${transformRef.current.y}px) scale(${transformRef.current.scale})`,
          transformOrigin: 'center center',
          width: '100%',
          height: '100%',
        }}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <MapDefs />

          {/* Layer 0: Historical map background image */}
          <image
            href="/map-bg.png"
            x="0" y="0"
            width={VW} height={VH}
            preserveAspectRatio="xMidYMid slice"
            opacity="0.55"
          />

          {/* Layer 1: Parchment overlay blend */}
          <rect x="0" y="0" width={VW} height={VH} fill="url(#parchment-grad)" opacity="0.65" />

          {/* Layer 1b: Terrain gradient overlay */}
          <rect x="0" y="0" width={VW} height={VH} fill="url(#terrain-grad)" />

          {/* Layer 2: Geographic decorations */}
          <MapDecorations />

          {/* Layer 3: Jerusalem radiance (behind paths) */}
          <circle cx="700" cy="820" r="220" fill="url(#jerusalem-radiance)" opacity="0.7" />

          {/* Layer 4: Path lines */}
          <MapPaths />

          {/* Layer 5: City nodes — Path 1 */}
          {path1Nodes.map((node, idx) => {
            if (node.id === 'dest') return null;
            return (
              <MapNode
                key={node.id}
                node={node}
                pathColor="#2d9a5f"
                pathColorBright="#52d68a"
                index={idx + 1}
                requiredPoints={nodePoints[node.id]}
                onHoverChange={handleNodeHover}
              />
            );
          })}

          {/* Layer 6: City nodes — Path 2 */}
          {path2Nodes.map((node, idx) => (
            <MapNode
              key={node.id}
              node={node}
              pathColor="#2a7fc4"
              pathColorBright="#60b4f5"
              index={idx + 1}
              requiredPoints={nodePoints[node.id]}
              onHoverChange={handleNodeHover}
            />
          ))}

          {/* Layer 7: Jerusalem (always on top of nodes) */}
          <JerusalemMarker x={700} y={820} />

          {/* Layer 8: Student avatars — non-hovered ones first */}
          {students
            .filter(s => s.id !== hoveredStudentId)
            .map((student) => (
              <StudentAvatar
                key={student.id}
                student={student}
                allStudents={students}
                isDragging={isDragging}
                onHoverChange={handleStudentHover}
              />
            ))
          }

          {/* Layer 9a (TOP): Re-render hovered node last so tooltip is above everything */}
          {hoveredNodeId && (() => {
            // Find the hovered node in either path
            const allPathNodes = [...pathsData.path1, ...pathsData.path2.filter(n => n.id !== 'dest')];
            const hovNode = allPathNodes.find(n => n.id === hoveredNodeId);
            if (!hovNode) return null;
            const isPath1 = pathsData.path1.some(n => n.id === hoveredNodeId);
            return (
              <MapNode
                key={`hov-${hoveredNodeId}`}
                node={hovNode}
                pathColor={isPath1 ? '#2d9a5f' : '#2a7fc4'}
                pathColorBright={isPath1 ? '#52d68a' : '#60b4f5'}
                index={0}
                requiredPoints={nodePoints[hovNode.id]}
                forceHover={true}
                onHoverChange={handleNodeHover}
              />
            );
          })()}

          {/* Layer 9b (TOP): Re-render hovered student LAST for z-elevation */}
          {hoveredStudentId && (() => {
            const hovStudent = students.find(s => s.id === hoveredStudentId);
            if (!hovStudent) return null;
            return (
              <StudentAvatar
                key={`hov-student-${hoveredStudentId}`}
                student={hovStudent}
                allStudents={students}
                isDragging={isDragging}
                onHoverChange={handleStudentHover}
                forceHover={true}
              />
            );
          })()}

          {/* Layer 9: Vignette overlay */}
          <rect x="0" y="0" width={VW} height={VH}
            fill="url(#vignette)" pointerEvents="none" />
        </svg>
      </div>

      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-20">
        <button
          onClick={() => { transformRef.current.scale = Math.min(transformRef.current.scale * 1.2, 3); applyTransform(true); }}
          className="w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-all"
          style={{
            background: 'rgba(18, 14, 5, 0.9)',
            border: '1px solid rgba(212,175,55,0.4)',
            color: '#d4af37',
            cursor: 'pointer',
          }}
          title="تكبير"
        >+</button>
        <button
          onClick={() => { transformRef.current.x = 0; transformRef.current.y = 0; transformRef.current.scale = 1; applyTransform(true); }}
          className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all"
          style={{
            background: 'rgba(18, 14, 5, 0.9)',
            border: '1px solid rgba(212,175,55,0.4)',
            color: '#d4af37',
            cursor: 'pointer',
          }}
          title="إعادة ضبط"
        >⌂</button>
        <button
          onClick={() => { transformRef.current.scale = Math.max(transformRef.current.scale * 0.8, 0.5); applyTransform(true); }}
          className="w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-all"
          style={{
            background: 'rgba(18, 14, 5, 0.9)',
            border: '1px solid rgba(212,175,55,0.4)',
            color: '#d4af37',
            cursor: 'pointer',
          }}
          title="تصغير"
        >−</button>
      </div>
    </div>
  );
}
