/**
 * StudentPortal.jsx
 * Main student dashboard — read-only view.
 * Shows: leaderboard, map preview, motivational quotes, progress, nearest zone.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getSession, clearSession } from '../lib/studentAuth';
import { pathsData } from '../utils/pathsData';

// ── Motivational quotes ───────────────────────────────────────────────────────
const QUOTES = [
  { text: '«وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ»', source: 'سورة الطلاق: 3' },
  { text: '«إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ»', source: 'سورة التوبة: 120' },
  { text: '«وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ»', source: 'سورة النجم: 39' },
  { text: '"من جدّ وجد، ومن زرع حصد"', source: 'مثل عربي' },
  { text: '"الجنة تحت أقدام الأمهات"', source: 'حديث شريف' },
  { text: '"طلب العلم فريضة على كل مسلم"', source: 'حديث شريف رواه ابن ماجه' },
  { text: '"من سلك طريقاً يلتمس فيه علماً سهّل الله له طريقاً إلى الجنة"', source: 'صحيح مسلم' },
  { text: '"العلم نور يُضيء الطريق"', source: 'من تراث السلف' },
  { text: '"لا يكلّف الله نفساً إلا وُسعها"', source: 'سورة البقرة: 286' },
  { text: '"وَقُل رَّبِّ زِدْنِي عِلْمًا"', source: 'سورة طه: 114' },
];

// ── Helper: get current node from student points ─────────────────────────────
function getCurrentNode(student, nodePoints) {
  const pathNodes = pathsData[student.pathId] || [];
  if (!pathNodes.length) return null;

  const pts = student.points;
  // Find the furthest node the student has reached
  let reached = pathNodes[0];
  for (const node of pathNodes) {
    const required = nodePoints[node.id] ?? 0;
    if (pts >= required) reached = node;
    else break;
  }
  return reached;
}

// ── Helper: get next node ─────────────────────────────────────────────────────
function getNextNode(student, nodePoints) {
  const pathNodes = pathsData[student.pathId] || [];
  const current = getCurrentNode(student, nodePoints);
  if (!current) return null;
  const idx = pathNodes.findIndex(n => n.id === current.id);
  if (idx >= 0 && idx + 1 < pathNodes.length) return pathNodes[idx + 1];
  return null;
}

// ── Rank medal ────────────────────────────────────────────────────────────────
function RankMedal({ rank }) {
  if (rank === 1) return <span style={{ fontSize: '20px' }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: '20px' }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: '20px' }}>🥉</span>;
  return <span style={{ color: '#8a7a50', fontFamily: 'Reem Kufi, serif', fontSize: '14px', fontWeight: '700' }}>#{rank}</span>;
}

// ── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ progress, size = 100, stroke = 8 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="#d4af37" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

// ── Map Preview Modal ─────────────────────────────────────────────────────────
function MapPreviewModal({ student, nodePoints, onClose }) {
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const currentNode = getCurrentNode(student, nodePoints);
  const pathNodes = pathsData[student.pathId] || [];

  useEffect(() => {
    const handler = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handler);
    // Try to request fullscreen and landscape
    const reqFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
        if (window.screen?.orientation?.lock) await window.screen.orientation.lock('landscape').catch(() => {});
      } catch {}
    };
    reqFullscreen();
    return () => {
      window.removeEventListener('resize', handler);
      try {
        if (document.fullscreenElement) document.exitFullscreen();
        if (window.screen?.orientation?.unlock) window.screen.orientation.unlock();
      } catch {}
    };
  }, []);

  // Map SVG viewbox: 0 0 1400 900
  const VBW = 1400, VBH = 900;

  return (
    <motion.div
      className="map-preview-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: isLandscape ? '95vw' : '96vw',
          maxWidth: isLandscape ? '1100px' : '600px',
          background: 'rgba(10,6,2,0.97)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(6,4,1,0.95)',
          borderBottom: '1px solid rgba(212,175,55,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🗺️</span>
            <span style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '14px', fontWeight: '700' }}>
              خريطة الرحلة
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: student.pathId === 'path1' ? 'rgba(45,154,95,0.15)' : 'rgba(42,127,196,0.15)',
              border: `1px solid ${student.pathId === 'path1' ? 'rgba(45,154,95,0.4)' : 'rgba(42,127,196,0.4)'}`,
              borderRadius: '20px', padding: '3px 10px',
              color: student.pathId === 'path1' ? '#2d9a5f' : '#2a7fc4',
              fontSize: '11px', fontWeight: '700',
            }}>
              {currentNode?.name || 'البداية'}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px', padding: '5px 10px',
                color: '#ef4444', fontSize: '12px', cursor: 'pointer',
              }}
            >✕</button>
          </div>
        </div>

        {/* SVG Map */}
        <div style={{ position: 'relative', overflow: 'auto', maxHeight: isLandscape ? '80vh' : '65vh' }}>
          <svg
            viewBox={`0 0 ${VBW} ${VBH}`}
            style={{ width: '100%', display: 'block', background: 'linear-gradient(135deg, #1e1508 0%, #0f0b04 100%)' }}
          >
            {/* Path line */}
            {pathNodes.length > 1 && (
              <polyline
                points={pathNodes.map(n => `${n.x},${n.y}`).join(' ')}
                fill="none"
                stroke={student.pathId === 'path1' ? 'rgba(45,154,95,0.4)' : 'rgba(42,127,196,0.4)'}
                strokeWidth="3"
                strokeDasharray="8 4"
              />
            )}

            {/* Nodes */}
            {pathNodes.map((node) => {
              const required = nodePoints[node.id] ?? 0;
              const isReached = student.points >= required;
              const isCurrent = node.id === currentNode?.id;
              const isMain = node.type === 'main';
              const pathColor = student.pathId === 'path1' ? '#2d9a5f' : '#2a7fc4';
              const r = isMain ? (isCurrent ? 14 : 10) : (isCurrent ? 10 : 7);

              return (
                <g key={node.id}>
                  {/* Glow for current node */}
                  {isCurrent && (
                    <>
                      <circle cx={node.x} cy={node.y} r={r + 12} fill="rgba(212,175,55,0.08)" />
                      <circle cx={node.x} cy={node.y} r={r + 6} fill="rgba(212,175,55,0.15)" />
                    </>
                  )}
                  <circle
                    cx={node.x} cy={node.y} r={r}
                    fill={isCurrent ? '#d4af37' : isReached ? pathColor : 'rgba(30,20,8,0.9)'}
                    stroke={isCurrent ? '#f5d060' : isReached ? pathColor : 'rgba(100,80,40,0.4)'}
                    strokeWidth={isCurrent ? 3 : 1.5}
                    opacity={isReached ? 1 : 0.4}
                  />
                  {isMain && (
                    <text
                      x={node.x} y={node.y - r - 5}
                      textAnchor="middle"
                      fontSize={isCurrent ? "13" : "10"}
                      fontFamily="Reem Kufi, serif"
                      fill={isCurrent ? '#f5d060' : isReached ? '#c8b890' : '#4a3a20'}
                      fontWeight={isCurrent ? '700' : '400'}
                    >
                      {node.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Jerusalem */}
            <circle cx={700} cy={820} r={18} fill="rgba(212,175,55,0.15)" stroke="#d4af37" strokeWidth="2" />
            <circle cx={700} cy={820} r={10} fill={student.hasJerusalemBadge ? '#d4af37' : 'rgba(50,35,10,0.9)'} />
            <text x={700} y={795} textAnchor="middle" fontSize="14" fontFamily="Reem Kufi, serif" fill="#d4af37" fontWeight="700">
              القدس 🕌
            </text>

            {/* Student marker (current node) */}
            {currentNode && (
              <g>
                <circle cx={currentNode.x} cy={currentNode.y} r={22} fill="rgba(212,175,55,0.12)" />
                <circle cx={currentNode.x} cy={currentNode.y} r={16} fill="rgba(212,175,55,0.2)" />
                <text x={currentNode.x} y={currentNode.y + 5} textAnchor="middle" fontSize="14">
                  {student.avatar ? '📍' : '⚔️'}
                </text>
                <text x={currentNode.x} y={currentNode.y + 26} textAnchor="middle" fontSize="10"
                  fontFamily="Cairo, sans-serif" fill="#f5d060" fontWeight="700">
                  أنت هنا
                </text>
              </g>
            )}
          </svg>
        </div>

        <p style={{ textAlign: 'center', color: '#3a2a10', fontSize: '10px', padding: '8px', fontFamily: 'Cairo, sans-serif' }}>
          اضغط خارج الخريطة للإغلاق
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Main StudentPortal ─────────────────────────────────────────────────────────
export default function StudentPortal() {
  const navigate = useNavigate();
  const { id: studentId } = useParams();
  const { seasons, activeSeasonId, settings } = useGameStore();
  const season = seasons[activeSeasonId];
  const allStudents = (season?.students || []).slice().sort((a, b) => b.points - a.points);
  const student = allStudents.find(s => s.id === studentId);
  const nodePoints = settings.nodePoints || {};

  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [showMap, setShowMap] = useState(false);

  // Guard: session check
  useEffect(() => {
    const sid = getSession();
    if (!sid || sid !== studentId) {
      navigate('/student', { replace: true });
    }
  }, [studentId, navigate]);

  // Rotate quote every 12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(i => (i + 1) % QUOTES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/student');
  };

  if (!student) {
    return (
      <div className="student-portal-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <div style={{ textAlign: 'center', color: '#d4af37' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '16px' }}>لم يُعثر على بيانات الطالب</p>
          <button onClick={() => navigate('/student')} style={{ marginTop: '16px', padding: '8px 20px', background: '#d4af37', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>
            العودة
          </button>
        </div>
      </div>
    );
  }

  const currentNode = getCurrentNode(student, nodePoints);
  const nextNode = getNextNode(student, nodePoints);
  const myRank = allStudents.findIndex(s => s.id === studentId) + 1;
  const pointsToNext = nextNode ? (nodePoints[nextNode.id] ?? 0) - student.points : 0;
  const quote = QUOTES[quoteIndex];

  return (
    <div className="student-portal-bg scroll-ios" style={{ fontFamily: 'Cairo, sans-serif', paddingBottom: '80px' }}>

      {/* ── Top navigation bar ────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,4,1,0.97)',
        borderBottom: '1px solid rgba(212,175,55,0.15)',
        backdropFilter: 'blur(12px)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🕌</span>
          <div>
            <div style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '13px', fontWeight: '700' }}>
              بوابة الطلاب
            </div>
            <div style={{ color: '#4a3a20', fontSize: '9px' }}>{settings.gameName}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/student/${studentId}/profile`)}
            style={{
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: '8px', padding: '6px 12px',
              color: '#d4af37', fontSize: '11px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
            }}
          >
            👤 بروفايلي
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '8px', padding: '6px 12px',
              color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
            }}
          >
            خروج
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>

        {/* ── Student hero card ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'rgba(20,14,4,0.9)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Gold accent top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '76px', height: '76px', borderRadius: '50%',
                background: student.avatar ? 'transparent' : 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(45,154,95,0.2))',
                border: '3px solid rgba(212,175,55,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '28px', fontFamily: 'Reem Kufi, serif', color: '#d4af37', fontWeight: '700' }}>
                    {student.name.charAt(0)}
                  </span>
                )}
              </div>
              {student.hasJerusalemBadge && (
                <div style={{
                  position: 'absolute', bottom: '-4px', right: '-4px',
                  fontSize: '20px', background: 'rgba(10,6,2,0.9)',
                  borderRadius: '50%', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #d4af37',
                }}>🕌</div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#f0d080', fontFamily: 'Reem Kufi, serif', fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: '800', marginBottom: '4px' }}>
                {student.name}
              </h2>
              <p style={{ color: student.pathId === 'path1' ? '#2d9a5f' : '#2a7fc4', fontSize: '12px', marginBottom: '8px' }}>
                {student.pathId === 'path1' ? '🏛️ المسار العراقي' : '⛵ المسار الشامي'}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>{student.points}</div>
                  <div style={{ color: '#5a4a30', fontSize: '9px' }}>نقطة</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#52d68a', fontFamily: 'Reem Kufi, serif', fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>#{myRank}</div>
                  <div style={{ color: '#5a4a30', fontSize: '9px' }}>ترتيبي</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#60b4f5', fontFamily: 'Reem Kufi, serif', fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>{student.progress.toFixed(0)}%</div>
                  <div style={{ color: '#5a4a30', fontSize: '9px' }}>إنجاز</div>
                </div>
              </div>
            </div>

            {/* Progress ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <ProgressRing progress={student.progress} size={90} stroke={8} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '16px', fontWeight: '800' }}>
                  {student.progress.toFixed(0)}%
                </span>
                <span style={{ color: '#5a4a30', fontSize: '9px' }}>تقدم</span>
              </div>
            </div>
          </div>

          {/* Current location */}
          {currentNode && (
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              background: 'rgba(212,175,55,0.05)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: '18px' }}>📍</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#d4af37', fontSize: '13px', fontWeight: '700' }}>موقعي الحالي: {currentNode.name}</div>
                <div style={{ color: '#5a4a30', fontSize: '11px' }}>{currentNode.desc}</div>
              </div>
              {nextNode && (
                <div style={{
                  background: 'rgba(45,154,95,0.1)', border: '1px solid rgba(45,154,95,0.2)',
                  borderRadius: '8px', padding: '6px 10px', textAlign: 'center',
                }}>
                  <div style={{ color: '#52d68a', fontSize: '10px' }}>التالي: {nextNode.name}</div>
                  <div style={{ color: '#3a6a40', fontSize: '9px' }}>يلزمك {pointsToNext} نقطة</div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Motivational quote ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: 'rgba(212,175,55,0.06)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '16px',
            padding: '18px 20px',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <p style={{
                fontFamily: 'Amiri, serif',
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                color: '#f5d060',
                lineHeight: '1.8',
                fontStyle: 'italic',
                marginBottom: '8px',
              }}>
                {quote.text}
              </p>
              <span style={{ color: '#6a5a30', fontSize: '11px', fontFamily: 'Cairo, sans-serif' }}>— {quote.source}</span>
            </motion.div>
          </AnimatePresence>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '12px' }}>
            {QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => setQuoteIndex(i)}
                style={{
                  width: i === quoteIndex ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === quoteIndex ? '#d4af37' : 'rgba(212,175,55,0.2)',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.3s ease', padding: 0,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Map preview button ───────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setShowMap(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.06))',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '16px',
            marginBottom: '16px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '16px', fontWeight: '700',
            boxShadow: '0 4px 20px rgba(212,175,55,0.08)',
          }}
        >
          <span style={{ fontSize: '24px' }}>🗺️</span>
          اعرض الخريطة وموقعي عليها
          <span style={{ fontSize: '12px', color: '#5a4a30', fontFamily: 'Cairo, sans-serif' }}>(اضغط للتكبير)</span>
        </motion.button>

        {/* ── Leaderboard ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            background: 'rgba(20,14,4,0.9)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '20px',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: 'rgba(212,175,55,0.06)',
            borderBottom: '1px solid rgba(212,175,55,0.12)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '18px' }}>🏆</span>
            <span style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '15px', fontWeight: '700' }}>
              ترتيب الطلاب
            </span>
            <span style={{ marginRight: 'auto', color: '#5a4a30', fontSize: '11px' }}>
              {allStudents.length} طالب
            </span>
          </div>

          {/* Students list */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {allStudents.map((s, i) => {
              const isMe = s.id === studentId;
              const sNode = getCurrentNode(s, nodePoints);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px',
                    background: isMe ? 'rgba(212,175,55,0.08)' : 'transparent',
                    borderBottom: '1px solid rgba(212,175,55,0.05)',
                    borderRight: isMe ? '3px solid #d4af37' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Rank */}
                  <div style={{ width: '32px', textAlign: 'center', flexShrink: 0 }}>
                    <RankMedal rank={i + 1} />
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: s.avatar ? 'transparent' : 'rgba(212,175,55,0.1)',
                    border: `1.5px solid ${isMe ? '#d4af37' : 'rgba(212,175,55,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {s.avatar ? (
                      <img src={s.avatar} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '14px', color: '#d4af37', fontWeight: '700' }}>{s.name.charAt(0)}</span>
                    )}
                  </div>

                  {/* Name + node */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: isMe ? '#f5d060' : '#c8b890',
                      fontSize: '13px', fontWeight: isMe ? '800' : '600',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {s.name} {isMe && <span style={{ color: '#d4af37', fontSize: '10px' }}>(أنت)</span>}
                    </div>
                    <div style={{ color: '#4a3a20', fontSize: '10px' }}>
                      📍 {sNode?.name || 'البداية'}
                      {' • '}
                      <span style={{ color: s.pathId === 'path1' ? '#2d9a5f' : '#2a7fc4' }}>
                        {s.pathId === 'path1' ? 'عراقي' : 'شامي'}
                      </span>
                    </div>
                  </div>

                  {/* Points + progress */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '14px', fontWeight: '700' }}>
                      {s.points}
                    </div>
                    <div style={{ color: '#4a3a20', fontSize: '9px' }}>نقطة</div>
                  </div>

                  <div style={{ width: '40px', flexShrink: 0 }}>
                    <div style={{ height: '4px', background: 'rgba(212,175,55,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.progress}%` }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        style={{ height: '100%', background: s.hasJerusalemBadge ? '#d4af37' : (s.pathId === 'path1' ? '#2d9a5f' : '#2a7fc4'), borderRadius: '2px' }}
                      />
                    </div>
                    <div style={{ color: '#4a3a20', fontSize: '8px', textAlign: 'center', marginTop: '2px' }}>{s.progress.toFixed(0)}%</div>
                  </div>

                  {s.hasJerusalemBadge && <span style={{ fontSize: '14px', flexShrink: 0 }}>🕌</span>}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Rank info card ───────────────────────────────── */}
        {allStudents.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              marginTop: '16px',
              padding: '16px',
              background: 'rgba(20,14,4,0.9)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '16px',
              display: 'flex', gap: '12px', flexWrap: 'wrap',
              justifyContent: 'space-around',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                {myRank === 1 ? '👑' : myRank <= 3 ? '⭐' : '⚔️'}
              </div>
              <div style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '20px', fontWeight: '800' }}>#{myRank}</div>
              <div style={{ color: '#5a4a30', fontSize: '10px' }}>ترتيبي الحالي</div>
            </div>
            {myRank > 1 && (() => {
              const above = allStudents[myRank - 2];
              const diff = above.points - student.points;
              return (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎯</div>
                  <div style={{ color: '#52d68a', fontFamily: 'Reem Kufi, serif', fontSize: '20px', fontWeight: '800' }}>{diff}</div>
                  <div style={{ color: '#5a4a30', fontSize: '10px' }}>نقطة للمركز {myRank - 1}</div>
                </div>
              );
            })()}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>📊</div>
              <div style={{ color: '#60b4f5', fontFamily: 'Reem Kufi, serif', fontSize: '20px', fontWeight: '800' }}>
                {allStudents.filter(s => s.points < student.points).length}
              </div>
              <div style={{ color: '#5a4a30', fontSize: '10px' }}>طالب تجاوزتهم</div>
            </div>
          </motion.div>
        )}

      </div>

      {/* ── Map Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showMap && (
          <MapPreviewModal
            student={student}
            nodePoints={nodePoints}
            onClose={() => setShowMap(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
