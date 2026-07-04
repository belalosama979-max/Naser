/**
 * Leaderboard.jsx
 * Professional ranking panel showing all students sorted by points.
 * Features: Top-3 special design, progress bars, path badges, rank change indicators.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { getPathColor } from '../../utils/pathsData';

// ─── Rank Medal Colors ─────────────────────────────────────────
const RANK_STYLES = {
  1: {
    bg: 'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.06))',
    border: 'rgba(212,175,55,0.55)',
    medal: '🥇',
    medalColor: '#d4af37',
    label: 'المركز الأول',
  },
  2: {
    bg: 'linear-gradient(135deg, rgba(180,185,200,0.2), rgba(160,165,180,0.05))',
    border: 'rgba(180,185,200,0.45)',
    medal: '🥈',
    medalColor: '#b0b8c8',
    label: 'المركز الثاني',
  },
  3: {
    bg: 'linear-gradient(135deg, rgba(185,130,60,0.2), rgba(160,110,40,0.05))',
    border: 'rgba(185,130,60,0.45)',
    medal: '🥉',
    medalColor: '#c07840',
    label: 'المركز الثالث',
  },
};

// ─── Main Leaderboard Component ────────────────────────────────
export default function Leaderboard() {
  const { seasons, activeSeasonId, settings } = useGameStore();
  const season = seasons[activeSeasonId];
  const students = season?.students || [];

  // Sort by rank (ascending = best first)
  const sorted = useMemo(
    () => [...students].sort((a, b) => a.currentRank - b.currentRank),
    [students]
  );

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: '100%',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(18px)',
        borderLeft: '1px solid var(--border-gold-alpha)',
      }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid var(--border-gold-alpha)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontSize: '18px' }}>🏆</span>
          <h2
            style={{
              fontFamily: 'Reem Kufi, serif',
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--text-gold)',
              textShadow: '0 0 12px rgba(212,175,55,0.2)',
            }}
          >
            لوحة الترتيب
          </h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'Cairo, sans-serif' }}>
            {students.length} طالب مسجّل
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'Cairo, sans-serif' }}>
            هدف: {settings.targetPoints.toLocaleString('ar')} نقطة
          </span>
        </div>
      </div>

      {/* Students List */}
      <div
        className="flex-1 overflow-y-auto custom-scroll px-3 py-2"
        style={{ gap: '6px', display: 'flex', flexDirection: 'column' }}
      >
        {students.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            {sorted.map((student, idx) => (
              <motion.div
                key={student.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35, delay: idx * 0.03 }}
              >
                <LeaderboardCard
                  student={student}
                  rank={student.currentRank}
                  targetPoints={settings.targetPoints}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer stats */}
      {students.length > 0 && (
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{ borderTop: '1px solid var(--border-gold-alpha)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-gold)', fontFamily: 'Cairo, sans-serif' }}>
                {students.filter(s => s.hasJerusalemBadge).length}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'Cairo, sans-serif' }}>فتح القدس</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#52d68a', fontFamily: 'Cairo, sans-serif' }}>
                {students.filter(s => s.pathId === 'path1').length}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'Cairo, sans-serif' }}>المسار العراقي</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#60b4f5', fontFamily: 'Cairo, sans-serif' }}>
                {students.filter(s => s.pathId === 'path2').length}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'Cairo, sans-serif' }}>المسار الشامي</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── Individual Card ────────────────────────────────────────────
