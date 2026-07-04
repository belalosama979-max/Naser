/**
 * StudentLogin.jsx
 * Beautiful student login portal.
 * Default password: firstName + "123"
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { loginStudent, getSession, defaultPassword } from '../lib/studentAuth';

// ── Particle background ────────────────────────────────────────────────────
function Particles() {
  const particles = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      delay: Math.random() * 6,
      duration: Math.random() * 8 + 5,
    }))
  ).current;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, background: 'rgba(212,175,55,0.35)' }}
          animate={{ y: [0, -80, 0], opacity: [0.4, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default function StudentLogin() {
  const navigate = useNavigate();
  const { seasons, activeSeasonId } = useGameStore();
  const season = seasons[activeSeasonId];
  const students = season?.students || [];

  const [step, setStep] = useState('select'); // 'select' | 'password'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const passwordRef = useRef(null);

  // If already logged in, redirect
  useEffect(() => {
    const sid = getSession();
    if (sid) {
      navigate(`/student/${sid}`, { replace: true });
    }
  }, [navigate]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.name.includes(search)
  );

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStep('password');
    setPassword('');
    setError('');
    setTimeout(() => passwordRef.current?.focus(), 200);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) { setError('أدخل كلمة المرور'); return; }
    setLoading(true);
    setError('');
    const result = await loginStudent(selectedStudent.id, selectedStudent.name, password);
    setLoading(false);
    if (result.success) {
      navigate(`/student/${selectedStudent.id}`);
    } else {
      setError(result.error || 'كلمة المرور غير صحيحة');
    }
  };

  return (
    <div
      className="student-portal-bg"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Cairo, sans-serif',
      }}
    >
      <Particles />

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed', top: '16px', right: '16px', zIndex: 50,
          background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '50%', width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#d4af37', fontSize: '16px',
        }}
        title="العودة للرئيسية"
      >
        🏠
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '52px', marginBottom: '12px', display: 'inline-block' }}
          >
            🕌
          </motion.div>
          <h1 style={{
            fontFamily: 'Reem Kufi, serif',
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #f5d060, #d4af37, #f0c040)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '6px',
          }}>
            بوابة الطلاب
          </h1>
          <p style={{ color: '#6a5a40', fontFamily: 'Amiri, serif', fontSize: '14px', fontStyle: 'italic' }}>
            رحلة صلاح الدين الأيوبي نحو القدس
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select student */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                background: 'rgba(20,15,6,0.9)',
                border: '1px solid rgba(212,175,55,0.25)',
                borderRadius: '20px',
                padding: '24px',
                backdropFilter: 'blur(12px)',
              }}>
                <h2 style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '16px', marginBottom: '16px', textAlign: 'center' }}>
                  ⚔️ اختر اسمك
                </h2>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="🔍 ابحث عن اسمك..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'rgba(212,175,55,0.06)',
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: '10px',
                      color: '#e0d0a0',
                      fontFamily: 'Cairo, sans-serif',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Students list */}
                <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {filteredStudents.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#5a4a30', padding: '20px', fontSize: '13px' }}>
                      لم يُعثر على الاسم
                    </p>
                  ) : filteredStudents.map((student, i) => (
                    <motion.button
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleSelectStudent(student)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        background: 'rgba(212,175,55,0.05)',
                        border: '1px solid rgba(212,175,55,0.12)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'right',
                        transition: 'all 0.18s ease',
                        width: '100%',
                      }}
                    >
                      {/* Avatar/rank */}
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: student.avatar ? 'transparent' : 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.1))',
                        border: '1px solid rgba(212,175,55,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, overflow: 'hidden',
                      }}>
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '16px', fontFamily: 'Reem Kufi, serif', color: '#d4af37', fontWeight: '700' }}>
                            {student.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <div style={{ color: '#e0d0b0', fontFamily: 'Cairo, sans-serif', fontSize: '14px', fontWeight: '700' }}>
                          {student.name}
                        </div>
                        <div style={{ color: '#5a4a30', fontSize: '11px', marginTop: '2px' }}>
                          {student.pathId === 'path1' ? '🏛️ المسار العراقي' : '⛵ المسار الشامي'}
                          {' • '}
                          <span style={{ color: '#d4af37' }}>{student.points} نقطة</span>
                        </div>
                      </div>
                      <span style={{ color: '#5a4a30', fontSize: '12px' }}>←</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <p style={{ textAlign: 'center', color: '#3a2a10', fontSize: '11px', marginTop: '12px', fontFamily: 'Cairo, sans-serif' }}>
                كلمة المرور الافتراضية: اسمك الأول + 123
              </p>
            </motion.div>
          )}

          {/* Step 2: Password */}
          {step === 'password' && selectedStudent && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                background: 'rgba(20,15,6,0.9)',
                border: '1px solid rgba(212,175,55,0.25)',
                borderRadius: '20px',
                padding: '28px 24px',
                backdropFilter: 'blur(12px)',
              }}>
                {/* Back */}
                <button
                  onClick={() => { setStep('select'); setError(''); }}
                  style={{
                    background: 'none', border: 'none', color: '#6a5a40',
                    cursor: 'pointer', fontSize: '12px', marginBottom: '20px',
                    fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  → العودة لقائمة الأسماء
                </button>

                {/* Student info */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 12px',
                    background: selectedStudent.avatar ? 'transparent' : 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(45,154,95,0.2))',
                    border: '2px solid rgba(212,175,55,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {selectedStudent.avatar ? (
                      <img src={selectedStudent.avatar} alt={selectedStudent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '28px', fontFamily: 'Reem Kufi, serif', color: '#d4af37', fontWeight: '700' }}>
                        {selectedStudent.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 style={{ color: '#f0d080', fontFamily: 'Reem Kufi, serif', fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                    {selectedStudent.name}
                  </h3>
                  <p style={{ color: '#5a4a30', fontSize: '12px' }}>
                    {selectedStudent.pathId === 'path1' ? '🏛️ المسار العراقي' : '⛵ المسار الشامي'}
                  </p>
                </div>

                {/* Password form */}
                <form onSubmit={handleLogin}>
                  <label style={{ color: '#8a7a50', fontSize: '12px', fontFamily: 'Cairo, sans-serif', display: 'block', marginBottom: '8px' }}>
                    🔐 كلمة المرور
                  </label>
                  <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <input
                      ref={passwordRef}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={`مثال: ${defaultPassword(selectedStudent.name)}`}
                      autoComplete="current-password"
                      style={{
                        width: '100%',
                        padding: '12px 48px 12px 16px',
                        background: 'rgba(212,175,55,0.06)',
                        border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(212,175,55,0.25)'}`,
                        borderRadius: '12px',
                        color: '#e0d0a0',
                        fontFamily: 'Cairo, sans-serif',
                        fontSize: '15px',
                        outline: 'none',
                        direction: 'ltr',
                        textAlign: 'left',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      style={{
                        position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#5a4a30',
                      }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          marginBottom: '16px',
                          color: '#ef4444',
                          fontSize: '12px',
                          textAlign: 'center',
                        }}
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: loading ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg, #d4af37, #b8860b)',
                      border: 'none',
                      borderRadius: '12px',
                      color: loading ? '#8a7a50' : '#0a0602',
                      fontSize: '15px',
                      fontWeight: '800',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'Reem Kufi, serif',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: loading ? 'none' : '0 4px 16px rgba(212,175,55,0.3)',
                    }}
                  >
                    {loading ? (
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        ⏳
                      </motion.span>
                    ) : '🚀'}
                    {loading ? 'جاري الدخول...' : 'دخول'}
                  </motion.button>
                </form>

                <p style={{ textAlign: 'center', color: '#3a2a10', fontSize: '11px', marginTop: '16px', fontFamily: 'Cairo, sans-serif', lineHeight: '1.6' }}>
                  كلمة المرور الافتراضية هي اسمك الأول + 123
                  <br />
                  <span style={{ color: '#5a4430' }}>مثال: {defaultPassword(selectedStudent.name)}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
