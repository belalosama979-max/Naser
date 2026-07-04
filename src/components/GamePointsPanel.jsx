import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Award, Check, X } from 'lucide-react';
import { getPathColor } from '../utils/pathsData';

const CARD_TYPES = [
  { value: 'العبادات', label: 'العبادات', emoji: '🕌', color: '#2d9a5f' },
  { value: 'دوام المركز', label: 'دوام المركز', emoji: '📅', color: '#2a7fc4' },
  { value: 'المهام', label: 'المهام', emoji: '⚔️', color: '#d4af37' },
  { value: 'المهمة الأسبوعية', label: 'المهمة الأسبوعية', emoji: '🏆', color: '#8b5cf6' },
];

const positiveMessages = ['والله جدع', 'قوي', 'أسطوري', 'الله يحفظك', 'تبارك الرحمن'];
const negativeMessages = ['الله يهديك', 'الله يصلحك', 'لا حول ولا قوة إلا بالله', 'أحزنني'];

export default function GamePointsPanel({ onClose }) {
  const { seasons, activeSeasonId, addPoints } = useGameStore();
  const season = seasons[activeSeasonId];
  const students = season?.students || [];

  const [selectedId, setSelectedId] = useState('');
  const [cardType, setCardType] = useState('العبادات');
  const [pointsInput, setPointsInput] = useState('');
  const [isDeduct, setIsDeduct] = useState(false);
  const [success, setSuccess] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const pts = parseInt(pointsInput);
    if (!selectedId || isNaN(pts) || pts <= 0) return;
    const delta = isDeduct ? -pts : pts;
    addPoints(selectedId, delta, cardType);
    setPointsInput('');
    setSuccess(true);
    
    const msgList = isDeduct ? negativeMessages : positiveMessages;
    const randomMsg = msgList[Math.floor(Math.random() * msgList.length)];
    setFeedback({ message: randomMsg, isPositive: !isDeduct });

    setTimeout(() => {
      setSuccess(false);
      setFeedback(null);
    }, 3000);
  };

  const selectedStudent = students.find(s => s.id === selectedId);

  return (
    <div style={{
      width: '320px',
      height: '100%',
      background: 'rgba(8,5,2,0.95)',
      backdropFilter: 'blur(16px)',
      borderLeft: '1px solid rgba(212,175,55,0.2)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      position: 'relative',
      zIndex: 20,
      direction: 'rtl',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '16px', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} /> تقييم الفرسان
        </h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#c8b890', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scroll">
        <h4 style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', color: '#c8b890', marginBottom: '8px' }}>1. اختر الفارس</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '20px' }}>
          {[...students].sort((a, b) => a.currentRank - b.currentRank).map(s => {
            const pathColor = getPathColor(s.pathId);
            const isSelected = selectedId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                style={{
                  background: isSelected ? `${pathColor.primary}40` : 'rgba(0,0,0,0.4)',
                  border: `1px solid ${isSelected ? pathColor.bright : 'rgba(212,175,55,0.1)'}`,
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{
                  fontFamily: 'Cairo, sans-serif', fontSize: '10px', fontWeight: isSelected ? '700' : '600',
                  color: isSelected ? '#fff' : '#a89880',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
                }}>
                  {s.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: '9px', color: pathColor.bright, fontFamily: 'Cairo, sans-serif' }}>
                  {s.points} ن
                </span>
              </button>
            );
          })}
        </div>

        <h4 style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', color: '#c8b890', marginBottom: '8px' }}>2. نوع البطاقة</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '20px' }}>
          {CARD_TYPES.map(ct => (
            <button
              key={ct.value}
              onClick={() => setCardType(ct.value)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: `1px solid ${cardType === ct.value ? ct.color : 'rgba(212,175,55,0.1)'}`,
                background: cardType === ct.value ? `${ct.color}25` : 'rgba(0,0,0,0.4)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '16px' }}>{ct.emoji}</span>
              <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '10px', color: cardType === ct.value ? '#f0d060' : '#8a7050' }}>
                {ct.label}
              </span>
            </button>
          ))}
        </div>

        <h4 style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', color: '#c8b890', marginBottom: '8px' }}>3. العملية والنقاط</h4>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)' }}>
            <button
              onClick={() => setIsDeduct(false)}
              style={{
                background: !isDeduct ? '#2d9a5f' : 'rgba(0,0,0,0.4)',
                color: !isDeduct ? '#fff' : '#a89880',
                border: 'none', padding: '6px 12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
              }}
            >+</button>
            <button
              onClick={() => setIsDeduct(true)}
              style={{
                background: isDeduct ? '#c03030' : 'rgba(0,0,0,0.4)',
                color: isDeduct ? '#fff' : '#a89880',
                border: 'none', padding: '6px 12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
              }}
            >-</button>
          </div>
          <input
            type="number"
            value={pointsInput}
            onChange={e => setPointsInput(e.target.value)}
            placeholder="النقاط..."
            min="1"
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '6px',
              color: '#f0d060',
              padding: '6px 10px',
              fontFamily: 'Cairo, sans-serif',
              fontSize: '14px',
              fontWeight: 'bold',
              outline: 'none',
              textAlign: 'center',
            }}
          />
        </div>

        {/* Student Preview */}
        {selectedStudent && (
          <div style={{
            background: feedback ? (feedback.isPositive ? 'rgba(45,154,95,0.2)' : 'rgba(192,48,48,0.2)') : 'rgba(0,0,0,0.3)',
            border: `1px solid ${feedback ? (feedback.isPositive ? '#2d9a5f' : '#c03030') : 'rgba(212,175,55,0.2)'}`,
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center',
            marginBottom: '16px',
            transition: 'all 0.3s ease',
          }}>
            <h4 style={{ fontFamily: 'Cairo, sans-serif', fontSize: '14px', color: '#f0d060', fontWeight: 'bold' }}>
              {selectedStudent.name}
            </h4>
            <div style={{ fontFamily: 'Cairo, sans-serif', fontSize: '12px', color: '#a89880', marginTop: '4px' }}>
              النقاط الحالية: <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedStudent.points}</span>
            </div>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '8px',
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: feedback.isPositive ? '#52d68a' : '#ff6b6b',
                }}
              >
                {feedback.message}
              </motion.div>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedId || !pointsInput || parseInt(pointsInput) <= 0 || success}
          style={{
            width: '100%',
            padding: '10px',
            background: success ? '#2d9a5f' : 'linear-gradient(135deg, #d4af37, #b8860b)',
            border: 'none',
            borderRadius: '8px',
            color: success ? '#fff' : '#0a0602',
            fontFamily: 'Cairo, sans-serif',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: (!selectedId || !pointsInput || parseInt(pointsInput) <= 0) ? 'not-allowed' : 'pointer',
            opacity: (!selectedId || !pointsInput || parseInt(pointsInput) <= 0) ? 0.5 : 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          {success ? <><Check size={18} /> تم الحفظ!</> : 'تأكيد العملية'}
        </button>
      </div>
    </div>
  );
}
