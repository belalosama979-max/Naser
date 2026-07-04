/**
 * MapNode.jsx
 * A single city/region node on the SVG map.
 * Main nodes: larger fortress/city icon with name + required points.
 * Sub nodes: smaller waypoint marker with name + required points inline.
 */

import React, { useState } from 'react';

export default function MapNode({ node, pathColor, pathColorBright, index, requiredPoints, onHoverChange, forceHover }) {
  const [hovered, setHovered] = useState(false);
  const isActive = forceHover || hovered;
  const isMain = node.type === 'main';
  const { x, y, name, subtitle, desc } = node;

  // Format points display — compact, e.g. "100 نقطة"
  const pointsLabel = requiredPoints !== undefined ? `${requiredPoints}` : null;

  if (isMain) {
    const labelW = getTextWidth(name) + 12;

    return (
      <g
        className="map-node-main"
        onMouseEnter={() => { setHovered(true);  onHoverChange?.(node.id); }}
        onMouseLeave={() => { setHovered(false); onHoverChange?.(null); }}
        style={{ cursor: 'default' }}
      >
        {/* Outer glow ring */}
        <circle cx={x} cy={y} r={isActive ? 22 : 18}
          fill="none" stroke={pathColor} strokeWidth="1.5"
          opacity={isActive ? 0.7 : 0.3}
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Shadow */}
        <ellipse cx={x} cy={y + 18} rx="12" ry="4"
          fill="rgba(0,0,0,0.5)" opacity="0.6" />

        {/* City/Fortress base plate */}
        <circle cx={x} cy={y} r={isActive ? 16 : 14}
          fill={`rgba(${hexToRgb(pathColor)}, 0.2)`}
          stroke={pathColor} strokeWidth="1.5"
          style={{ transition: 'all 0.3s ease' }}
        />
        <circle cx={x} cy={y} r={isActive ? 14 : 12}
          fill="rgba(18, 14, 5, 0.85)"
          stroke={pathColorBright} strokeWidth="0.8"
          opacity="0.8"
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Fortress icon — towers */}
        <FortressIcon cx={x} cy={y} color={pathColorBright} size={isActive ? 10 : 8} />

        {/* City name label + points side by side */}
        <g style={{ transition: 'all 0.3s ease' }}>
          {/* Main name background */}
          <rect
            x={x - labelW / 2}
            y={y + (isActive ? 20 : 17)}
            width={labelW}
            height="16"
            rx="3"
            fill="rgba(10,8,3,0.85)"
            stroke={pathColor}
            strokeWidth="0.6"
            opacity="0.9"
          />
          <text
            x={x}
            y={y + (isActive ? 31 : 28)}
            textAnchor="middle"
            fontSize={isActive ? '10.5' : '9.5'}
            fontFamily="Reem Kufi, serif"
            fill={isActive ? pathColorBright : '#c8b890'}
            fontWeight="600"
            style={{ transition: 'all 0.3s ease' }}
          >
            {name}
          </text>

        {/* Points badge — always visible below name */}
          {pointsLabel && (
            <g>
              <rect
                x={x - 22}
                y={y + (isActive ? 36 : 33)}
                width="44"
                height="13"
                rx="6"
                fill={`rgba(${hexToRgb(pathColor)}, 0.25)`}
                stroke={pathColor}
                strokeWidth="0.7"
              />
              <text
                x={x}
                y={y + (isActive ? 45 : 42)}
                textAnchor="middle"
                fontSize="7.5"
                fontFamily="Cairo, sans-serif"
                fill={pathColorBright}
                fontWeight="700"
              >
                {pointsLabel} نق
              </text>
            </g>
          )}
        </g>

        {/* Hover tooltip — smart position stays inside viewBox */}
        {isActive && (() => {
          const TW = 160;
          const TH = 82;
          // Clamp x so tooltip stays inside 0..1400
          const tx = Math.min(Math.max(x - TW / 2, 8), 1400 - TW - 8);
          const ty = y - 26 - TH;
          return (
            <g>
              <rect x={tx} y={ty} width={TW} height={TH} rx="6"
                fill="rgba(10,8,3,0.96)" stroke={pathColor} strokeWidth="1" />
              {/* Arrow */}
              <polygon
                points={`${x - 6},${ty + TH} ${x + 6},${ty + TH} ${x},${ty + TH + 10}`}
                fill={pathColor} opacity="0.8"
              />
              <text x={tx + TW / 2} y={ty + 18} textAnchor="middle" fontSize="10"
                fontFamily="Reem Kufi, serif" fill={pathColorBright} fontWeight="700">
                {name}
              </text>
              {pointsLabel && (
                <text x={tx + TW / 2} y={ty + 36} textAnchor="middle" fontSize="9"
                  fontFamily="Cairo, sans-serif" fill="#d4af37" fontWeight="600">
                  🎯 {pointsLabel} نقطة مطلوبة
                </text>
              )}
              <text x={tx + TW / 2} y={ty + 52} textAnchor="middle" fontSize="8"
                fontFamily="Cairo, sans-serif" fill="#8a7a60" fontWeight="400">
                {subtitle}
              </text>
              <text x={tx + TW / 2} y={ty + 68} textAnchor="middle" fontSize="7.5"
                fontFamily="Cairo, sans-serif" fill="#6a6050" fontWeight="400">
                {desc?.substring(0, 30)}...
              </text>
            </g>
          );
        })()}
      </g>
    );
  }

