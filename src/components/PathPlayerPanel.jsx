/**
 * PathPlayerPanel.jsx
 * Displays students of one path (Iraqi or Levantine) in a vertical panel.
 * Features: avatar, name, points, progress bar, rank, Jerusalem badge.
 * Used inside Game Mode as side panels.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getPathColor } from '../utils/pathsData';

export default function PathPlayerPanel({ pathId, visible = true, onToggle }) {
  const { seasons, activeSeasonId, settings } = useGameStore();
  const season = seasons[activeSeasonId];
  const allStudents = season?.students || [];
  const pathColor = getPathColor(pathId);
  const isIraqi = pathId === 'path1';

  const students = useMemo(
    () =>
      allStudents
        .filter(s => s.pathId === pathId)
        .sort((a, b) => a.currentRank - b.currentRank),
    [allStudents, pathId]
  );

  const panelStyle = {
    width: visible ? '220px' : '36px',
    minWidth: visible ? '220px' : '36px',
    height: '100%',
    background: 'rgba(8,5,2,0.88)',
    backdropFilter: 'blur(16px)',
    borderRight: isIraqi ? `1px solid ${pathColor.primary}30` : 'none',
    borderLeft: !isIraqi ? `1px solid ${pathColor.primary}30` : 'none',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), min-width 0.35s cubic-bezier(0.4,0,0.2,1)',
    overflow: 'hidden',
    flexShrink: 0,
    zIndex: 15,
  };

  return (
    <div style={panelStyle}>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        title={visible ? 'إخفاء اللوحة' : 'إظهار اللوحة'}
        style={{
          position: 'absolute',
          top: '50%',
          [isIraqi ? 'left' : 'right']: visible ? '-14px' : '-2px',
          transform: 'translateY(-50%)',
          width: '28px',
          height: '48px',
          background: `linear-gradient(135deg, ${pathColor.deep}, ${pathColor.primary})`,
          border: `1px solid ${pathColor.primary}60`,
          borderRadius: isIraqi ? '0 8px 8px 0' : '8px 0 0 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#fff',
          zIndex: 20,
          boxShadow: `0 0 12px ${pathColor.primary}40`,
        }}
      >
        {visible ? (isIraqi ? '◀' : '▶') : (isIraqi ? '▶' : '◀')}
      </button>

      {visible && (
        <>
          {/* Header */}
          <div style={{
            padding: '12px 12px 8px',
            borderBottom: `1px solid ${pathColor.primary}25`,
            background: `linear-gradient(135deg, ${pathColor.deep}60, transparent)`,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '16px' }}>{isIraqi ? '🏰' : '⛵'}</span>
              <h3 style={{
                fontFamily: 'Reem Kufi, serif',
                fontSize: '13px',
                fontWeight: '700',
                color: pathColor.bright,
                textShadow: `0 0 8px ${pathColor.primary}60`,
              }}>
                {isIraqi ? 'المسار العراقي' : 'المسار الشامي'}
              </h3>
            </div>
            <p style={{
              fontFamily: 'Cairo, sans-serif',
              fontSize: '9px',
              color: '#5a4a30',
              marginTop: '2px',
            }}>
              {isIraqi ? 'من البصرة إلى القدس' : 'من صور إلى القدس'}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '6px',
            }}>
              <span style={{ fontSize: '10px', color: pathColor.primary, fontFamily: 'Cairo, sans-serif' }}>
                {students.length} فارس
              </span>
              <span style={{ fontSize: '10px', color: '#d4af37', fontFamily: 'Cairo, sans-serif' }}>
                {students.filter(s => s.hasJerusalemBadge).length} فتحوا القدس
              </span>
            </div>
          </div>

          {/* Students list */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <AnimatePresence mode="popLayout">
              {students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', opacity: 0.4 }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚔️</div>
                  <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '10px', color: '#5a4a30' }}>
                    لا يوجد فرسان
                  </p>
                </div>
              ) : (
                students.map((student, idx) => (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, x: isIraqi ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                  >
                    <PlayerCard
                      student={student}
                      pathColor={pathColor}
                      targetPoints={settings.targetPoints}
                      rank={idx + 1}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Player Card ──────────────────────────────────────────────
function PlayerCard({ student, pathColor, targetPoints, rank }) {
  const rankColors = ['#d4af37', '#b0b8c8', '#c07840'];
  const rankColor = rankColors[rank - 1] || '#5a4a30';
  const rankChange = student.previousRank - student.currentRank;

  return (
    <div style={{
      background: rank <= 3
        ? `linear-gradient(135deg, ${pathColor.deep}40, rgba(0,0,0,0.3))`
        : 'rgba(15,10,4,0.6)',
      border: `1px solid ${rank <= 3 ? pathColor.primary + '50' : 'rgba(212,175,55,0.08)'}`,
      borderRadius: '8px',
      padding: '7px 8px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Rank glow for top 3 */}
      {rank <= 3 && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '3px', bottom: 0,
          background: `linear-gradient(to bottom, ${rankColor}, transparent)`,
          borderRadius: '0 8px 8px 0',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        {/* Rank */}
        <div style={{
          minWidth: '22px',
          textAlign: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            display: 'block',
            fontSize: rank <= 3 ? '14px' : '10px',
            color: rank <= 3 ? rankColor : '#5a4a30',
            fontFamily: 'Cairo, sans-serif',
            fontWeight: '800',
            lineHeight: 1,
          }}>
            {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`}
          </span>
          {rankChange !== 0 && (
            <span style={{
              fontSize: '7px',
              color: rankChange > 0 ? '#52d68a' : '#e05050',
              display: 'block',
            }}>
              {rankChange > 0 ? `↑${rankChange}` : `↓${Math.abs(rankChange)}`}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div style={{
          width: '30px', height: '30px',
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          border: student.hasJerusalemBadge
            ? '2px solid #d4af37'
            : `2px solid ${pathColor.primary}`,
          boxShadow: student.hasJerusalemBadge
            ? '0 0 6px rgba(212,175,55,0.5)'
            : `0 0 4px ${pathColor.primary}40`,
          background: 'rgba(10,8,2,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {student.avatar ? (
            <img src={student.avatar} alt={student.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{
              fontSize: '12px', fontWeight: '700',
              color: pathColor.bright,
              fontFamily: 'Cairo, sans-serif',
            }}>
              {student.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '11px', fontWeight: '700',
              color: rank <= 3 ? '#f0d060' : '#c8b890',
              fontFamily: 'Cairo, sans-serif',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '80px',
            }}>
              {student.name.split(' ')[0]}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: '800',
              color: pathColor.bright,
              fontFamily: 'Cairo, sans-serif',
            }}>
              {student.points.toLocaleString('ar')}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{
            marginTop: '4px', height: '4px',
            background: 'rgba(0,0,0,0.5)', borderRadius: '2px',
            overflow: 'hidden',
            border: '1px solid rgba(212,175,55,0.08)',
          }}>
            <motion.div
              style={{
                height: '100%',
                background: pathColor.primary === '#2d9a5f'
                  ? 'linear-gradient(90deg, #1a5c38, #52d68a)'
                  : 'linear-gradient(90deg, #1a4a78, #60b4f5)',
                borderRadius: '2px',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${student.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <span style={{
            fontSize: '8px', color: '#5a4a30',
            fontFamily: 'Cairo, sans-serif',
            marginTop: '2px', display: 'block',
          }}>
            {student.progress.toFixed(1)}%
            {student.hasJerusalemBadge && ' ✦ فاتح القدس'}
          </span>
        </div>
      </div>
    </div>
  );
}