function LeaderboardCard({ student, rank, targetPoints }) {
  const rankStyle = RANK_STYLES[rank] || {};
  const pathColor = getPathColor(student.pathId);
  const isTop3 = rank <= 3;
  const rankChange = student.previousRank - student.currentRank;

  return (
    <div
      style={{
        background: isTop3
          ? rankStyle.bg
          : 'var(--bg-secondary)',
        border: `1px solid ${isTop3 ? rankStyle.border : 'var(--border-color)'}`,
        borderRadius: '10px',
        padding: isTop3 ? '10px 10px' : '7px 10px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
      className="group hover:brightness-110"
    >
      {/* Top 3 left accent */}
      {isTop3 && (
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '3px',
          background: `linear-gradient(to bottom, ${rankStyle.medalColor}, transparent)`,
          borderRadius: '0 10px 10px 0',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Rank number / medal */}
        <div
          style={{
            minWidth: '28px',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          {isTop3 ? (
            <span style={{ fontSize: '18px' }}>{rankStyle.medal}</span>
          ) : (
            <span style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '800',
              color: 'var(--text-muted)',
              fontFamily: 'Cairo, sans-serif',
            }}>
              #{rank}
            </span>
          )}
          {/* Rank change */}
          {rankChange !== 0 && (
            <span style={{
              display: 'block',
              fontSize: '8px',
              color: rankChange > 0 ? '#52d68a' : '#e05050',
              fontFamily: 'Cairo, sans-serif',
            }}>
              {rankChange > 0 ? `↑${rankChange}` : `↓${Math.abs(rankChange)}`}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div style={{
          width: isTop3 ? '38px' : '32px',
          height: isTop3 ? '38px' : '32px',
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          border: student.hasJerusalemBadge
            ? '2px solid #d4af37'
            : `2px solid ${pathColor.primary}`,
          boxShadow: student.hasJerusalemBadge
            ? '0 0 8px rgba(212,175,55,0.5)'
            : `0 0 6px ${pathColor.primary}40`,
          background: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {student.avatar ? (
            <img
              src={student.avatar}
              alt={student.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{
              fontSize: isTop3 ? '14px' : '12px',
              fontWeight: '700',
              color: pathColor.bright,
              fontFamily: 'Cairo, sans-serif',
            }}>
              {student.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{
              fontSize: isTop3 ? '13px' : '12px',
              fontWeight: '700',
              color: isTop3 ? 'var(--text-gold)' : 'var(--text-primary)',
              fontFamily: 'Cairo, sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '90px',
            }}>
              {student.name}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              color: pathColor.bright,
              fontFamily: 'Cairo, sans-serif',
              flexShrink: 0,
            }}>
              {student.points.toLocaleString('ar')}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{
            marginTop: '5px',
            height: '5px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid rgba(212,175,55,0.1)',
          }}>
            <motion.div
              style={{
                height: '100%',
                background: student.pathId === 'path1'
                  ? 'linear-gradient(90deg, #1a5c38, #2d9a5f, #52d68a)'
                  : 'linear-gradient(90deg, #1a4a78, #2a7fc4, #60b4f5)',
                borderRadius: '3px',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${student.progress}%` }}
              transition={{ duration: 1.2, ease: [0.34, 1.1, 0.64, 1] }}
            />
          </div>

          {/* Progress % + Path badge */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '3px',
          }}>
            <span style={{
              fontSize: '9px',
              color: 'var(--text-secondary)',
              fontFamily: 'Cairo, sans-serif',
            }}>
              {student.progress.toFixed(2)}%
            </span>
            <span style={{
              fontSize: '8px',
              color: pathColor.bright,
              background: `${pathColor.primary}25`,
              border: `1px solid ${pathColor.primary}40`,
              borderRadius: '8px',
              padding: '1px 5px',
              fontFamily: 'Cairo, sans-serif',
            }}>
              {pathColor.label}
            </span>
          </div>
        </div>
      </div>

      {/* Jerusalem badge */}
      {student.hasJerusalemBadge && (
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          background: 'linear-gradient(135deg, #d4af37, #f5d060)',
          borderRadius: '50%',
          width: '16px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          boxShadow: '0 0 6px rgba(212,175,55,0.5)',
        }}>
          ★
        </div>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '12px',
      opacity: 0.5,
    }}>
      <span style={{ fontSize: '40px' }}>⚔️</span>
      <p style={{
        fontFamily: 'Reem Kufi, serif',
        fontSize: '14px',
        color: '#6a5a40',
        textAlign: 'center',
      }}>
        لا يوجد طلاب بعد
      </p>
      <p style={{
        fontFamily: 'Cairo, sans-serif',
        fontSize: '11px',
        color: '#4a3a20',
        textAlign: 'center',
      }}>
        أضف الطلاب من لوحة التحكم
      </p>
    </div>
  );
}
