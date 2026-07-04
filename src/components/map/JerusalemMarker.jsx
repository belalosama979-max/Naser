/**
 * JerusalemMarker.jsx
 * The centrepiece of the map — Jerusalem with a grand Dome of the Rock.
 * Enlarged, animated, with golden radiance, pulsing glow, and animated rings.
 * Designed to be the visual focal point of the entire map.
 */

import React from 'react';
import { useGameStore } from '../../store/gameStore';

export default function JerusalemMarker({ x, y }) {
  const { settings } = useGameStore();
  const requiredPoints = settings?.nodePoints?.dest ?? 1000;

  return (
    <g id="jerusalem-marker" style={{ cursor: 'default' }}>
      {/* ── Animated radiance rings ── */}
      {[160, 130, 105, 82].map((r, i) => (
        <circle key={i} cx={x} cy={y} r={r}
          fill="none"
          stroke="#d4af37"
          strokeWidth={i === 0 ? 0.4 : i === 1 ? 0.6 : i === 2 ? 0.8 : 1}
          opacity={[0.05, 0.08, 0.12, 0.16][i]}
        />
      ))}

      {/* Radiance fill glow */}
      <circle cx={x} cy={y} r="140"
        fill="url(#jerusalem-outer-radiance)"
        opacity="0.5"
      />
      <circle cx={x} cy={y} r="85"
        fill="url(#jerusalem-inner-radiance)"
        opacity="0.7"
      />

      {/* Ground / Temple Mount platform */}
      <ellipse cx={x} cy={y + 10} rx="72" ry="22"
        fill="#1a1005" stroke="#d4af37" strokeWidth="1.2" opacity="0.9" />

      {/* Platform decorative stones */}
      {[-50, -30, -10, 10, 30, 50].map((offset, i) => (
        <rect key={i}
          x={x + offset - 8} y={y + 2}
          width="16" height="6"
          fill="#231806" stroke="#c49a1a" strokeWidth="0.4" opacity="0.7"
        />
      ))}

      {/* City walls */}
      <rect x={x - 65} y={y - 5} width="130" height="18"
        rx="2" fill="#1a1005" stroke="#d4af37" strokeWidth="1.3" />

      {/* Battlements */}
      {[-56, -44, -32, -20, -8, 4, 16, 28, 40, 52].map((offset, i) => (
        <rect key={i}
          x={x + offset} y={y - 12}
          width="9" height="9"
          fill="#1a1005" stroke="#d4af37" strokeWidth="0.7"
        />
      ))}

      {/* Side towers */}
      <rect x={x - 72} y={y - 18} width="12" height="26"
        rx="1" fill="#1c1207" stroke="#d4af37" strokeWidth="0.8" />
      <polygon points={`${x - 72},${y - 18} ${x - 66},${y - 28} ${x - 60},${y - 18}`}
        fill="#d4af37" opacity="0.7" />
      <rect x={x + 60} y={y - 18} width="12" height="26"
        rx="1" fill="#1c1207" stroke="#d4af37" strokeWidth="0.8" />
      <polygon points={`${x + 60},${y - 18} ${x + 66},${y - 28} ${x + 72},${y - 18}`}
        fill="#d4af37" opacity="0.7" />

      {/* Grand Dome of the Rock */}
      <GrandDome cx={x} cy={y - 14} scale={1.8} />

      {/* Jerusalem label box */}
      <rect x={x - 58} y={y + 25} width="116" height="26"
        rx="6" fill="rgba(8,5,1,0.97)" stroke="#d4af37" strokeWidth="1.5" />
      <text x={x} y={y + 41}
        textAnchor="middle"
        fontSize="17"
        fontFamily="Reem Kufi, serif"
        fill="#d4af37"
        fontWeight="800"
        style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.8))' }}
      >
        القدس
      </text>

      {/* Points required label */}
      <rect x={x - 42} y={y + 54} width="84" height="16"
        rx="8"
        fill="rgba(212,175,55,0.1)"
        stroke="rgba(212,175,55,0.3)"
        strokeWidth="0.6"
      />
      <text x={x} y={y + 64}
        textAnchor="middle"
        fontSize="8.5"
        fontFamily="Cairo, sans-serif"
        fill="#d4af37"
        opacity="0.8"
        fontWeight="600"
      >
        {requiredPoints} نقطة للفتح
      </text>

      {/* Sub-label */}
      <text x={x} y={y + 78}
        textAnchor="middle"
        fontSize="7"
        fontFamily="Cairo, sans-serif"
        fill="rgba(212,175,55,0.4)"
      >
        نقطة التقاء المسارَين وهدف الفتح العظيم
      </text>

      {/* Decorative stars */}
      {[
        [x - 80, y - 25], [x + 80, y - 25],
        [x - 88, y + 10], [x + 88, y + 10],
        [x - 70, y + 35], [x + 70, y + 35],
      ].map(([sx, sy], i) => (
        <text key={i} x={sx} y={sy}
          textAnchor="middle"
          fontSize={i < 2 ? '10' : '7'}
          fill="#d4af37"
          opacity={i < 2 ? '0.6' : '0.35'}
          fontFamily="serif"
        >✦</text>
      ))}

      {/* Gradient defs embedded */}
      <defs>
        <radialGradient id="jerusalem-outer-radiance" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.15" />
          <stop offset="60%" stopColor="#d4af37" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="jerusalem-inner-radiance" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5d060" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  );
}

