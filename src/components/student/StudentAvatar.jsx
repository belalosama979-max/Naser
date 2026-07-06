/**
 * StudentAvatar.jsx
 *
 * Z-INDEX STRATEGY (FINAL FIX):
 * SVG renders in document order — no CSS z-index support on <g>.
 * The correct approach is to split the avatar body from its tooltip:
 *   1. Avatar body stays at its fixed position in the DOM (no re-render, no jump).
 *   2. The tooltip is rendered in a SEPARATE top-level <g> in MapCanvas,
 *      positioned using absolute SVG coordinates (svgX, svgY).
 *
 * This file exports:
 *   - StudentAvatar (default): renders avatar body only
 *   - StudentTooltip: renders tooltip only, used by MapCanvas in a top layer
 */

import React, { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getStudentMapPosition } from '../../utils/positionCalculator';
import { getPathColor } from '../../utils/pathsData';

const AVATAR_SIZE = 36;
const AVATAR_RADIUS = AVATAR_SIZE / 2;
const SVG_W = 1400;
const SVG_H = 900;

// ─── Avatar body only (no tooltip rendered here) ─────────────
export default function StudentAvatar({ student, allStudents, isDragging, onHoverChange, isHighlighted }) {
  const [localHover, setLocalHover] = useState(false);
  const isHovered = localHover;

  const { x, y } = useMemo(
    () => getStudentMapPosition(student, allStudents),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [student.id, student.progress, student.pathId, allStudents]
  );

  const pathColor = getPathColor(student.pathId);

  const handleMouseEnter = useCallback(() => {
    if (!isDragging) {
      setLocalHover(true);
      onHoverChange?.(student.id, x, y);
    }
  }, [isDragging, onHoverChange, student.id, x, y]);

  const handleMouseLeave = useCallback(() => {
    setLocalHover(false);
    onHoverChange?.(null, 0, 0);
  }, [onHoverChange]);

  return (
    <motion.g
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 55, damping: 14, mass: 0.8 }}
      style={{ cursor: 'default' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Jerusalem badge pulse */}
      {student.hasJerusalemBadge && (
        <motion.circle
          r={AVATAR_RADIUS + 8}
          fill="none"
          stroke="#d4af37"
          strokeWidth="2"
          animate={{ r: [AVATAR_RADIUS + 6, AVATAR_RADIUS + 14], opacity: [0.8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* Highlighted (my position in portal) */}
      {isHighlighted && (
        <motion.circle
          r={AVATAR_RADIUS + 12}
          fill="none"
          stroke="#d4af37"
          strokeWidth="2"
          animate={{ r: [AVATAR_RADIUS + 10, AVATAR_RADIUS + 20], opacity: [0.9, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
        />
      )}

      {/* Hover ring — subtle scale up, NO position change */}
      <circle
        r={isHovered ? AVATAR_RADIUS + 7 : AVATAR_RADIUS + 5}
        fill={student.hasJerusalemBadge ? 'rgba(212,175,55,0.2)' : `${pathColor.primary}22`}
        stroke={isHighlighted ? '#d4af37' : student.hasJerusalemBadge ? '#d4af37' : pathColor.primary}
        strokeWidth={isHighlighted ? 2.5 : isHovered ? 2 : 1.5}
        style={{ transition: 'all 0.2s ease' }}
        opacity="0.85"
      />

      {/* Shadow */}
      <ellipse cx={0} cy={AVATAR_RADIUS + 4} rx={AVATAR_RADIUS - 2} ry={4}
        fill="rgba(0,0,0,0.5)" opacity="0.6" />

      {/* Clip */}
      <defs>
        <clipPath id={`clip-${student.id}`}>
          <circle r={AVATAR_RADIUS} />
        </clipPath>
      </defs>

      {/* Avatar circle */}
      <circle r={AVATAR_RADIUS}
        fill="#1a1208"
        stroke={isHighlighted ? '#d4af37' : student.hasJerusalemBadge ? '#d4af37' : pathColor.primary}
        strokeWidth={isHighlighted ? 2.5 : 2}
      />

      {/* Photo or initials */}
      {student.avatar ? (
        <image
          href={student.avatar}
          x={-AVATAR_RADIUS} y={-AVATAR_RADIUS}
          width={AVATAR_SIZE} height={AVATAR_SIZE}
          clipPath={`url(#clip-${student.id})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <text textAnchor="middle" dominantBaseline="central"
          fontSize="13" fontFamily="Cairo, sans-serif" fontWeight="700"
          fill={pathColor.bright}>
          {student.name.charAt(0)}
        </text>
      )}

      {/* Jerusalem badge */}
      {student.hasJerusalemBadge && (
        <g transform={`translate(${AVATAR_RADIUS - 6}, ${-AVATAR_RADIUS + 1})`}>
          <circle r="7" fill="#d4af37" />
          <text textAnchor="middle" dominantBaseline="central" fontSize="8" fill="#0d0a02">★</text>
        </g>
      )}

      {/* Name label */}
      <g transform={`translate(0, ${AVATAR_RADIUS + 10})`}>
        <rect x={-22} y={-8} width="44" height="14" rx="3"
          fill="rgba(8,6,2,0.85)" stroke={`${pathColor.primary}60`} strokeWidth="0.7" />
        <text textAnchor="middle" dominantBaseline="central"
          fontSize="7.5" fontFamily="Cairo, sans-serif" fontWeight="600"
          fill={isHighlighted ? '#f5d060' : '#c8b080'}>
          {student.name.split(' ')[0].substring(0, 8)}
        </text>
      </g>
    </motion.g>
  );
}

// ─── Tooltip — rendered in a SEPARATE top-level SVG layer ────
// svgX, svgY = absolute SVG coords of the avatar center
export function StudentTooltip({ student, svgX, svgY, onMouseEnter, onMouseLeave }) {
  const pathColor = getPathColor(student.pathId);
  const rankChange = student.previousRank - student.currentRank;

  const TW = 190;
  const TH = 110;
  const MARGIN = 12;

  // Y: prefer above; flip to below near top edge
  const showBelow = svgY < TH + MARGIN + AVATAR_RADIUS + 20;
  // X: clamp so tooltip never clips
  const clampedX = Math.min(Math.max(svgX - TW / 2, MARGIN), SVG_W - TW - MARGIN);

  const TX = clampedX;
  const TY = showBelow
    ? svgY + AVATAR_RADIUS + 18
    : svgY - AVATAR_RADIUS - TH - 16;

  const arrowPoints = showBelow
    ? `${svgX - 8},${TY} ${svgX + 8},${TY} ${svgX},${TY - 10}`
    : `${svgX - 8},${TY + TH} ${svgX + 8},${TY + TH} ${svgX},${TY + TH + 10}`;

  const row1Y = TY + 22;
  const divY  = TY + 31;
  const row2Y = TY + 50;
  const row3Y = TY + 68;
  const row4Y = TY + 86;
  const badgeY = TY + 95;

  return (
    <g
      className="student-tooltip-layer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Background */}
      <rect x={TX} y={TY} width={TW} height={TH} rx="8"
        fill="rgba(8,6,2,0.97)" stroke={pathColor.primary} strokeWidth="1.2"
        filter="url(#drop-shadow)" />

      {/* Top accent */}
      <rect x={TX + 1} y={TY + 1} width={TW - 2} height="3" rx="7"
        fill={`url(#${student.pathId === 'path1' ? 'path1-grad' : 'path2-grad'})`}
        opacity="0.7" />

      {/* Arrow */}
      <polygon points={arrowPoints} fill="rgba(8,6,2,0.97)" stroke={pathColor.primary} strokeWidth="1" />
      <polygon points={arrowPoints} fill="rgba(8,6,2,0.97)" />

      {/* Name */}
      <text x={TX + TW / 2} y={row1Y} textAnchor="middle" fontSize="13"
        fontFamily="Reem Kufi, serif" fill="#f0d060" fontWeight="700">
        {student.name}
      </text>

      {/* Divider */}
      <line x1={TX + 12} y1={divY} x2={TX + TW - 12} y2={divY}
        stroke={`${pathColor.primary}50`} strokeWidth="0.8" />

      {/* Points */}
      <text x={TX + TW - 12} y={row2Y} textAnchor="end" fontSize="9"
        fontFamily="Cairo, sans-serif" fill="#7a6a50">النقاط:</text>
      <text x={TX + 12} y={row2Y} textAnchor="start" fontSize="11"
        fontFamily="Cairo, sans-serif" fill={pathColor.bright} fontWeight="700">
        {student.points.toLocaleString('ar-SA')}
      </text>

      {/* Progress */}
      <text x={TX + TW - 12} y={row3Y} textAnchor="end" fontSize="9"
        fontFamily="Cairo, sans-serif" fill="#7a6a50">الإنجاز:</text>
      <text x={TX + 12} y={row3Y} textAnchor="start" fontSize="11"
        fontFamily="Cairo, sans-serif" fill={pathColor.bright} fontWeight="700">
        {student.progress.toFixed(1)}%
      </text>

      {/* Rank */}
      <text x={TX + TW - 12} y={row4Y} textAnchor="end" fontSize="9"
        fontFamily="Cairo, sans-serif" fill="#7a6a50">الترتيب:</text>
      <text x={TX + 12} y={row4Y} textAnchor="start" fontSize="11"
        fontFamily="Cairo, sans-serif" fill="#c8b890" fontWeight="600">
        #{student.currentRank}
        {rankChange > 0 && <tspan fill="#52d68a" fontSize="9"> ↑{rankChange}</tspan>}
        {rankChange < 0 && <tspan fill="#e05050" fontSize="9"> ↓{Math.abs(rankChange)}</tspan>}
      </text>

      {/* Badge */}
      {student.hasJerusalemBadge ? (
        <g>
          <rect x={TX + TW / 2 - 40} y={badgeY - 2} width="80" height="13"
            rx="6" fill="rgba(212,175,55,0.2)" stroke="#d4af37" strokeWidth="0.8" />
          <text x={TX + TW / 2} y={badgeY + 7} textAnchor="middle" fontSize="7.5"
            fontFamily="Cairo, sans-serif" fill="#d4af37" fontWeight="700">
            ★ فاتح القدس
          </text>
        </g>
      ) : (
        <g>
          <rect x={TX + TW / 2 - 35} y={badgeY - 2} width="70" height="13"
            rx="6" fill={`${pathColor.primary}30`} stroke={pathColor.primary} strokeWidth="0.6" />
          <text x={TX + TW / 2} y={badgeY + 7} textAnchor="middle" fontSize="7.5"
            fontFamily="Cairo, sans-serif" fill={pathColor.bright}>
            {student.pathId === 'path1' ? 'المسار العراقي' : 'المسار الشامي'}
          </text>
        </g>
      )}
    </g>
  );
}
