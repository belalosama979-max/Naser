/**
 * ProgressPanel.jsx
 * Right-side panel in Game Mode for adding points to students.
 * Contains three cards: Attendance (دوام), Follow-up (متابعات), Tasks (مهام).
 * Supports live updates — student moves on map instantly after points added.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

const CARD_TYPES = [
  {
    id: 'العبادات',
    label: 'العبادات',
    icon: '🕌',
    desc: 'نقاط العبادات',
    color: '#2d9a5f',
    bg: 'rgba(45,154,95,0.12)',
    border: 'rgba(45,154,95,0.3)',
  },
  {
    id: 'دوام المركز',
    label: 'دوام المركز',
    icon: '📅',
    desc: 'الحضور والالتزام',
    color: '#2a7fc4',
    bg: 'rgba(42,127,196,0.12)',
    border: 'rgba(42,127,196,0.3)',
  },
  {
    id: 'المهام',
    label: 'المهام',
    icon: '✅',
    desc: 'المهام والواجبات',
    color: '#c49a1a',
    bg: 'rgba(196,154,26,0.12)',
    border: 'rgba(196,154,26,0.3)',
  },
  {
    id: 'المهمة الأسبوعية',
    label: 'المهمة الأسبوعية',
    icon: '⭐',
    desc: 'إنجاز المهام الأسبوعية',
    color: '#8e44ad',
    bg: 'rgba(142,68,173,0.12)',
    border: 'rgba(142,68,173,0.3)',
  },
];

export default function ProgressPanel() {
  const { seasons, activeSeasonId, addPoints } = useGameStore();
  const season = seasons[activeSeasonId];
  const students = season?.students || [];

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCard, setSelectedCard] = useState('العبادات');
  const [pointsInput, setPointsInput] = useState(10);
  const [isDeduct, setIsDeduct] = useState(false);
  const [lastOps, setLastOps] = useState([]);
  const [successAnim, setSuccessAnim] = useState(false);

  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => a.currentRank - b.currentRank),
    [students]
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const activeCardDef = CARD_TYPES.find(c => c.id === selectedCard);

  const handleApply = () => {
    if (!selectedStudentId || !pointsInput) return;
    const pts = parseInt(pointsInput);
    if (isNaN(pts) || pts === 0) return;
    const delta = isDeduct ? -pts : pts;

    addPoints(selectedStudentId, delta, selectedCard, 'المشرف');

    // Log the operation
    const op = {
      id: Date.now(),
      studentName: selectedStudent?.name || '—',
      cardType: selectedCard,
      points: delta,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };
    setLastOps(prev => [op, ...prev].slice(0, 8));

    // Success animation
    setSuccessAnim(true);
    setTimeout(() => setSuccessAnim(false), 800);
  };

  return (
    <div style={{
      width: '260px',
      minWidth: '260px',
      height: '100%',
      background: 'rgba(6,4,1,0.92)',
      backdropFilter: 'blur(18px)',
      borderLeft: '1px solid rgba(212,175,55,0.12)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 8px',
        borderBottom: '1px solid rgba(212,175,55,0.1)',
        background: 'linear-gradient(135deg, rgba(212,175,55,0.06), transparent)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📊</span>
          <h3 style={{
            fontFamily: 'Reem Kufi, serif',
            fontSize: '13px',
            fontWeight: '700',
            color: '#d4af37',
          }}>
            متابعة التقدم
          </h3>
        </div>
        <p style={{
          fontSize: '9px', color: '#4a3a20',
          fontFamily: 'Cairo, sans-serif', marginTop: '2px',
        }}>
          أضف نقاط للطالب — يتحرك فوراً على الخريطة
        </p>
      </div>

      <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Student selector */}
        <div>
          <label style={{ fontSize: '10px', color: '#7a6a50', fontFamily: 'Cairo, sans-serif', display: 'block', marginBottom: '4px' }}>
            اختر الطالب
          </label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px',
              background: 'rgba(15,10,4,0.9)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '8px',
              color: selectedStudentId ? '#f0d060' : '#5a4a30',
              fontSize: '11px',
              fontFamily: 'Cairo, sans-serif',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">— اختر الطالب —</option>
            {sortedStudents.map(s => (
              <option key={s.id} value={s.id}>
                #{s.currentRank} {s.name} ({s.points} نقطة)
              </option>
            ))}
          </select>
        </div>

        {/* Card selector */}
        <div>
          <label style={{ fontSize: '10px', color: '#7a6a50', fontFamily: 'Cairo, sans-serif', display: 'block', marginBottom: '4px' }}>
            اختر نوع البطاقة
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {CARD_TYPES.map(card => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card.id)}
                style={{
                  padding: '8px 10px',
                  background: selectedCard === card.id ? card.bg : 'rgba(10,7,2,0.6)',
                  border: `1px solid ${selectedCard === card.id ? card.border : 'rgba(212,175,55,0.08)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'right',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '16px' }}>{card.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '700',
                    color: selectedCard === card.id ? card.color : '#7a6a50',
                    fontFamily: 'Cairo, sans-serif',
                  }}>
                    {card.label}
                  </div>
                  <div style={{
                    fontSize: '8px', color: '#4a3a20',
                    fontFamily: 'Cairo, sans-serif', marginTop: '1px',
                  }}>
                    {card.desc}
                  </div>
                </div>
                {selectedCard === card.id && (
                  <span style={{ color: card.color, fontSize: '12px' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Points input */}
        {activeCardDef && (
          <div style={{
            background: activeCardDef.bg,
            border: `1px solid ${activeCardDef.border}`,
            borderRadius: '10px',
            padding: '10px',
          }}>
            <label style={{
              fontSize: '10px', fontFamily: 'Cairo, sans-serif',
              color: activeCardDef.color, display: 'block', marginBottom: '8px', fontWeight: '600',
            }}>
              {activeCardDef.icon} {activeCardDef.label}
            </label>
            <p style={{ fontSize: '8.5px', color: '#4a3a20', fontFamily: 'Cairo, sans-serif', marginBottom: '8px' }}>
              {activeCardDef.desc}
            </p>

            {/* +/- Toggle */}
            <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${activeCardDef.border}`, marginBottom: '8px' }}>
              <button
                onClick={() => setIsDeduct(false)}
                style={{
                  flex: 1, padding: '4px',
                  background: !isDeduct ? activeCardDef.color : 'rgba(0,0,0,0.4)',
                  color: !isDeduct ? '#fff' : activeCardDef.color,
                  fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', border: 'none'
                }}
              >+</button>
              <button
                onClick={() => setIsDeduct(true)}
                style={{
                  flex: 1, padding: '4px',
                  background: isDeduct ? '#c03030' : 'rgba(0,0,0,0.4)',
                  color: isDeduct ? '#fff' : '#c03030',
                  fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', border: 'none'
                }}
              >−</button>
            </div>

            {/* Points stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={() => setPointsInput(p => Math.max(1, p - 10))}
                style={{
                  width: '28px', height: '28px',
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid ${activeCardDef.border}`,
                  borderRadius: '6px',
                  color: activeCardDef.color,
                  fontSize: '16px', fontWeight: '800',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >−</button>
              <input
                type="number"
                value={pointsInput}
                onChange={e => setPointsInput(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  flex: 1, padding: '5px 8px',
                  background: 'rgba(0,0,0,0.5)',
                  border: `1px solid ${activeCardDef.border}`,
                  borderRadius: '6px',
                  color: '#f0d060',
                  fontSize: '14px', fontWeight: '800',
                  fontFamily: 'Cairo, sans-serif',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => setPointsInput(p => p + 10)}
                style={{
                  width: '28px', height: '28px',
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid ${activeCardDef.border}`,
                  borderRadius: '6px',
                  color: activeCardDef.color,
                  fontSize: '16px', fontWeight: '800',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>

            {/* Apply button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              animate={successAnim ? { scale: [1, 1.08, 1], backgroundColor: ['', '#22c55e', ''] } : {}}
              onClick={handleApply}
              disabled={!selectedStudentId || parseInt(pointsInput) <= 0}
              style={{
                width: '100%',
                padding: '9px',
                background: (selectedStudentId && parseInt(pointsInput) > 0)
                  ? `linear-gradient(135deg, ${isDeduct ? '#c03030' : activeCardDef.color}, ${isDeduct ? '#a02020' : activeCardDef.color}bb)`
                  : 'rgba(30,20,10,0.5)',
                border: `1px solid ${(selectedStudentId && parseInt(pointsInput) > 0) ? (isDeduct ? '#c03030' : activeCardDef.border) : 'rgba(212,175,55,0.05)'}`,
                borderRadius: '8px',
                color: (selectedStudentId && parseInt(pointsInput) > 0) ? '#fff' : '#3a2a10',
                fontSize: '12px', fontWeight: '700',
                fontFamily: 'Cairo, sans-serif',
                cursor: (selectedStudentId && parseInt(pointsInput) > 0) ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
              }}
            >
              {successAnim ? '✓ تم التطبيق!' : `تطبيق ${isDeduct ? '-' : '+'}${pointsInput} نقطة`}
            </motion.button>
          </div>
        )}

        {/* Recent operations log */}
        {lastOps.length > 0 && (
          <div>
            <div style={{
              fontSize: '10px', color: '#5a4a30',
              fontFamily: 'Cairo, sans-serif', marginBottom: '5px', fontWeight: '600',
            }}>
              📜 سجل آخر العمليات
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <AnimatePresence>
                {lastOps.map(op => (
                  <motion.div
                    key={op.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: 'rgba(10,7,2,0.6)',
                      border: '1px solid rgba(212,175,55,0.06)',
                      borderRadius: '5px',
                      padding: '4px 7px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '9px', color: '#7a6a50', fontFamily: 'Cairo, sans-serif' }}>
                      {op.time}
                    </span>
                    <span style={{ fontSize: '9px', color: '#c8b890', fontFamily: 'Cairo, sans-serif' }}>
                      {op.studentName}
                    </span>
                    <span style={{ fontSize: '9px', color: '#5a4a30', fontFamily: 'Cairo, sans-serif' }}>
                      {op.cardType}
                    </span>
                    <span style={{ fontSize: '9px', color: op.points > 0 ? '#52d68a' : '#e05050', fontFamily: 'Cairo, sans-serif', fontWeight: '700' }}>
                      {op.points > 0 ? '+' : ''}{op.points}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
