/**
 * GameView.jsx — Game Mode Interface
 * Full-screen historical game interface inspired by Civilization/Age of Empires.
 * Features:
 *   - Game Mode (Fullscreen) button
 *   - Separate left/right panels per path (collapsible)
 *   - Progress tracking panel (right)
 *   - Historical warrior image (bottom left)
 *   - Compass & minimap (bottom center)
 *   - Jerusalem confetti on achievement
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';
import MapCanvas from '../components/map/MapCanvas';
import Leaderboard from '../components/leaderboard/Leaderboard';
import PathPlayerPanel from '../components/PathPlayerPanel';
import ProgressPanel from '../components/ProgressPanel';
import GamePointsPanel from '../components/GamePointsPanel';

export default function GameView() {
  const navigate = useNavigate();
  const { seasons, activeSeasonId, settings } = useGameStore();
  const season = seasons[activeSeasonId];
  const students = season?.students || [];
  const prevStudentsRef = useRef(students);

  const theme = settings.theme || 'dark';
  const toggleTheme = useGameStore(state => state.toggleTheme);

  // ── Game Mode State ───────────────────────────────────────────
  const [isGameMode, setIsGameMode] = useState(false);
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [showPointsPanel, setShowPointsPanel] = useState(false);
  const [showIraqiPanel, setShowIraqiPanel] = useState(false);
  const [showLevantinePanel, setShowLevantinePanel] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const gameContainerRef = useRef(null);

  // ── Detect mobile ──────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Set initial panel states based on screen size ─────────────
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setShowIraqiPanel(!mobile);
    setShowLevantinePanel(!mobile);
    setShowLeaderboard(!mobile);
    setShowProgressPanel(!mobile);
  }, []);

  // ── Fullscreen & Orientation toggle ────────────────────────────
  const enterGameMode = useCallback(async () => {
    // Add class to lock html overflow
    document.documentElement.classList.add('game-active');
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      // Try to force landscape orientation on mobile
      if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
        await window.screen.orientation.lock('landscape').catch(e => {
          console.warn("Orientation lock failed:", e);
        });
      }
    } catch (e) {
      // Fullscreen may be blocked — still enter game mode UI
    }
    setIsGameMode(true);
  }, []);

  const exitGameMode = useCallback(async () => {
    document.documentElement.classList.remove('game-active');
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
      // Unlock orientation
      if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    } catch (e) { /* ignore */ }
    setIsGameMode(false);
  }, []);

  // Exit game mode on ESC / fullscreen change
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        document.documentElement.classList.remove('game-active');
        setIsGameMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.documentElement.classList.remove('game-active');
    };
  }, []);

  // ── Jerusalem Achievement Confetti ──────────────────────────
  useEffect(() => {
    const prev = prevStudentsRef.current;
    const newlyAchieved = students.filter(
      s => s.hasJerusalemBadge && !prev.find(ps => ps.id === s.id)?.hasJerusalemBadge
    );
    if (newlyAchieved.length > 0) {
      const end = Date.now() + 4000;
      const colors = ['#d4af37', '#f5d060', '#ffffff', '#00aa55', '#1e6fa5'];
      const fire = () => {
        confetti({ particleCount: 8, angle: 60, spread: 60, origin: { x: 0 }, colors });
        confetti({ particleCount: 8, angle: 120, spread: 60, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(fire);
      };
      fire();
    }
    prevStudentsRef.current = students;
  }, [students]);

  // ── Game Mode Layout ──────────────────────────────────────────
  if (isGameMode) {
    return (
      <div
        ref={gameContainerRef}
        className="game-mode-container"
        style={{
          background: '#0a0602',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Cairo, sans-serif',
          direction: 'rtl',
        }}
      >
        {/* ── Game Mode Top Bar ────────────────────────── */}
        <div 
          className="game-topbar flex items-center justify-between px-2 md:px-4 flex-shrink-0 z-30 gap-1 flex-wrap"
          style={{
            minHeight: isMobile ? '40px' : '48px',
            background: 'linear-gradient(180deg, rgba(6,4,1,0.98) 0%, rgba(10,7,2,0.92) 100%)',
            borderBottom: '1px solid rgba(212,175,55,0.18)',
            boxShadow: '0 2px 20px rgba(0,0,0,0.8)',
          }}
        >
          {/* Left: Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontSize: isMobile ? '14px' : '18px' }}>🕌</span>
            <div>
              <div className="title-text" style={{ fontFamily: 'Reem Kufi, serif', fontSize: isMobile ? '11px' : '14px', color: '#d4af37', fontWeight: '700', lineHeight: 1.2 }}>
                فتوحات صلاح الدين
              </div>
              {!isMobile && (
                <div className="sub-text" style={{ fontSize: '9px', color: '#5a4a30' }}>
                  {settings.gameName} • {settings.academicYear}
                </div>
              )}
            </div>
          </div>

          {/* Center: Quick Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? '3px' : '6px', alignItems: 'center', flex: 1, minWidth: 0, padding: '0 4px' }}>
            <ToggleBtn active={showIraqiPanel}     onClick={() => setShowIraqiPanel(p => !p)}     label={isMobile ? 'عراقي' : 'المسار العراقي'}   color="#2d9a5f" small={isMobile} />
            <ToggleBtn active={showLevantinePanel}  onClick={() => setShowLevantinePanel(p => !p)}  label={isMobile ? 'شامي'  : 'المسار الشامي'}    color="#2a7fc4" small={isMobile} />
            <ToggleBtn active={showProgressPanel}   onClick={() => setShowProgressPanel(p => !p)}   label={isMobile ? 'تقدم'  : 'متابعة التقدم'}    color="#d4af37" small={isMobile} />
            <ToggleBtn active={showPointsPanel}     onClick={() => setShowPointsPanel(p => !p)}     label={isMobile ? 'نقاط'  : 'التقييم'}          color="#f59e0b" small={isMobile} />
            <ToggleBtn active={showLeaderboard}     onClick={() => setShowLeaderboard(p => !p)}     label={isMobile ? 'طلاب'  : 'الطلاب'}           color="#8b5cf6" small={isMobile} />
          </div>

          {/* Right: Exit Game Mode */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            {!isMobile && (
              <div style={{
                padding: '3px 10px',
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '16px',
                fontSize: '11px',
                color: '#d4af37',
                fontFamily: 'Amiri, serif',
              }}>583 هـ</div>
            )}
            <button
              onClick={exitGameMode}
              style={{
                padding: isMobile ? '4px 8px' : '5px 12px',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: isMobile ? '10px' : '11px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
              }}
            >
              ✕ {!isMobile && 'خروج'}
            </button>
          </div>
        </div>

        {/* ── Main Game Area ─────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* Iraqi Path Panel — overlay on mobile, inline on desktop */}
          <AnimatePresence>
            {showIraqiPanel && (
              <motion.div
                key="iraqi"
                initial={{ x: isMobile ? '100%' : 0, width: isMobile ? 'auto' : 0, opacity: 0 }}
                animate={{ x: 0, width: isMobile ? 'min(260px, 85vw)' : 220, opacity: 1 }}
                exit={{ x: isMobile ? '100%' : 0, width: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
                style={{
                  overflow: 'hidden',
                  flexShrink: 0,
                  ...(isMobile ? {
                    position: 'absolute', right: 0, top: 0, bottom: 0,
                    zIndex: 60,
                    background: 'rgba(6,4,1,0.97)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '85vw',
                  } : {})
                }}
              >
                <PathPlayerPanel pathId="path1" visible={true} onToggle={() => setShowIraqiPanel(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map Center */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
            <MapCanvas />
            <div className="compass-panel" style={{ position: 'absolute', bottom: isMobile ? '8px' : '12px', right: '50%', transform: 'translateX(50%)', zIndex: 10, pointerEvents: 'none' }}>
              <CompassPanel small={isMobile} />
            </div>

            {/* Stats bar — bottom */}
            <div style={{
              position: 'absolute',
              bottom: isMobile ? '8px' : '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: isMobile ? '6px' : '12px',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 10,
            }}>
              <StatBadge icon="⚔️" label="طلاب" value={students.length} small={isMobile} />
              <StatBadge icon="🕌" label="القدس" value={students.filter(s => s.hasJerusalemBadge).length} color="#d4af37" small={isMobile} />
              {!isMobile && <StatBadge icon="🏆" label="الهدف" value={`${settings.targetPoints} نقطة`} color="#60b4f5" />}
            </div>
          </div>

          {/* Leaderboard — overlay on mobile */}
          <AnimatePresence>
            {showLeaderboard && (
              <motion.div
                key="leaderboard"
                initial={{ x: isMobile ? '-100%' : 0, width: isMobile ? 'auto' : 0, opacity: 0 }}
                animate={{ x: 0, width: isMobile ? 'min(280px, 85vw)' : 260, opacity: 1 }}
                exit={{ x: isMobile ? '-100%' : 0, width: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
                style={{
                  overflow: 'hidden',
                  flexShrink: 0,
                  ...(isMobile ? {
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    zIndex: 60,
                    background: 'rgba(6,4,1,0.97)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '85vw',
                  } : {})
                }}
              >
                <Leaderboard />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Levantine Path Panel — overlay on mobile */}
          <AnimatePresence>
            {showLevantinePanel && (
              <motion.div
                key="levantine"
                initial={{ x: isMobile ? '-100%' : 0, width: isMobile ? 'auto' : 0, opacity: 0 }}
                animate={{ x: 0, width: isMobile ? 'min(260px, 85vw)' : 220, opacity: 1 }}
                exit={{ x: isMobile ? '-100%' : 0, width: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
                style={{
                  overflow: 'hidden',
                  flexShrink: 0,
                  ...(isMobile ? {
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    zIndex: 60,
                    background: 'rgba(6,4,1,0.97)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '85vw',
                  } : {})
                }}
              >
                <PathPlayerPanel pathId="path2" visible={true} onToggle={() => setShowLevantinePanel(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Panel — overlay on mobile */}
          <AnimatePresence>
            {showProgressPanel && (
              <motion.div
                key="progress"
                initial={{ x: isMobile ? '-100%' : 0, width: isMobile ? 'auto' : 0, opacity: 0 }}
                animate={{ x: 0, width: isMobile ? 'min(280px, 90vw)' : 260, opacity: 1 }}
                exit={{ x: isMobile ? '-100%' : 0, width: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
                style={{
                  overflow: 'hidden',
                  flexShrink: 0,
                  ...(isMobile ? {
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    zIndex: 65,
                    background: 'rgba(6,4,1,0.97)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '90vw',
                  } : {})
                }}
              >
                <ProgressPanel />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Points Panel Overlay */}
          <AnimatePresence>
            {showPointsPanel && (
              <motion.div
                key="points"
                initial={{ x: isMobile ? '100%' : 0, width: isMobile ? 'auto' : 0, opacity: 0 }}
                animate={{ x: 0, width: isMobile ? 'min(320px, 95vw)' : 320, opacity: 1 }}
                exit={{ x: isMobile ? '100%' : 0, width: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
                style={{
                  overflow: 'hidden',
                  flexShrink: 0,
                  position: 'absolute', right: 0, top: 0, bottom: 0,
                  zIndex: 100,
                  ...(isMobile ? { maxWidth: '95vw', background: 'rgba(6,4,1,0.97)', backdropFilter: 'blur(10px)' } : {})
                }}
              >
                <GamePointsPanel onClose={() => setShowPointsPanel(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── Normal View Layout ────────────────────────────────────────
  return (
    <div
      className="w-screen h-screen overflow-hidden flex transition-colors duration-300"
      style={{ background: 'var(--bg-primary)', direction: 'rtl' }}
    >
      {/* ── Left Panel: Leaderboard (desktop only) ──────── */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="normal-view-leaderboard hidden md:block w-[280px] min-w-[280px] h-full flex-shrink-0"
      >
        <Leaderboard />
      </motion.div>

      {/* Mobile Leaderboard Overlay */}
      <AnimatePresence>
        {showMobileLeaderboard && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{
              position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 200,
              width: 'min(300px, 90vw)',
              background: 'rgba(6,4,1,0.97)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ padding: '10px', borderBottom: '1px solid rgba(212,175,55,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '13px' }}>⚔️ الطلاب</span>
              <button onClick={() => setShowMobileLeaderboard(false)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '16px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ height: 'calc(100% - 44px)', overflowY: 'auto' }}>
              <Leaderboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Overlay backdrop */}
      {showMobileLeaderboard && (
        <div onClick={() => setShowMobileLeaderboard(false)} style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.5)' }} />
      )}

      {/* ── Center: Map Canvas ──────────────────────────── */}
      <div className="flex-1 relative h-full flex flex-col" style={{ minWidth: 0 }}>
        {/* Top Header Bar */}
        <div 
          className="flex flex-row items-center justify-between px-2 md:px-5 z-30 flex-shrink-0 gap-1 md:gap-0"
          style={{
            minHeight: '48px',
            background: 'var(--header-bg)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border-gold-alpha)',
          }}
        >
          {/* Logo + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Mobile: show leaderboard toggle */}
            <button
              onClick={() => setShowMobileLeaderboard(p => !p)}
              className="md:hidden"
              style={{
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '8px',
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '14px',
              }}
            >⚔️</button>
            <span style={{ fontSize: '18px' }} className="hidden md:inline">🕌</span>
            <div>
              <h1 style={{
                fontFamily: 'Reem Kufi, serif',
                fontSize: 'clamp(11px, 2.5vw, 15px)',
                color: 'var(--text-gold)',
                fontWeight: '700',
                lineHeight: '1',
              }}>
                فتوحات صلاح الدين الأيوبي
              </h1>
              <p className="hidden md:block" style={{
                fontFamily: 'Cairo, sans-serif',
                fontSize: '10px',
                color: 'var(--text-secondary)',
                marginTop: '2px',
              }}>
                {settings.gameName} • {settings.academicYear}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'nowrap' }}>
            {/* Game Mode Button */}
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={enterGameMode}
              style={{
                padding: isMobile ? '6px 10px' : '7px 16px',
                background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                border: '1px solid rgba(212,175,55,0.5)',
                borderRadius: '10px',
                color: '#0a0602',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: '800',
                cursor: 'pointer',
                fontFamily: 'Reem Kufi, serif',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 0 12px rgba(212,175,55,0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              🎮 {isMobile ? 'اللعب' : 'وضع اللعب'}
            </motion.button>
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{ padding: '5px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
            >
              {theme === 'light' ? '🌙' : '💡'}
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="btn btn-gold hidden md:inline-flex"
              style={{ padding: '5px 10px', fontSize: '11px' }}
            >
              ⚙️ الإدارة
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary hidden md:inline-flex"
              style={{ padding: '5px 8px', fontSize: '11px' }}
            >
              🏠
            </button>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 relative" style={{ minHeight: 0 }}>
          <MapCanvas />
        </div>

        {/* Bottom footer bar */}
        <div 
          className="flex flex-row items-center justify-between px-2 md:px-5 z-30 flex-shrink-0"
          style={{
            minHeight: '36px',
            background: 'var(--footer-bg)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid var(--border-gold-alpha)',
          }}
        >
          <div className="flex gap-2 md:gap-5 items-center flex-wrap">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '18px', height: '3px', background: '#2d9a5f', borderRadius: '2px' }} />
              <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '9px', color: '#4a6a50' }}>عراقي</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '18px', height: '3px', background: '#2a7fc4', borderRadius: '2px' }} />
              <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '9px', color: '#3a5a6a' }}>شامي</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#d4af37' }} />
              <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '9px', color: '#6a5a30' }}>فاتح القدس</span>
            </div>
          </div>
          <p className="hidden md:block" style={{
            fontFamily: 'Amiri, serif', fontSize: '10px',
            color: 'var(--text-secondary)', fontStyle: 'italic',
          }}>
            «والله لنفتحنّ بيت المقدس أو أموتنّ دون ذلك»
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '9px', color: 'var(--text-secondary)' }}>⚔️ {students.length}</span>
            <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '9px', color: 'var(--text-secondary)' }}>🕌 {students.filter(s => s.hasJerusalemBadge).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Button Component ──────────────────────────────────
function ToggleBtn({ active, onClick, label, color, small = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: small ? '3px 6px' : '4px 10px',
        background: active ? `rgba(${hexToRgb(color)},0.15)` : 'rgba(10,7,2,0.5)',
        border: `1px solid ${active ? color + '50' : 'rgba(212,175,55,0.08)'}`,
        borderRadius: '6px',
        color: active ? color : '#3a2a10',
        fontSize: small ? '9px' : '10px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: 'Cairo, sans-serif',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: small ? '7px' : '8px' }}>{active ? '◉' : '○'}</span>
      {label}
    </button>
  );
}

// ─── Stat Badge ────────────────────────────────────────────────
function StatBadge({ icon, label, value, color = '#c8b890', small = false }) {
  return (
    <div style={{
      background: 'rgba(6,4,1,0.85)',
      border: '1px solid rgba(212,175,55,0.12)',
      borderRadius: '8px',
      padding: small ? '3px 7px' : '4px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      backdropFilter: 'blur(8px)',
    }}>
      <span style={{ fontSize: small ? '9px' : '11px' }}>{icon}</span>
      <div>
        <div style={{ fontSize: small ? '9px' : '11px', fontWeight: '700', color, fontFamily: 'Cairo, sans-serif' }}>
          {value}
        </div>
        <div style={{ fontSize: small ? '7px' : '8px', color: '#4a3a20', fontFamily: 'Cairo, sans-serif' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Compass Panel ─────────────────────────────────────────────
function CompassPanel({ small = false }) {
  const size = small ? 52 : 80;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" opacity="0.7">
      <defs>
        <radialGradient id="compass-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2a1e08" />
          <stop offset="100%" stopColor="#0f0a03" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#compass-bg)" stroke="#d4af37" strokeWidth="1.5" opacity="0.8" />
      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" />
      <text x="40" y="12" textAnchor="middle" fontSize="9" fontFamily="Reem Kufi, serif" fill="#d4af37" fontWeight="700">ش</text>
      <text x="40" y="73" textAnchor="middle" fontSize="9" fontFamily="Reem Kufi, serif" fill="#c8b890">ج</text>
      <text x="70" y="44" textAnchor="middle" fontSize="9" fontFamily="Reem Kufi, serif" fill="#c8b890">ش</text>
      <text x="10" y="44" textAnchor="middle" fontSize="9" fontFamily="Reem Kufi, serif" fill="#c8b890">غ</text>
      <polygon points="40,16 37,40 40,44 43,40" fill="#d4af37" opacity="0.9" />
      <polygon points="40,64 37,40 40,44 43,40" fill="#8b6914" opacity="0.7" />
      <circle cx="40" cy="40" r="4" fill="#d4af37" opacity="0.8" />
      <circle cx="40" cy="40" r="2" fill="#0a0602" />
    </svg>
  );
}

// Helper
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '212,175,55';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
