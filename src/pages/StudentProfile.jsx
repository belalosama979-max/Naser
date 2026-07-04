/**
 * StudentProfile.jsx
 * Student profile page — change name, password, and avatar.
 * Changes sync to Firestore through gameStore (updateStudent).
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getSession, clearSession, changePassword, defaultPassword } from '../lib/studentAuth';

export default function StudentProfile() {
  const navigate = useNavigate();
  const { id: studentId } = useParams();
  const { seasons, activeSeasonId, updateStudent } = useGameStore();
  const season = seasons[activeSeasonId];
  const student = season?.students?.find(s => s.id === studentId);

  // Guard: session check
  useEffect(() => {
    const sid = getSession();
    if (!sid || sid !== studentId) {
      navigate('/student', { replace: true });
    }
  }, [studentId, navigate]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [newName, setNewName] = useState(student?.name || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState({ type: '', text: '' });

  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPws, setShowPws] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  if (!student) {
    return (
      <div className="student-portal-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ color: '#d4af37', fontFamily: 'Cairo, sans-serif' }}>جاري التحميل...</p>
      </div>
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveName = async (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameMsg({ type: 'error', text: 'الاسم يجب أن يكون حرفين على الأقل' });
      return;
    }
    setNameLoading(true);
    try {
      await updateStudent(studentId, { name: trimmed });
      setNameMsg({ type: 'success', text: '✅ تم تحديث الاسم بنجاح' });
    } catch {
      setNameMsg({ type: 'error', text: 'فشل الحفظ، حاول مرة أخرى' });
    }
    setNameLoading(false);
    setTimeout(() => setNameMsg({ type: '', text: '' }), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'كلمة المرور الجديدة غير متطابقة' });
      return;
    }
    if (newPw.length < 4) {
      setPwMsg({ type: 'error', text: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' });
      return;
    }
    setPwLoading(true);
    const result = await changePassword(studentId, student.name, oldPw, newPw);
    setPwLoading(false);
    if (result.success) {
      setPwMsg({ type: 'success', text: '✅ تم تغيير كلمة المرور بنجاح' });
      setOldPw(''); setNewPw(''); setConfirmPw('');
    } else {
      setPwMsg({ type: 'error', text: result.error });
    }
    setTimeout(() => setPwMsg({ type: '', text: '' }), 4000);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg({ type: 'error', text: 'حجم الصورة يجب أن يكون أقل من 2 MB' });
      return;
    }
    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      try {
        await updateStudent(studentId, { avatar: dataUrl });
        setAvatarMsg({ type: 'success', text: '✅ تم تحديث الصورة بنجاح' });
      } catch {
        setAvatarMsg({ type: 'error', text: 'فشل الحفظ' });
      }
      setAvatarLoading(false);
      setTimeout(() => setAvatarMsg({ type: '', text: '' }), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setAvatarLoading(true);
    try {
      await updateStudent(studentId, { avatar: '' });
      setAvatarMsg({ type: 'success', text: '✅ تمت إزالة الصورة' });
    } catch {
      setAvatarMsg({ type: 'error', text: 'فشل الحذف' });
    }
    setAvatarLoading(false);
    setTimeout(() => setAvatarMsg({ type: '', text: '' }), 3000);
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const MsgBox = ({ msg }) => (
    <AnimatePresence>
      {msg.text && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            margin: '8px 0',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            textAlign: 'center',
            background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: msg.type === 'success' ? '#52d68a' : '#ef4444',
            fontFamily: 'Cairo, sans-serif',
          }}
        >
          {msg.text}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const InputField = ({ label, value, onChange, type = 'text', placeholder }) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ color: '#8a7a50', fontSize: '11px', display: 'block', marginBottom: '5px', fontFamily: 'Cairo, sans-serif' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px',
          background: 'rgba(212,175,55,0.06)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: '10px',
          color: '#e0d0a0', fontFamily: 'Cairo, sans-serif', fontSize: '14px',
          outline: 'none', direction: type === 'password' ? 'ltr' : 'rtl',
        }}
      />
    </div>
  );

  const SaveBtn = ({ loading, disabled, label = 'حفظ التغييرات' }) => (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      style={{
        width: '100%', padding: '11px',
        background: loading ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg, #d4af37, #b8860b)',
        border: 'none', borderRadius: '10px',
        color: loading ? '#8a7a50' : '#0a0602',
        fontSize: '14px', fontWeight: '800',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'Reem Kufi, serif',
        boxShadow: loading ? 'none' : '0 4px 14px rgba(212,175,55,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      }}
    >
      {loading ? (
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⏳</motion.span>
      ) : '💾'}
      {loading ? 'جاري الحفظ...' : label}
    </motion.button>
  );

  const cardStyle = {
    background: 'rgba(20,14,4,0.9)',
    border: '1px solid rgba(212,175,55,0.2)',
    borderRadius: '18px',
    padding: '22px',
    marginBottom: '16px',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden',
  };

  const cardAccent = {
    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
    background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
  };

  return (
    <div className="student-portal-bg scroll-ios" style={{ fontFamily: 'Cairo, sans-serif', paddingBottom: '60px' }}>

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,4,1,0.97)',
        borderBottom: '1px solid rgba(212,175,55,0.15)',
        backdropFilter: 'blur(12px)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button
          onClick={() => navigate(`/student/${studentId}`)}
          style={{
            background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '8px', padding: '6px 12px',
            color: '#d4af37', fontSize: '11px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
          }}
        >
          ← رجوع
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '14px', fontWeight: '700' }}>
            👤 إعدادات الحساب
          </div>
        </div>
        <button
          onClick={() => { clearSession(); navigate('/student'); }}
          style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', padding: '6px 10px',
            color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
          }}
        >
          خروج
        </button>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px' }}>

        {/* Avatar section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={cardStyle}
        >
          <div style={cardAccent} />
          <h3 style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '15px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📸 الصورة الشخصية
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Current avatar */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
              background: student.avatar ? 'transparent' : 'rgba(212,175,55,0.1)',
              border: '3px solid rgba(212,175,55,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {student.avatar ? (
                <img src={student.avatar} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '30px', color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontWeight: '700' }}>
                  {student.name.charAt(0)}
                </span>
              )}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                style={{
                  padding: '9px 16px',
                  background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '10px', color: '#d4af37', cursor: avatarLoading ? 'not-allowed' : 'pointer',
                  fontSize: '13px', fontFamily: 'Cairo, sans-serif', fontWeight: '600',
                }}
              >
                📁 {avatarLoading ? 'جاري الرفع...' : 'رفع صورة جديدة'}
              </motion.button>
              {student.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={avatarLoading}
                  style={{
                    padding: '7px 16px',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px', color: '#ef4444', cursor: 'pointer',
                    fontSize: '12px', fontFamily: 'Cairo, sans-serif',
                  }}
                >
                  🗑️ إزالة الصورة
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <p style={{ color: '#4a3a20', fontSize: '10px', margin: 0 }}>PNG / JPG / WEBP — أقل من 2 MB</p>
            </div>
          </div>
          <MsgBox msg={avatarMsg} />
        </motion.div>

        {/* Change name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={cardStyle}
        >
          <div style={cardAccent} />
          <h3 style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '15px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✏️ تغيير الاسم
          </h3>
          <form onSubmit={handleSaveName}>
            <InputField
              label="الاسم الجديد"
              value={newName}
              onChange={setNewName}
              placeholder="أدخل اسمك الكامل"
            />
            <p style={{ color: '#4a3a20', fontSize: '10px', marginBottom: '12px' }}>
              ⚠️ ملاحظة: تغيير الاسم سيؤثر على ما يظهر للشيخ في لوحة التحكم
            </p>
            <MsgBox msg={nameMsg} />
            <SaveBtn loading={nameLoading} disabled={!newName.trim() || newName.trim() === student.name} />
          </form>
        </motion.div>

        {/* Change password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={cardStyle}
        >
          <div style={cardAccent} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ color: '#d4af37', fontFamily: 'Reem Kufi, serif', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              🔐 تغيير كلمة المرور
            </h3>
            <button
              type="button"
              onClick={() => setShowPws(p => !p)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#5a4a30', fontSize: '11px', fontFamily: 'Cairo, sans-serif',
              }}
            >
              {showPws ? '🙈 إخفاء' : '👁️ إظهار'}
            </button>
          </div>
          <form onSubmit={handleChangePassword}>
            <InputField
              label="كلمة المرور الحالية"
              value={oldPw}
              onChange={setOldPw}
              type={showPws ? 'text' : 'password'}
              placeholder={`مثال: ${defaultPassword(student.name)}`}
            />
            <InputField
              label="كلمة المرور الجديدة"
              value={newPw}
              onChange={setNewPw}
              type={showPws ? 'text' : 'password'}
              placeholder="4 أحرف أو أكثر"
            />
            <InputField
              label="تأكيد كلمة المرور الجديدة"
              value={confirmPw}
              onChange={setConfirmPw}
              type={showPws ? 'text' : 'password'}
              placeholder="أعد الكتابة للتأكيد"
            />
            <p style={{ color: '#4a3a20', fontSize: '10px', marginBottom: '12px' }}>
              💡 كلمة المرور الافتراضية: اسمك الأول + 123 (مثال: {defaultPassword(student.name)})
            </p>
            <MsgBox msg={pwMsg} />
            <SaveBtn loading={pwLoading} disabled={!oldPw || !newPw || !confirmPw} label="تغيير كلمة المرور" />
          </form>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(212,175,55,0.04)',
            border: '1px solid rgba(212,175,55,0.12)',
            borderRadius: '14px',
            padding: '16px',
          }}
        >
          <h4 style={{ color: '#8a7a50', fontFamily: 'Cairo, sans-serif', fontSize: '12px', marginBottom: '10px' }}>
            ℹ️ معلومات الحساب (للقراءة فقط)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'المسار', value: student.pathId === 'path1' ? '🏛️ العراقي' : '⛵ الشامي' },
              { label: 'النقاط', value: `${student.points} نقطة` },
              { label: 'الإنجاز', value: `${student.progress.toFixed(1)}%` },
              { label: 'الترتيب', value: `#${student.currentRank}` },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(212,175,55,0.06)' }}>
                <span style={{ color: '#5a4a30', fontSize: '11px' }}>{item.label}</span>
                <span style={{ color: '#c8b890', fontSize: '12px', fontWeight: '600' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <p style={{ color: '#3a2a10', fontSize: '10px', marginTop: '10px', textAlign: 'center' }}>
            🔒 لا يمكن تعديل النقاط أو التقدم — يتحكم بها الشيخ فقط
          </p>
        </motion.div>

      </div>
    </div>
  );
}
