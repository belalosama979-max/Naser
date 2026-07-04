/**
 * LandingPage.jsx
 * Epic full-screen landing page with parallax effects and animations.
 * Shows game stats, path selection info, and navigation.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

// ─── Particle System ──────────────────────────────────────────
function Particles({ count = 50 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 6,
      duration: Math.random() * 8 + 6,
      opacity: Math.random() * 0.6 + 0.2,
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
            background: Math.random() > 0.7
              ? `rgba(212,175,55,${p.opacity})`
              : `rgba(255,255,255,${p.opacity * 0.4})`,
          }}
          animate={{
            y: [0, -120, 0],
            opacity: [p.opacity, p.opacity * 1.5, 0],
            scale: [1, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated Stars Background ─────────────────────────────────
function StarField({ count = 120 }) {
  const stars = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 2,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Path Card Component ───────────────────────────────────────
function PathCard({ pathNum, title, route, description, color, icon, stats }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: `linear-gradient(135deg, rgba(${color.rgb},0.15), rgba(${color.rgb},0.04))`,
        border: `1px solid rgba(${color.rgb},0.4)`,
        borderRadius: '16px',
        padding: '24px',
        flex: 1,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent, rgba(${color.rgb},0.8), transparent)`,
      }} />

      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <div style={{
        fontSize: '11px', fontFamily: 'Cairo, sans-serif',
        color: `rgba(${color.rgb},0.7)`, fontWeight: '600',
        letterSpacing: '2px', marginBottom: '4px',
      }}>
        المسار {pathNum}
      </div>
      <h3 style={{
        fontFamily: 'Reem Kufi, serif',
        fontSize: '18px',
        color: '#f0d060',
        marginBottom: '8px',
        fontWeight: '700',
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily: 'Cairo, sans-serif',
        fontSize: '12px',
        color: '#7a6a50',
        lineHeight: '1.6',
        marginBottom: '16px',
      }}>
        {description}
      </p>

      {/* Route steps (first and last) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: `rgba(${color.rgb},0.08)`,
        borderRadius: '10px',
        border: `1px solid rgba(${color.rgb},0.2)`,
      }}>
        <span style={{ color: `rgba(${color.rgb},0.9)`, fontFamily: 'Reem Kufi, serif', fontSize: '13px', fontWeight: '700' }}>
          {route.from}
        </span>
        <span style={{ color: '#4a3a20', flex: 1, textAlign: 'center', fontSize: '16px' }}>
          ···→···
        </span>
        <span style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '13px', fontWeight: '700' }}>
          القدس ✦
        </span>
      </div>

      <div style={{
        marginTop: '10px',
        fontSize: '10px',
        fontFamily: 'Cairo, sans-serif',
        color: '#4a3a20',
        textAlign: 'center',
      }}>
        15 محطة تاريخية
      </div>
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

  const rotateX = useTransform(mouseY, [0, 1], [3, -3]);
  const rotateY = useTransform(mouseX, [0, 1], [-3, 3]);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX / window.innerWidth);
    mouseY.set(e.clientY / window.innerHeight);
  };

  const topStudent = students.length > 0
    ? [...students].sort((a, b) => b.points - a.points)[0]
    : null;

  const theme = settings.theme || 'dark';
  const toggleTheme = useGameStore((state) => state.toggleTheme);

  return (
    <div
      className="relative w-full"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflowX: 'hidden',
        overflowY: 'auto',
        background: 'var(--landing-bg)',
        direction: 'rtl',
        paddingTop: '40px',
        paddingBottom: '40px',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 50,
          background: 'var(--header-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={theme === 'light' ? 'المظهر الداكن' : 'المظهر المضيء'}
      >
        <span style={{ fontSize: '18px' }}>{theme === 'light' ? '🌙' : '💡'}</span>
      </button>

      {/* Backgrounds */}
      <StarField />
      <Particles count={40} />

      {/* Radial light source */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Main Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl w-full">

        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.35)',
            borderRadius: '40px',
            padding: '6px 20px',
            marginBottom: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#d4af37', fontSize: '14px' }}>✦</span>
          <span style={{
            fontFamily: 'Cairo, sans-serif',
            fontSize: '12px',
            color: '#c49a1a',
            fontWeight: '600',
            letterSpacing: '2px',
          }}>
            583 هـ / 1187 م
          </span>
          <span style={{ color: '#d4af37', fontSize: '14px' }}>✦</span>
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          style={{ perspective: '1000px', marginBottom: '8px' }}
        >
          <motion.h1
            style={{
              rotateX,
              rotateY,
              fontFamily: 'Reem Kufi, serif',
              fontSize: 'clamp(32px, 6vw, 68px)',
              fontWeight: '800',
              lineHeight: '1.15',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #f5d060 0%, #d4af37 35%, #f0c040 60%, #c49a1a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              marginBottom: '4px',
            }}
          >
            فتوحات صلاح الدين الأيوبي
          </motion.h1>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{
            fontFamily: 'Amiri, serif',
            fontSize: 'clamp(18px, 3vw, 28px)',
            color: 'rgba(240,230,200,0.7)',
            fontWeight: '400',
            fontStyle: 'italic',
            marginBottom: '32px',
          }}
        >
          رحلة نحو القدس — لعبة تعليمية تفاعلية
        </motion.h2>

        {/* Historical quote */}
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          style={{
            background: 'rgba(212,175,55,0.06)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '12px',
            padding: '16px 28px',
            marginBottom: '40px',
            maxWidth: '580px',
          }}
        >
          <p style={{
            fontFamily: 'Amiri, serif',
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: '#f5d060',
            lineHeight: '1.8',
            fontStyle: 'italic',
          }}>
            «والله لنفتحنّ بيت المقدس أو أموتنّ دون ذلك.»
          </p>
          <footer style={{
            marginTop: '8px',
            fontFamily: 'Cairo, sans-serif',
            fontSize: '12px',
            color: '#8a7050',
            fontWeight: '600',
          }}>
            — صلاح الدين الأيوبي
          </footer>
        </motion.blockquote>

        {/* Game stats (if active season) */}
        {students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            style={{
              display: 'flex',
              gap: '24px',
              marginBottom: '40px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              { label: 'الطلاب', value: students.length, color: '#d4af37', icon: '⚔️' },
              { label: 'فتحوا القدس', value: students.filter(s => s.hasJerusalemBadge).length, color: '#f5d060', icon: '🕌' },
              {
                label: 'المتصدر',
                value: topStudent?.name.split(' ')[0] || '—',
                color: '#52d68a',
                icon: '👑',
              },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(15,12,5,0.8)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '12px',
                padding: '14px 20px',
                textAlign: 'center',
                minWidth: '100px',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '20px',
                  fontWeight: '800',
                  color: stat.color,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '10px',
                  color: '#5a4a2a',
                  fontWeight: '600',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/game')}
            className="btn btn-primary"
            style={{ fontSize: '16px', padding: '14px 36px', borderRadius: '12px' }}
          >
            <span>🗺️</span>
            ابدأ الرحلة
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/student')}
            style={{
              fontSize: '15px', padding: '13px 28px', borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.06))',
              border: '1.5px solid rgba(212,175,55,0.45)',
              color: '#d4af37', cursor: 'pointer', fontFamily: 'Reem Kufi, serif',
              fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 16px rgba(212,175,55,0.1)',
            }}
          >
            <span>⚔️</span>
            بوابة الطلاب
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
            style={{ fontSize: '14px', padding: '12px 24px', borderRadius: '12px' }}
          >
            <span>⚙️</span>
            لوحة التحكم
          </motion.button>
        </motion.div>

        {/* Path cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col md:flex-row gap-4 w-full max-w-[700px] mt-12"
        >
          <PathCard
            pathNum="الأول"
            title="الطريق العراقي"
            route={{ from: 'البصرة' }}
            description="من البصرة عبر بغداد وتكريت والموصل وحلب ودمشق نحو القدس"
            color={{ rgb: '45,154,95' }}
            icon="🏛️"
          />
          <PathCard
            pathNum="الثاني"
            title="الطريق الشامي"
            route={{ from: 'صور' }}
            description="من صور الساحلية عبر عكا وحيفا ونابلس والرملة واللد نحو القدس"
            color={{ rgb: '42,127,196' }}
            icon="⛵"
          />
        </motion.div>
      </div>

      {/* Bottom text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        style={{
          position: 'fixed',
          bottom: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Cairo, sans-serif',
          fontSize: '11px',
          color: '#3a2a10',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}
      >
        {settings.gameName} • {settings.academicYear}
      </motion.div>
    </div>
  );
}
