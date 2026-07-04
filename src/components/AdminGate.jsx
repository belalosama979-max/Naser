/**
 * AdminGate.jsx
 * Password protection wrapper for admin/game/landing pages.
 * Password: admin123
 * Stored in sessionStorage so re-entry not needed within the same tab session.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_SESSION_KEY = 'admin_auth';
const ADMIN_PASSWORD    = 'admin123';

// ── Star field background ─────────────────────────────────────────────────────
function Stars() {
  const stars = React.useRef(
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 4,
      dur: Math.random() * 3 + 2,
    }))
  ).current;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map(s => (
        <motion.div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            borderRadius: '50%', background: '#fff',
          }}
          animate={{ opacity: [0.15, 0.9, 0.15] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Main Gate ──────────────────────────────────────────────────────────────────
export default function AdminGate({ children }) {
  const [authed, setAuthed] = useState(() =>
    sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  );
  const [pw, setPw]         = useState('');
  const [show, setShow]     = useState(false);
  const [error, setError]   = useState('');
  const [shake, setShake]   = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!authed) setTimeout(() => inputRef.current?.focus(), 300);
  }, [authed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pw) return;
    setLoading(true);
    setTimeout(() => {
      if (pw === ADMIN_PASSWORD) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        setAuthed(true);
      } else {
        setError('كلمة المرور غير صحيحة');
        setShake(true);
        setPw('');
        setTimeout(() => { setShake(false); setError(''); }, 1500);
      }
      setLoading(false);
    }, 600); // slight delay for UX
  };

  if (authed) return children;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'radial-gradient(ellipse at 50% 30%, #1a130a 0%, #0f0c06 40%, #070503 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Cairo, sans-serif', direction: 'rtl',
      }}
    >
      <Stars />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px', padding: '20px' }}
      >
        {/* Icon + title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '56px', marginBottom: '14px', display: 'inline-block' }}
          >
            🕌
          </motion.div>
          <h1 style={{
            fontFamily: 'Reem Kufi, serif',
            fontSize: 'clamp(22px, 5vw, 30px)',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #f5d060, #d4af37, #f0c040)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '6px',
          }}>
            فتوحات صلاح الدين
          </h1>
          <p style={{ color: '#5a4a30', fontFamily: 'Amiri, serif', fontSize: '13px', fontStyle: 'italic' }}>
            منطقة محمية — أدخل كلمة المرور للمتابعة
          </p>
        </div>

        {/* Card */}
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'rgba(18,12,4,0.92)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '20px',
            padding: '28px 24px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Gold top accent */}
          <div style={{
            position: 'absolute', top: 0, left: '24px', right: '24px', height: '2px',
            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
            borderRadius: '1px',
          }} />

          <form onSubmit={handleSubmit}>
            <label style={{ color: '#8a7a50', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              🔐 كلمة المرور
            </label>

            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                ref={inputRef}
                type={show ? 'text' : 'password'}
                value={pw}
                onChange={e => { setPw(e.target.value); setError(''); }}
                placeholder="أدخل كلمة المرور..."
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '13px 48px 13px 16px',
                  background: 'rgba(212,175,55,0.05)',
                  border: `1.5px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(212,175,55,0.2)'}`,
                  borderRadius: '12px',
                  color: '#e8d8a0',
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '16px',
                  outline: 'none',
                  direction: 'ltr',
                  textAlign: 'center',
                  letterSpacing: '3px',
                  transition: 'border-color 0.2s',
                }}
              />
              <button
                type="button"
                onClick={() => setShow(p => !p)}
                style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '15px', color: '#5a4a30',
                  lineHeight: 1,
                }}
              >
                {show ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px', padding: '8px 12px',
                    marginBottom: '16px', color: '#ef4444',
                    fontSize: '12px', textAlign: 'center',
                  }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading || !pw}
              whileHover={{ scale: loading || !pw ? 1 : 1.02 }}
              whileTap={{ scale: loading || !pw ? 1 : 0.97 }}
              style={{
                width: '100%', padding: '13px',
                background: !pw || loading
                  ? 'rgba(212,175,55,0.2)'
                  : 'linear-gradient(135deg, #d4af37, #b8860b)',
                border: 'none', borderRadius: '12px',
                color: !pw || loading ? '#6a5a30' : '#0a0602',
                fontSize: '15px', fontWeight: '800',
                cursor: !pw || loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Reem Kufi, serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: !pw || loading ? 'none' : '0 4px 16px rgba(212,175,55,0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading
                ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>⏳</motion.span>
                : '🚪'}
              {loading ? 'جاري التحقق...' : 'دخول'}
            </motion.button>
          </form>
        </motion.div>

        <p style={{ textAlign: 'center', color: '#2a1e08', fontSize: '10px', marginTop: '16px', fontFamily: 'Cairo, sans-serif' }}>
          بوابة الطلاب متاحة للجميع من الرابط /student
        </p>
      </motion.div>
    </div>
  );
}
