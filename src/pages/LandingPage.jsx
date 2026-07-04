/**
 * LandingPage.jsx — Epic Redesign
 * Full-immersive landing with parallax, animated stats, cinematic hero, path cards.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

// ─── Star Field ─────────────────────────────────────────────────
function StarField({ count = 160 }) {
  const stars = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.4,
      delay: Math.random() * 8,
      duration: Math.random() * 5 + 3,
      opacity: Math.random() * 0.7 + 0.2,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px` }}
          animate={{ opacity: [s.opacity * 0.3, s.opacity, s.opacity * 0.3] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Gold Particles ─────────────────────────────────────────────
function GoldParticles({ count = 30 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 10,
      duration: Math.random() * 12 + 8,
      opacity: Math.random() * 0.5 + 0.1,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `rgba(212,175,55,${p.opacity})`,
          }}
          animate={{ y: [0, -150, 0], opacity: [p.opacity, p.opacity * 2, 0], scale: [1, 1.3, 0.4] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Animated Counter ──────────────────────────────────────────
function AnimatedCounter({ value, duration = 1.5 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const end = start + duration * 1000;
    const tick = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / (duration * 1000), 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(value);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{display}</>;
}

// ─── Path Card ─────────────────────────────────────────────────
function PathCard({ pathNum, title, from, description, colorRgb, colorMain, icon, stats }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: hovered
          ? `linear-gradient(135deg, rgba(${colorRgb},0.2), rgba(${colorRgb},0.07))`
          : `linear-gradient(135deg, rgba(${colorRgb},0.12), rgba(${colorRgb},0.03))`,
        border: `1px solid rgba(${colorRgb},${hovered ? 0.6 : 0.3})`,
        borderRadius: '20px',
        padding: '28px',
        flex: 1,
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Top accent glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent, rgba(${colorRgb},0.9), transparent)`,
        opacity: hovered ? 1 : 0.5, transition: 'opacity 0.3s',
      }} />

      {/* Background glow blob */}
      <div style={{
        position: 'absolute', bottom: '-40px', right: '-40px',
        width: '160px', height: '160px', borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${colorRgb},0.15) 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0.4, transition: 'opacity 0.4s',
        pointerEvents: 'none',
      }} />

      <div style={{ fontSize: '40px', marginBottom: '14px' }}>{icon}</div>

      <div style={{ fontSize: '11px', fontFamily: 'Cairo, sans-serif', color: `rgba(${colorRgb},0.8)`, fontWeight: '700', letterSpacing: '2px', marginBottom: '6px' }}>
        المسار {pathNum}
      </div>
      <h3 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '20px', color: '#f0d060', marginBottom: '10px', fontWeight: '800' }}>
        {title}
      </h3>
      <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '12px', color: '#7a6a50', lineHeight: '1.8', marginBottom: '18px' }}>
        {description}
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
        background: `rgba(${colorRgb},0.1)`, borderRadius: '12px',
        border: `1px solid rgba(${colorRgb},0.25)`,
      }}>
        <span style={{ color: `rgba(${colorRgb},0.9)`, fontFamily: 'Reem Kufi, serif', fontSize: '14px', fontWeight: '800' }}>
          {from}
        </span>
        <span style={{ color: '#4a3a20', flex: 1, textAlign: 'center', fontSize: '18px' }}>···→···</span>
        <span style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '14px', fontWeight: '800' }}>
          القدس ✦
        </span>
      </div>

      {stats && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: colorMain, fontFamily: 'Reem Kufi, serif', fontSize: '18px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#4a3a20', fontSize: '9px', fontFamily: 'Cairo, sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { seasons, activeSeasonId, settings } = useGameStore();
  const season = seasons[activeSeasonId];
  const students = season?.students || [];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [0, 1], [4, -4]);
  const rotateY = useTransform(mouseX, [0, 1], [-4, 4]);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX / window.innerWidth);
    mouseY.set(e.clientY / window.innerHeight);
  };

  const topStudents = [...students].sort((a, b) => b.points - a.points).slice(0, 3);
  const theme = settings.theme || 'dark';
  const toggleTheme = useGameStore((state) => state.toggleTheme);

  const path1Students = students.filter(s => s.pathId === 'path1');
  const path2Students = students.filter(s => s.pathId === 'path2');
  const jerusalemHolders = students.filter(s => s.hasJerusalemBadge);

  return (
    <div
      className="relative w-full"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowX: 'hidden',
        overflowY: 'auto',
        background: 'radial-gradient(ellipse at 50% 0%, #1a130a 0%, #0d0b05 45%, #050403 100%)',
        direction: 'rtl',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Backgrounds */}
      <StarField count={180} />
      <GoldParticles count={25} />

      {/* Radial light behind hero */}
      <div style={{
        position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
        width: '900px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 50,
          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '50%', width: '44px', height: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'rgba(212,175,55,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; }}
        title={theme === 'light' ? 'المظهر الداكن' : 'المظهر المضيء'}
      >
        <span style={{ fontSize: '18px' }}>{theme === 'light' ? '🌙' : '💡'}</span>
      </button>

      {/* ── HERO SECTION ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full" style={{ maxWidth: '900px', paddingTop: '60px', paddingBottom: '40px' }}>

        {/* Historical badge */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: '40px', padding: '6px 24px', marginBottom: '28px',
            display: 'inline-flex', alignItems: 'center', gap: '10px',
          }}
        >
          <span style={{ color: '#d4af37', fontSize: '13px' }}>✦</span>
          <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '12px', color: '#c49a1a', fontWeight: '700', letterSpacing: '3px' }}>
            583 هـ  ✧  1187 م  ✧  فتح القدس
          </span>
          <span style={{ color: '#d4af37', fontSize: '13px' }}>✦</span>
        </motion.div>

        {/* Main Title with 3D tilt */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          style={{ perspective: '1200px', marginBottom: '12px' }}
        >
          <motion.h1
            style={{
              rotateX, rotateY,
              fontFamily: 'Reem Kufi, serif',
              fontSize: 'clamp(30px, 6vw, 72px)',
              fontWeight: '900',
              lineHeight: '1.15',
              background: 'linear-gradient(135deg, #fff5cc 0%, #f5d060 20%, #d4af37 50%, #f0c040 75%, #c49a1a 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              letterSpacing: '-0.5px', display: 'block',
            }}
          >
            فتوحات صلاح الدين الأيوبي
          </motion.h1>
        </motion.div>

        {/* Subtitle */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{
            fontFamily: 'Amiri, serif',
            fontSize: 'clamp(16px, 3vw, 26px)',
            color: 'rgba(240,230,200,0.65)',
            fontWeight: '400', fontStyle: 'italic', marginBottom: '36px',
          }}
        >
          رحلة نحو القدس — لعبة تعليمية تفاعلية
        </motion.h2>

        {/* Epic Saladin quote */}
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.04) 100%)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '16px', padding: '22px 32px', marginBottom: '48px',
            maxWidth: '600px', position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.8), transparent)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-1px', left: '30px', right: '30px', height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.8), transparent)',
          }} />
          <p style={{
            fontFamily: 'Amiri, serif', fontSize: 'clamp(16px, 2.5vw, 21px)',
            color: '#f5d060', lineHeight: '2', fontStyle: 'italic', marginBottom: '10px',
          }}>
            «والله لنفتحنّ بيت المقدس أو أموتنّ دون ذلك.»
          </p>
          <footer style={{ fontFamily: 'Cairo, sans-serif', fontSize: '12px', color: '#8a7050', fontWeight: '700' }}>
            — صلاح الدين الأيوبي رحمه الله
          </footer>
        </motion.blockquote>

        {/* Live Stats — if students exist */}
        {students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            style={{ display: 'flex', gap: '16px', marginBottom: '48px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {[
              { icon: '⚔️', label: 'الفرسان', value: students.length, color: '#d4af37' },
              { icon: '🕌', label: 'فاتحو القدس', value: jerusalemHolders.length, color: '#f5d060' },
              { icon: '🏛️', label: 'المسار العراقي', value: path1Students.length, color: '#52d68a' },
              { icon: '⛵', label: 'المسار الشامي', value: path2Students.length, color: '#60b4f5' },
              ...(topStudents[0] ? [{ icon: '👑', label: 'المتصدر', value: topStudents[0].name.split(' ')[0], color: '#f59e0b', isText: true }] : []),
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                style={{
                  background: 'rgba(12,9,3,0.85)',
                  border: `1px solid rgba(212,175,55,0.2)`,
                  borderRadius: '14px', padding: '16px 20px', textAlign: 'center',
                  minWidth: '90px', backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease', cursor: 'default',
                }}
                whileHover={{ scale: 1.05, borderColor: 'rgba(212,175,55,0.5)' }}
              >
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{stat.icon}</div>
                <div style={{ fontFamily: 'Cairo, sans-serif', fontSize: stat.isText ? '15px' : '22px', fontWeight: '800', color: stat.color }}>
                  {stat.isText ? stat.value : <AnimatedCounter value={stat.value} />}
                </div>
                <div style={{ fontFamily: 'Cairo, sans-serif', fontSize: '9px', color: '#5a4a2a', fontWeight: '600', marginTop: '2px' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}
        >
          <motion.button
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/game')}
            style={{
              fontSize: '17px', padding: '16px 42px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #d4af37, #b8860b)',
              border: '1px solid rgba(212,175,55,0.6)',
              color: '#0a0602', cursor: 'pointer',
              fontFamily: 'Reem Kufi, serif', fontWeight: '900',
              display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 0 30px rgba(212,175,55,0.35), 0 4px 20px rgba(0,0,0,0.4)',
              letterSpacing: '0.5px',
            }}
          >
            <span style={{ fontSize: '22px' }}>🗺️</span>
            ابدأ الرحلة
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/student')}
            style={{
              fontSize: '15px', padding: '15px 30px', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.06))',
              border: '1.5px solid rgba(212,175,55,0.5)',
              color: '#d4af37', cursor: 'pointer',
              fontFamily: 'Reem Kufi, serif', fontWeight: '700',
              display: 'flex', alignItems: 'center', gap: '8px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 20px rgba(212,175,55,0.12)',
            }}
          >
            <span style={{ fontSize: '18px' }}>⚔️</span>
            بوابة الطلاب
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/admin')}
            style={{
              fontSize: '14px', padding: '14px 24px', borderRadius: '14px',
              background: 'rgba(30,20,8,0.6)', border: '1px solid rgba(100,80,40,0.4)',
              color: '#8a7a50', cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif', fontWeight: '700',
              display: 'flex', alignItems: 'center', gap: '7px',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span>⚙️</span>
            لوحة التحكم
          </motion.button>
        </motion.div>

        {/* Top 3 Leaderboard snippet — only if students exist */}
        {topStudents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            style={{ width: '100%', marginBottom: '48px' }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3))' }} />
              <span style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '14px', fontWeight: '700' }}>
                🏆 أبطال الرحلة
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {topStudents.map((s, i) => {
                const medals = ['🥇', '🥈', '🥉'];
                const colors = ['#d4af37', '#b0b8c8', '#cd7f32'];
                return (
                  <motion.div
                    key={s.id}
                    whileHover={{ scale: 1.05, y: -4 }}
                    style={{
                      background: `linear-gradient(135deg, rgba(212,175,55,${0.12 - i * 0.03}), rgba(0,0,0,0.2))`,
                      border: `1px solid rgba(212,175,55,${0.4 - i * 0.1})`,
                      borderRadius: '14px', padding: '14px 20px',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      backdropFilter: 'blur(8px)', minWidth: '160px',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{medals[i]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: colors[i], fontFamily: 'Reem Kufi, serif',
                        fontSize: '13px', fontWeight: '800',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        maxWidth: '100px',
                      }}>{s.name.split(' ')[0]}</div>
                      <div style={{ color: '#4a3a20', fontSize: '10px', fontFamily: 'Cairo, sans-serif' }}>
                        {s.points} نقطة
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: s.pathId === 'path1' ? '#52d68a' : '#60b4f5', fontSize: '11px', fontWeight: '700' }}>
                        {s.progress.toFixed(0)}%
                      </div>
                      {s.hasJerusalemBadge && <div style={{ fontSize: '12px' }}>🕌</div>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Path Cards */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '760px' }}
          className="md:flex-row"
        >
          <PathCard
            pathNum="الأول"
            title="الطريق العراقي"
            from="البصرة"
            description="من البصرة عبر بغداد وتكريت والموصل وحلب ودمشق نحو القدس — 15 محطة تاريخية"
            colorRgb="45,154,95"
            colorMain="#52d68a"
            icon="🏛️"
            stats={path1Students.length > 0 ? [
              { value: path1Students.length, label: 'فارس' },
              { value: path1Students.filter(s => s.hasJerusalemBadge).length, label: 'فتحوا القدس' },
            ] : null}
          />
          <PathCard
            pathNum="الثاني"
            title="الطريق الشامي"
            from="صور"
            description="من صور الساحلية عبر عكا وحيفا ونابلس والرملة واللد نحو القدس — 15 محطة تاريخية"
            colorRgb="42,127,196"
            colorMain="#60b4f5"
            icon="⛵"
            stats={path2Students.length > 0 ? [
              { value: path2Students.length, label: 'فارس' },
              { value: path2Students.filter(s => s.hasJerusalemBadge).length, label: 'فتحوا القدس' },
            ] : null}
          />
        </motion.div>

        {/* Season info */}
        {season?.name && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={{ marginTop: '40px', textAlign: 'center' }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '30px', padding: '8px 20px',
            }}>
              <span style={{ color: '#6a5a30', fontSize: '11px', fontFamily: 'Cairo, sans-serif' }}>
                {settings.gameName} • {settings.academicYear}
              </span>
              <span style={{ color: 'rgba(212,175,55,0.4)', fontSize: '11px' }}>•</span>
              <span style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '13px', fontWeight: '700' }}>
                {season.name}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom decoration */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '80px',
        background: 'linear-gradient(0deg, rgba(5,3,1,0.9) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 5,
      }} />
    </div>
  );
}
