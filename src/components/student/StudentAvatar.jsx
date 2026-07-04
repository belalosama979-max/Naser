/**
 * StudentAvatar.jsx
 * Renders a student's photo avatar on the SVG map.
 * Implements cluster layout for students at similar progress positions.
 * Shows a rich tooltip on hover.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getStudentMapPosition } from '../../utils/positionCalculator';
import { getPathColor } from '../../utils/pathsData';

// Avatar size on map
const AVATAR_SIZE = 36;
const AVATAR_RADIUS = AVATAR_SIZE / 2;

export default function StudentAvatar({ student, allStudents, isDragging }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Compute position with cluster offset
  const { x, y } = useMemo(
    () => getStudentMapPosition(student, allStudents),
    [student.id, student.progress, student.pathId, allStudents]
  );

  const pathColor = getPathColor(student.pathId);

  const handleMouseEnter = useCallback(() => {
    if (!isDragging) setShowTooltip(true);
  }, [isDragging]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // Rank change direction
  const rankChange = student.previousRank - student.currentRank;

  return (
    <motion.g
      animate={{ x, y }}
      transition={{
        type: 'spring',
        stiffness: 55,
        damping: 14,
        mass: 0.8,
      }}
      style={{ cursor: 'default' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Pulse ring for Jerusalem badge holders */}
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

      {/* Path indicator ring (behind avatar) */}
      <circle
        r={AVATAR_RADIUS + 5}
        fill={student.hasJerusalemBadge
          ? 'rgba(212,175,55,0.2)'
          : `${pathColor.primary}22`}
        stroke={student.hasJerusalemBadge ? '#d4af37' : pathColor.primary}
        strokeWidth={student.hasJerusalemBadge ? 2.5 : 1.5}
        opacity="0.8"
      />

      {/* Shadow */}
      <ellipse
        cx={0} cy={AVATAR_RADIUS + 4}
        rx={AVATAR_RADIUS - 2} ry={4}
        fill="rgba(0,0,0,0.5)" opacity="0.6"
      />

      {/* Avatar clip and image */}
      <defs>
        <clipPath id={`clip-${student.id}`}>
          <circle r={AVATAR_RADIUS} />
        </clipPath>
      </defs>

      {/* Avatar background */}
      <circle r={AVATAR_RADIUS}
        fill="#1a1208"
        stroke={student.hasJerusalemBadge ? '#d4af37' : pathColor.primary}
        strokeWidth="2"
      />

      {/* Avatar image or initials */}
      {student.avatar ? (
        <image
          href={student.avatar}
          x={-AVATAR_RADIUS}
          y={-AVATAR_RADIUS}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          clipPath={`url(#clip-${student.id})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="13"
          fontFamily="Cairo, sans-serif"
          fontWeight="700"
          fill={pathColor.bright}
        >
          {student.name.charAt(0)}
        </text>
      )}

      {/* Jerusalem badge icon */}
      {student.hasJerusalemBadge && (
        <g transform={`translate(${AVATAR_RADIUS - 6}, ${-AVATAR_RADIUS + 1})`}>
          <circle r="7" fill="#d4af37" />
          <text textAnchor="middle" dominantBaseline="central"
            fontSize="8" fill="#0d0a02">
            ★
          </text>
        </g>
      )}

      {/* Name label below avatar */}
      <g transform={`translate(0, ${AVATAR_RADIUS + 10})`}>
        <rect
          x={-22} y={-8}
          width="44" height="14"
          rx="3"
          fill="rgba(8,6,2,0.85)"
          stroke={`${pathColor.primary}60`}
          strokeWidth="0.7"
        />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="7.5"
          fontFamily="Cairo, sans-serif"
          fontWeight="600"
          fill="#c8b080"
        >
          {student.name.split(' ')[0].substring(0, 8)}
        </text>
      </g>

      {/* Hover Tooltip */}
      {showTooltip && (
        <TooltipContent
          student={student}
          pathColor={pathColor}
          rankChange={rankChange}
          avatarRadius={AVATAR_RADIUS}
          svgX={x}
          svgY={y}
        />
      )}
    </motion.g>
  );
}

// ─── Tooltip ────────────────────────────────────────────────────
function TooltipContent({ student, pathColor, rankChange, avatarRadius, svgX, svgY }) {
  const TW = 180; // tooltip width
  const TH = 104; // tooltip height
  // Clamp so tooltip stays inside SVG viewBox (0..1400 x 0..900)
  // svgX/svgY are the absolute SVG coords of the avatar center
  const clampedAbsX = Math.min(Math.max(svgX - TW / 2, 8), 1400 - TW - 8);
  // TX relative to motion.g center (which is at svgX, svgY)
  const TX = clampedAbsX - svgX;
  const TY = -(avatarRadius + TH + 16);

  return (
    <g className="tooltip-container">
      {/* Tooltip background */}
      <rect
        x={TX} y={TY}
        width={TW} height={TH}
        rx="8"
        fill="rgba(8,6,2,0.97)"
        stroke={pathColor.primary}
        strokeWidth="1.2"
        filter="url(#drop-shadow)"
      />

      {/* Top accent line */}
      <rect x={TX + 1} y={TY + 1} width={TW - 2} height="3"
        rx="7"
        fill={`url(#${student.pathId === 'path1' ? 'path1-grad' : 'path2-grad'})`}
        opacity="0.7"
      />

      {/* Arrow pointer — always centered on avatar */}
      <polygon
        points={`${-8},${TY + TH} ${8},${TY + TH} 0,${-(avatarRadius + 8)}`}
        fill="rgba(8,6,2,0.97)"
        stroke={pathColor.primary}
        strokeWidth="1"
      />
      <polygon
        points={`${-7},${TY + TH - 1} ${7},${TY + TH - 1} 0,${-(avatarRadius + 8)}`}
        fill="rgba(8,6,2,0.97)"
      />

      {/* Student name — centered */}
      <text x={TX + TW / 2} y={TY + 22}
        textAnchor="middle" fontSize="13"
        fontFamily="Reem Kufi, serif"
        fill="#f0d060" fontWeight="700">
        {student.name}
      </text>

      {/* Divider */}
      <line x1={TX + 12} y1={TY + 30} x2={TX + TW - 12} y2={TY + 30}
        stroke={`${pathColor.primary}50`} strokeWidth="0.8" />

      {/* Points row: label right, value left (RTL layout) */}
      <text x={TX + TW - 12} y={TY + 48} textAnchor="end" fontSize="9"
        fontFamily="Cairo, sans-serif" fill="#7a6a50">:النقاط</text>
      <text x={TX + 12} y={TY + 48} textAnchor="start" fontSize="11"
        fontFamily="Cairo, sans-serif" fill={pathColor.bright} fontWeight="700">
        {student.points.toLocaleString('ar')}
      </text>

      {/* Progress row */}
      <text x={TX + TW - 12} y={TY + 65} textAnchor="end" fontSize="9"
        fontFamily="Cairo, sans-serif" fill="#7a6a50">:الإنجاز</text>
      <text x={TX + 12} y={TY + 65} textAnchor="start" fontSize="11"
        fontFamily="Cairo, sans-serif" fill={pathColor.bright} fontWeight="700">
        {student.progress.toFixed(2)}%
      </text>

      {/* Rank row */}
      <text x={TX + TW - 12} y={TY + 82} textAnchor="end" fontSize="9"
        fontFamily="Cairo, sans-serif" fill="#7a6a50">:الترتيب</text>
      <text x={TX + 12} y={TY + 82} textAnchor="start" fontSize="11"
        fontFamily="Cairo, sans-serif" fill="#c8b890" fontWeight="600">
        #{student.currentRank}
        {rankChange > 0 && (
          <tspan fill="#52d68a" fontSize="9"> ↑{rankChange}</tspan>
        )}
        {rankChange < 0 && (
          <tspan fill="#e05050" fontSize="9"> ↓{Math.abs(rankChange)}</tspan>
        )}
      </text>

      {/* Path badge — centered */}
      <rect
        x={TX + TW / 2 - 35} y={TY + 88}
        width="70" height="13"
        rx="6"
        fill={`${pathColor.primary}30`}
        stroke={pathColor.primary}
        strokeWidth="0.6"
      />
      <text x={TX + TW / 2} y={TY + 97}
        textAnchor="middle" fontSize="7.5"
        fontFamily="Cairo, sans-serif"
        fill={pathColor.bright}>
        {student.pathId === 'path1' ? 'المسار العراقي' : 'المسار الشامي'}
      </text>

      {/* Jerusalem badge */}
      {student.hasJerusalemBadge && (
        <g>
          <rect x={TX + 8} y={TY + 87} width="55" height="13"
            rx="6" fill="rgba(212,175,55,0.2)" stroke="#d4af37" strokeWidth="0.8" />
          <text x={TX + 35} y={TY + 96}
            textAnchor="middle" fontSize="7.5"
            fontFamily="Cairo, sans-serif" fill="#d4af37" fontWeight="700">
            ★ فاتح القدس
          </text>
        </g>
      )}
    </g>
  );
}