// ─── Sub node (waypoint marker) ──────────────────────────────
  return (
    <g
      className="map-node-sub"
      onMouseEnter={() => { setHovered(true);  onHoverChange?.(node.id); }}
      onMouseLeave={() => { setHovered(false); onHoverChange?.(null); }}
    >
      {/* Outer ring */}
      <circle cx={x} cy={y} r={isActive ? 9 : 7}
        fill="none" stroke={pathColor} strokeWidth="1"
        opacity={isActive ? 0.6 : 0.22}
        style={{ transition: 'all 0.2s ease' }}
      />

      {/* Inner dot */}
      <circle cx={x} cy={y} r={isActive ? 5 : 4}
        fill="rgba(18, 14, 5, 0.75)"
        stroke={pathColor} strokeWidth="0.8"
        opacity="0.7"
        style={{ transition: 'all 0.2s ease' }}
      />
      <circle cx={x} cy={y} r="2"
        fill={pathColor} opacity="0.75"
      />

      {/* Sub name + points — simple text right beside the dot */}
      <g>
        <text
          x={x + 12}
          y={y - 2}
          textAnchor="start"
          fontSize="7.5"
          fontFamily="Cairo, sans-serif"
          fill={isActive ? '#e0d0a0' : '#b8a878'}
          style={{ transition: 'color 0.2s ease' }}
        >
          {name}
        </text>
        {pointsLabel && (
          <text
            x={x + 12}
            y={y + 9}
            textAnchor="start"
            fontSize="7"
            fontFamily="Cairo, sans-serif"
            fill={pathColorBright}
            opacity="0.8"
            fontWeight="700"
          >
            {pointsLabel} نق
          </text>
        )}
      </g>

      {/* Hover tooltip (minimal) — smart clamp */}
      {isActive && (() => {
        const TW = 120;
        const TH = pointsLabel ? 36 : 22;
        const tx = Math.min(Math.max(x - TW / 2, 8), 1400 - TW - 8);
        const ty = y - 18 - TH;
        return (
          <g>
            <rect x={tx} y={ty} width={TW} height={TH} rx="4"
              fill="rgba(10,8,3,0.95)" stroke={pathColor} strokeWidth="0.8" />
            <polygon
              points={`${x - 4},${ty + TH} ${x + 4},${ty + TH} ${x},${ty + TH + 7}`}
              fill={pathColor} opacity="0.7"
            />
            <text x={tx + TW / 2} y={ty + 14} textAnchor="middle" fontSize="9"
              fontFamily="Cairo, sans-serif" fill="#c0a870" fontWeight="600">
              {name}
            </text>
            {pointsLabel && (
              <text x={tx + TW / 2} y={ty + 28} textAnchor="middle" fontSize="8"
                fontFamily="Cairo, sans-serif" fill="#d4af37" fontWeight="600">
                🎯 {pointsLabel} نقطة
              </text>
            )}
          </g>
        );
      })()}
    </g>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function FortressIcon({ cx, cy, color, size }) {
  const s = size;
  return (
    <g transform={`translate(${cx - s}, ${cy - s})`}>
      {/* Base wall */}
      <rect x={s * 0.15} y={s * 0.5} width={s * 1.7} height={s}
        fill={color} opacity="0.9" rx="1" />
      {/* Left tower */}
      <rect x="0" y={s * 0.2} width={s * 0.6} height={s * 1.3}
        fill={color} opacity="0.85" rx="1" />
      {/* Right tower */}
      <rect x={s * 1.4} y={s * 0.2} width={s * 0.6} height={s * 1.3}
        fill={color} opacity="0.85" rx="1" />
      {/* Battlements left */}
      <rect x="0" y="0" width={s * 0.25} height={s * 0.25} fill={color} opacity="0.8" />
      <rect x={s * 0.35} y="0" width={s * 0.25} height={s * 0.25} fill={color} opacity="0.8" />
      {/* Battlements right */}
      <rect x={s * 1.4} y="0" width={s * 0.25} height={s * 0.25} fill={color} opacity="0.8" />
      <rect x={s * 1.75} y="0" width={s * 0.25} height={s * 0.25} fill={color} opacity="0.8" />
      {/* Gate */}
      <path d={`M ${s * 0.7},${s * 1.5} L ${s * 0.7},${s} Q ${s},${s * 0.75} ${s * 1.3},${s} L ${s * 1.3},${s * 1.5}`}
        fill="rgba(5,3,1,0.8)" />
    </g>
  );
}

// Approximate text width for label box sizing
function getTextWidth(text) {
  return Math.max(text.length * 6.5, 30);
}

// Convert hex color to rgb string for rgba()
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '45,154,95';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