// ─── Grand Dome of the Rock ────────────────────────────────────
function GrandDome({ cx, cy, scale = 1 }) {
  const s = scale;
  const tx = cx - 22 * s;
  const ty = cy - 30 * s;

  return (
    <g transform={`translate(${tx}, ${ty}) scale(${s})`}>
      <defs>
        <radialGradient id="dome-gold-grand" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fff8a0" />
          <stop offset="30%" stopColor="#f5d060" />
          <stop offset="65%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#7a5800" />
        </radialGradient>
        <radialGradient id="dome-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(212,175,55,0.5)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </radialGradient>
        <filter id="dome-shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.7)" />
        </filter>
        <filter id="dome-glow-filter" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Base platform */}
      <rect x="4" y="46" width="36" height="7" rx="1"
        fill="#3a2a00" stroke="#d4af37" strokeWidth="0.8" />

      {/* Stairs */}
      <rect x="2" y="50" width="40" height="4" rx="1"
        fill="#2a1e06" stroke="#c49a1a" strokeWidth="0.4" opacity="0.8" />

      {/* Left minaret */}
      <rect x="1" y="26" width="6" height="22" fill="#2a1e08" stroke="#c49a1a" strokeWidth="0.5" />
      <polygon points="1,26 4,16 7,26" fill="#d4af37" />
      <circle cx="4" cy="15" r="2" fill="#d4af37" opacity="0.9" />
      <line x1="4" y1="13" x2="4" y2="10" stroke="#d4af37" strokeWidth="0.8" />
      <circle cx="4" cy="9.5" r="1" fill="#d4af37" />

      {/* Right minaret */}
      <rect x="37" y="26" width="6" height="22" fill="#2a1e08" stroke="#c49a1a" strokeWidth="0.5" />
      <polygon points="37,26 40,16 43,26" fill="#d4af37" />
      <circle cx="40" cy="15" r="2" fill="#d4af37" opacity="0.9" />
      <line x1="40" y1="13" x2="40" y2="10" stroke="#d4af37" strokeWidth="0.8" />
      <circle cx="40" cy="9.5" r="1" fill="#d4af37" />

      {/* Main building */}
      <rect x="7" y="30" width="30" height="18" rx="1"
        fill="#2a1e08" stroke="#d4af37" strokeWidth="0.8" filter="url(#dome-shadow)" />

      {/* Arched windows */}
      {[10, 18, 26].map(wx => (
        <path key={wx}
          d={`M ${wx},48 L ${wx},38 Q ${wx + 2},34 ${wx + 4},38 L ${wx + 4},48`}
          fill="rgba(40,80,50,0.5)" stroke="#c49a1a" strokeWidth="0.3"
        />
      ))}

      {/* Decorative horizontal band */}
      <rect x="7" y="34" width="30" height="2"
        fill="none" stroke="#c49a1a" strokeWidth="0.4" opacity="0.6" />

      {/* Drum */}
      <rect x="11" y="20" width="22" height="12" rx="1"
        fill="#2e2208" stroke="#c49a1a" strokeWidth="0.8" />

      {/* Drum windows */}
      {[13, 19, 25].map(dw => (
        <rect key={dw} x={dw} y="22" width="4" height="6"
          rx="2" fill="rgba(40,70,45,0.4)" stroke="#b8860b" strokeWidth="0.3" />
      ))}

      {/* THE DOME — grand golden */}
      <ellipse cx="22" cy="20" rx="17" ry="12"
        fill="url(#dome-gold-grand)"
        stroke="#d4af37" strokeWidth="1"
        filter="url(#dome-glow-filter)"
        opacity="0.97"
      />

      {/* Dome highlight */}
      <ellipse cx="17" cy="15" rx="8" ry="4.5"
        fill="rgba(255,245,160,0.3)" />

      {/* Dome secondary highlight */}
      <ellipse cx="19" cy="13" rx="5" ry="2.5"
        fill="rgba(255,255,200,0.15)" />

      {/* Dome glow orb */}
      <ellipse cx="22" cy="20" rx="20" ry="15"
        fill="url(#dome-glow)" opacity="0.4" />

      {/* Spire */}
      <line x1="22" y1="8" x2="22" y2="2"
        stroke="#d4af37" strokeWidth="1.5" />
      <polygon points="18.5,8 22,2 25.5,8" fill="#d4af37" />

      {/* Crescent */}
      <path d="M 20,2.5 Q 22,-0.5 24,2.5 Q 22,1.2 20,2.5"
        fill="#d4af37" opacity="0.95" />
      <circle cx="22" cy="1" r="0.8" fill="#f5d060" />
    </g>
  );
}
