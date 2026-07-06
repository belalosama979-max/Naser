/**
 * AdminPanel.jsx
 * Full admin control panel:
 *  - Add/Edit/Delete students (with photo upload)
 *  - Grant/Deduct points (3 card types, + and -)
 *  - Settings (target points, game name)
 *  - Audit log
 */

import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit3, Plus, Award, Settings, FileText, ChevronRight, X, Check, Users, Target, Map } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getPathColor, pathsData } from '../utils/pathsData';

// ─── Tab Configuration ─────────────────────────────────────────
const TABS = [
  { id: 'points',     label: 'منح النقاط',       icon: Award },
  { id: 'students',   label: 'إدارة الطلاب',   icon: Users },
  { id: 'nodepoints', label: 'نقاط المحطات',   icon: Map },
  { id: 'settings',   label: 'الإعدادات',      icon: Settings },
  { id: 'log',        label: 'سجل العمليات', icon: FileText },
];

const CARD_TYPES = [
  { value: 'العبادات', label: 'العبادات', emoji: '🕌', color: '#2d9a5f' },
  { value: 'دوام المركز', label: 'دوام المركز', emoji: '📅', color: '#2a7fc4' },
  { value: 'المهام', label: 'المهام', emoji: '✅', color: '#c49a1a' },
  { value: 'المهمة الأسبوعية', label: 'المهمة الأسبوعية', emoji: '⭐', color: '#8e44ad' },
];

// ─── Avatar Upload Helper ──────────────────────────────────────
function AvatarUploader({ currentAvatar, onUpload, studentName = '' }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميغابايت');
      return;
    }
    try {
      const { compressImage } = await import('../utils/imageCompressor');
      const compressedDataUrl = await compressImage(file, 200, 200, 0.7);
      onUpload(compressedDataUrl);
    } catch (e) {
      console.error("Image compression failed", e);
      alert('حدث خطأ أثناء معالجة الصورة');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {/* Preview */}
      <div
        style={{
          width: '72px', height: '72px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid rgba(212,175,55,0.4)',
          background: '#1a1208',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {currentAvatar ? (
          <img src={currentAvatar} alt="avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '22px', fontFamily: 'Cairo, sans-serif', fontWeight: '700', color: '#d4af37' }}>
            {studentName.charAt(0) || '؟'}
          </span>
        )}
      </div>

      {/* Upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          processFile(e.dataTransfer.files[0]);
        }}
        style={{
          flex: 1,
          border: `2px dashed ${dragging ? 'rgba(212,175,55,0.7)' : 'rgba(212,175,55,0.25)'}`,
          borderRadius: '10px',
          padding: '14px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(212,175,55,0.06)' : 'rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
        }}
      >
        <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '12px', color: '#8a7050', marginBottom: '4px' }}>
          📸 اسحب الصورة هنا أو انقر للاختيار
        </p>
        <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '10px', color: '#4a3a20' }}>
          PNG, JPG, WEBP — حد أقصى 5MB
        </p>
        {currentAvatar && (
          <button
            onClick={e => { e.stopPropagation(); onUpload(''); }}
            style={{
              marginTop: '6px',
              background: 'rgba(180,30,30,0.2)',
              border: '1px solid rgba(180,30,30,0.4)',
              borderRadius: '6px',
              padding: '3px 10px',
              color: '#e05050',
              fontFamily: 'Cairo, sans-serif',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            ✕ حذف الصورة
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => processFile(e.target.files[0])}
      />
    </div>
  );
}

// ─── Points Tab ────────────────────────────────────────────────
function PointsTab({ students, settings }) {
  const { addPoints } = useGameStore();
  const [selectedId, setSelectedId] = useState('');
  const [cardType, setCardType] = useState('العبادات');
  const [pointsInput, setPointsInput] = useState('');
  const [isDeduct, setIsDeduct] = useState(false);
  const [success, setSuccess] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const positiveMessages = ["والله جدع", "قوي", "أسطوري", "الله يحفظك", "تبارك الرحمن"];
  const negativeMessages = ["الله يهديك", "الله يصلحك", "لا حول ولا قوة إلا بالله", "أحزنني"];

  const selectedStudent = students.find(s => s.id === selectedId);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Student Selector */}
      <section className="card-historical" style={{ padding: '20px' }}>
        <h3 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '15px', color: '#d4af37', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={16} /> اختر الطالب
        </h3>

        {/* Visual student grid (if students exist) */}
        {students.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '8px',
            maxHeight: '240px',
            overflowY: 'auto',
          }} className="custom-scroll">
            {[...students].sort((a, b) => a.currentRank - b.currentRank).map(s => {
              const pathColor = getPathColor(s.pathId);
              const isSelected = selectedId === s.id;
              return (
                <motion.button
                  key={s.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedId(s.id)}
                  style={{
                    background: isSelected
                      ? `rgba(${s.pathId === 'path1' ? '45,154,95' : '42,127,196'},0.25)`
                      : 'rgba(10,8,3,0.6)',
                    border: `1.5px solid ${isSelected ? (s.pathId === 'path1' ? '#2d9a5f' : '#2a7fc4') : 'rgba(212,175,55,0.12)'}`,
                    borderRadius: '10px',
                    padding: '10px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    overflow: 'hidden',
                    border: `2px solid ${isSelected ? (s.pathId === 'path1' ? '#2d9a5f' : '#2a7fc4') : 'rgba(212,175,55,0.2)'}`,
                    background: '#1a1208',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {s.avatar
                      ? <img src={s.avatar} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '14px', fontWeight: '700', color: pathColor.bright, fontFamily: 'Cairo' }}>{s.name.charAt(0)}</span>
                    }
                  </div>
                  <span style={{
                    fontFamily: 'Cairo, sans-serif',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isSelected ? '#f0d060' : '#8a7050',
                    textAlign: 'center',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}>
                    {s.name.split(' ')[0]}
                  </span>
                  <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '9px', color: pathColor.bright }}>
                    {s.points} نق.
                  </span>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', color: '#4a3a20', textAlign: 'center', padding: '20px' }}>
            لا يوجد طلاب مسجّلون بعد
          </p>
        )}
      </section>

      {/* Card Type + Points Form */}
      <section className="card-historical" style={{ padding: '20px' }}>
        <h3 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '15px', color: '#d4af37', marginBottom: '14px' }}>
          🃏 نوع البطاقة والنقاط
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Card type selection */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CARD_TYPES.map(ct => (
              <button
                key={ct.value}
                type="button"
                onClick={() => setCardType(ct.value)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  borderRadius: '10px',
                  border: `1.5px solid ${cardType === ct.value ? ct.color : 'rgba(212,175,55,0.15)'}`,
                  background: cardType === ct.value ? `${ct.color}25` : 'rgba(10,8,3,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '20px' }}>{ct.emoji}</span>
                <span style={{
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: cardType === ct.value ? '#f0d060' : '#6a5a40',
                }}>
                  {ct.label}
                </span>
              </button>
            ))}
          </div>

          {/* Points input + positive/negative toggle */}
          <div className="flex flex-col md:flex-row gap-4 md:items-end mb-4">
            {/* Toggle +/- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontFamily: 'Cairo, sans-serif', fontSize: '11px', color: '#6a5a40' }}>
                النوع
              </label>
              <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.25)' }}>
                <button
                  type="button"
                  onClick={() => setIsDeduct(false)}
                  style={{
                    padding: '8px 14px',
                    background: !isDeduct ? 'rgba(45,154,95,0.3)' : 'rgba(0,0,0,0.4)',
                    border: 'none',
                    color: !isDeduct ? '#52d68a' : '#5a4a2a',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >+</button>
                <button
                  type="button"
                  onClick={() => setIsDeduct(true)}
                  style={{
                    padding: '8px 14px',
                    background: isDeduct ? 'rgba(180,30,30,0.3)' : 'rgba(0,0,0,0.4)',
                    border: 'none',
                    color: isDeduct ? '#e05050' : '#5a4a2a',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >−</button>
              </div>
            </div>

            {/* Points input */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontFamily: 'Cairo, sans-serif', fontSize: '11px', color: '#6a5a40', marginBottom: '4px' }}>
                عدد النقاط
              </label>
              <input
                type="number"
                className="input-historical"
                value={pointsInput}
                onChange={e => setPointsInput(e.target.value)}
                min="1"
                placeholder="مثال: 50"
                required
                style={{ textAlign: 'center', fontSize: '20px', fontWeight: '700' }}
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={!selectedId || !pointsInput}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                opacity: (!selectedId || !pointsInput) ? 0.4 : 1,
                cursor: (!selectedId || !pointsInput) ? 'not-allowed' : 'pointer',
              }}
            >
              {success ? <Check size={18} /> : 'تطبيق'}
            </motion.button>
          </div>

          {/* Selected student preview */}
          {selectedStudent && (
            <div style={{
              background: feedback ? (feedback.isPositive ? 'rgba(45,154,95,0.2)' : 'rgba(180,30,30,0.2)') : 'rgba(0,0,0,0.3)',
              border: `1px solid ${feedback ? (feedback.isPositive ? '#2d9a5f' : '#e05050') : 'rgba(212,175,55,0.15)'}`,
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    overflow: 'hidden', background: '#1a1208',
                    border: `1.5px solid ${getPathColor(selectedStudent.pathId).primary}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selectedStudent.avatar
                      ? <img src={selectedStudent.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '12px', fontWeight: '700', color: getPathColor(selectedStudent.pathId).bright, fontFamily: 'Cairo' }}>{selectedStudent.name.charAt(0)}</span>
                    }
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', color: '#f0d060', fontWeight: '700' }}>
                      {selectedStudent.name}
                    </p>
                    <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '10px', color: '#5a4a2a' }}>
                      {selectedStudent.points.toLocaleString('ar')} نقطة • {selectedStudent.progress.toFixed(2)}%
                    </p>
                  </div>
                </div>
                {pointsInput && (
                  <div style={{
                    fontFamily: 'Cairo, sans-serif',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: isDeduct ? '#e05050' : '#52d68a',
                  }}>
                    {isDeduct ? '−' : '+'}{pointsInput}
                  </div>
                )}
              </div>
              
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    textAlign: 'center',
                    fontFamily: 'Reem Kufi, serif',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: feedback.isPositive ? '#52d68a' : '#e05050',
                    paddingTop: '8px',
                    borderTop: `1px dashed ${feedback.isPositive ? 'rgba(45,154,95,0.4)' : 'rgba(180,30,30,0.4)'}`
                  }}
                >
                  {feedback.message}
                </motion.div>
              )}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

// ─── Students Tab ─────────────────────────────────────────────
function StudentsTab({ students }) {
  const { addStudent, deleteStudent, updateStudent } = useGameStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);

  // Add form state
  const [newName, setNewName] = useState('');
  const [newPath, setNewPath] = useState('path1');
  const [newAvatar, setNewAvatar] = useState('');

  // Edit state
  const [editData, setEditData] = useState({});

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addStudent({ name: newName.trim(), pathId: newPath, avatar: newAvatar });
    setNewName(''); setNewPath('path1'); setNewAvatar(''); setShowAdd(false);
  };

  const handleSaveEdit = (id) => {
    updateStudent(id, editData);
    setEditId(null);
    setEditData({});
  };

  const handleStartEdit = (student) => {
    setEditId(student.id);
    setEditData({ name: student.name, pathId: student.pathId, avatar: student.avatar });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`هل تريد حذف الطالب "${name}"؟ لا يمكن التراجع.`)) {
      deleteStudent(id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header + Add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '16px', color: '#d4af37' }}>
          الطلاب ({students.length})
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn btn-primary"
          style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} /> إضافة طالب
        </button>
      </div>

      {/* Add Student Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card-historical"
            style={{ padding: '20px', overflow: 'hidden' }}
          >
            <h4 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '14px', color: '#c49a1a', marginBottom: '16px' }}>
              طالب جديد
            </h4>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <AvatarUploader
                currentAvatar={newAvatar}
                onUpload={setNewAvatar}
                studentName={newName}
              />
              <div className="flex flex-col md:flex-row gap-3">
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontFamily: 'Cairo, sans-serif', fontSize: '11px', color: '#6a5a40', marginBottom: '4px' }}>
                    اسم الطالب *
                  </label>
                  <input
                    className="input-historical"
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="الاسم الكامل..."
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontFamily: 'Cairo, sans-serif', fontSize: '11px', color: '#6a5a40', marginBottom: '4px' }}>
                    المسار
                  </label>
                  <select className="select-historical" value={newPath} onChange={e => setNewPath(e.target.value)}>
                    <option value="path1">المسار الأول — العراقي</option>
                    <option value="path2">المسار الثاني — الشامي</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '9px 22px', fontSize: '13px' }}>
                  <Check size={14} /> إضافة
                </button>
                <button type="button" onClick={() => { setShowAdd(false); setNewName(''); setNewAvatar(''); }}
                  className="btn btn-secondary" style={{ padding: '9px 18px', fontSize: '13px' }}>
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Students List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {students.length === 0 ? (
          <div className="card-historical" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', color: '#4a3a20' }}>
              لا يوجد طلاب بعد. أضف أول طالب!
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {[...students].sort((a, b) => a.currentRank - b.currentRank).map(student => {
              const isEditing = editId === student.id;
              const pathColor = getPathColor(student.pathId);

              return (
                <motion.div
                  key={student.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card-historical"
                  style={{ padding: '14px 16px' }}
                >
                  {isEditing ? (
                    /* Edit mode */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <AvatarUploader
                        currentAvatar={editData.avatar}
                        onUpload={v => setEditData(d => ({ ...d, avatar: v }))}
                        studentName={editData.name}
                      />
                      <div className="flex flex-col md:flex-row gap-3">
                        <input
                          className="input-historical w-full md:flex-2"
                          value={editData.name || ''}
                          onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                          placeholder="اسم الطالب"
                        />
                        <select
                          className="select-historical"
                          value={editData.pathId || 'path1'}
                          onChange={e => setEditData(d => ({ ...d, pathId: e.target.value }))}
                          style={{ flex: 1 }}
                        >
                          <option value="path1">المسار العراقي</option>
                          <option value="path2">المسار الشامي</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleSaveEdit(student.id)} className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '12px' }}>
                          <Check size={13} /> حفظ
                        </button>
                        <button onClick={() => { setEditId(null); setEditData({}); }} className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '12px' }}>
                          <X size={13} /> إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Rank */}
                      <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', fontWeight: '800', color: '#4a3a20', minWidth: '24px', textAlign: 'center' }}>
                        #{student.currentRank}
                      </span>

                      {/* Avatar */}
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        overflow: 'hidden', border: `2px solid ${pathColor.primary}`,
                        background: '#1a1208', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {student.avatar
                          ? <img src={student.avatar} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '14px', fontWeight: '700', color: pathColor.bright, fontFamily: 'Cairo' }}>{student.name.charAt(0)}</span>
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '14px', fontWeight: '700', color: '#f0d060' }}>
                            {student.name}
                          </span>
                          {student.hasJerusalemBadge && <span title="فاتح القدس">🌟</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                          <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '10px', color: '#6a5a40' }}>
                            {student.points.toLocaleString('ar')} نقطة
                          </span>
                          <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '10px', color: '#5a4a30' }}>|</span>
                          <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '10px', color: '#6a5a40' }}>
                            {student.progress.toFixed(2)}%
                          </span>
                          <span style={{
                            fontFamily: 'Cairo, sans-serif',
                            fontSize: '10px',
                            color: pathColor.bright,
                            background: `${pathColor.primary}20`,
                            border: `1px solid ${pathColor.primary}30`,
                            borderRadius: '8px',
                            padding: '0 6px',
                          }}>
                            {pathColor.label}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          onClick={() => handleStartEdit(student)}
                          style={{
                            background: 'rgba(42,127,196,0.15)',
                            border: '1px solid rgba(42,127,196,0.3)',
                            borderRadius: '7px',
                            padding: '6px 10px',
                            color: '#60b4f5',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.15s',
                          }}
                          title="تعديل"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="btn btn-danger"
                          style={{ padding: '6px 10px' }}
                          title="حذف"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── Settings Tab ──────────────────────────────────────────────
function SettingsTab() {
  const { settings, updateSettings, updateTargetPoints } = useGameStore();
  const [localTarget, setLocalTarget] = useState(settings.targetPoints);
  const [localName, setLocalName] = useState(settings.gameName);
  const [localYear, setLocalYear] = useState(settings.academicYear);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateTargetPoints(localTarget);
    updateSettings({ gameName: localName, academicYear: localYear });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '560px' }}>
      <section className="card-historical" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '16px', color: '#d4af37', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={16} /> إعدادات اللعبة
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Points */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Cairo, sans-serif', fontSize: '12px', color: '#8a7050', marginBottom: '6px' }}>
              <Target size={12} style={{ display: 'inline', marginLeft: '4px' }} />
              نقاط الوصول إلى القدس
            </label>
            <input
              className="input-historical"
              type="number"
              min="100"
              max="100000"
              value={localTarget}
              onChange={e => setLocalTarget(parseInt(e.target.value) || 1000)}
              style={{ maxWidth: '200px', textAlign: 'center', fontSize: '18px', fontWeight: '700' }}
            />
            <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '10px', color: '#4a3a20', marginTop: '4px' }}>
              الطلاب الذين يصلون لهذه النقاط يُعتبرون فاتحين للقدس
            </p>
          </div>

          {/* Game Name */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Cairo, sans-serif', fontSize: '12px', color: '#8a7050', marginBottom: '6px' }}>
              اسم الموسم
            </label>
            <input
              className="input-historical"
              type="text"
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              placeholder="اسم الموسم الحالي..."
            />
          </div>

          {/* Academic Year */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Cairo, sans-serif', fontSize: '12px', color: '#8a7050', marginBottom: '6px' }}>
              العام الدراسي
            </label>
            <input
              className="input-historical"
              type="text"
              value={localYear}
              onChange={e => setLocalYear(e.target.value)}
              placeholder="مثال: 2025 - 2026"
              style={{ maxWidth: '220px' }}
            />
          </div>

          <button
            onClick={handleSave}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {saved ? <><Check size={15} /> تم الحفظ!</> : <><Settings size={15} /> حفظ الإعدادات</>}
          </button>
        </div>
      </section>

      {/* Current settings preview */}
      <section className="card-historical" style={{ padding: '20px' }}>
        <h4 style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', color: '#6a5a40', marginBottom: '12px' }}>
          الإعدادات الحالية
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'نقاط القدس', value: settings.targetPoints.toLocaleString('ar') + ' نقطة', color: '#d4af37' },
            { label: 'اسم الموسم', value: settings.gameName, color: '#c8b890' },
            { label: 'العام الدراسي', value: settings.academicYear, color: '#c8b890' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
              <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '12px', color: '#5a4a2a' }}>{item.label}:</span>
              <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '12px', color: item.color, fontWeight: '700' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Audit Log Tab ────────────────────────────────────────────
function AuditLogTab({ season, students }) {
  const log = season?.auditLog || [];
  const { undoAction } = useGameStore();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '16px', color: '#d4af37' }}>
          سجل العمليات ({log.length})
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}
        className="custom-scroll">
        {log.length === 0 ? (
          <div className="card-historical" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', color: '#4a3a20' }}>
              لا توجد عمليات بعد
            </p>
          </div>
        ) : (
          log.map(entry => {
            const isPositive = entry.pointsDelta > 0;
            const cardConfig = CARD_TYPES.find(c => c.value === entry.cardType);
            return (
              <div
                key={entry.id}
                className="card-historical"
                style={{
                  padding: '12px 16px',
                  borderRightWidth: '3px',
                  borderRightColor: isPositive ? '#2d9a5f' : '#c03030',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', fontWeight: '700', color: 'var(--text-gold, #f0d060)' }}>
                      {entry.studentName}
                    </span>
                    <span style={{
                      fontFamily: 'Cairo, sans-serif',
                      fontSize: '10px',
                      color: 'var(--text-secondary, #6a5a40)',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}>
                      {cardConfig?.emoji} {entry.cardType}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'Cairo, sans-serif',
                    fontSize: '10px',
                    color: 'var(--text-muted, #4a3a20)',
                    marginTop: '4px',
                  }}>
                    {new Date(entry.timestamp).toLocaleString('ar-SA', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    fontFamily: 'Cairo, sans-serif',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: isPositive ? '#52d68a' : '#e05050',
                  }}>
                    {isPositive ? '+' : ''}{entry.pointsDelta}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من التراجع عن هذه العملية؟')) {
                        undoAction(entry.id);
                      }
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 'bold',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.25)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
                  >
                    تراجع
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Node Points Tab ──────────────────────────────────────────
function NodePointsTab() {
  const { settings, updateAllNodePoints } = useGameStore();
  const nodePoints = settings.nodePoints || {};
  const [localPoints, setLocalPoints] = React.useState({ ...nodePoints });
  const [saved, setSaved] = React.useState(false);

  const path1Nodes = pathsData.path1.filter(n => n.id !== 'dest');
  const path2Nodes = pathsData.path2.filter(n => n.id !== 'dest');

  const handleChange = (nodeId, val) => {
    setLocalPoints(prev => ({ ...prev, [nodeId]: Math.max(0, parseInt(val) || 0) }));
  };

  const handleSaveAll = () => {
    updateAllNodePoints(localPoints);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderRow = (node, pathColor) => (
    <div key={node.id} style={{
      display: 'flex', alignItems: 'center',
      gap: '12px', padding: '7px 10px',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '8px',
      border: '1px solid rgba(212,175,55,0.06)',
    }}>
      <div style={{
        width: '10px', height: '10px', borderRadius: '50%',
        background: node.type === 'main' ? pathColor.primary : 'rgba(180,150,60,0.3)',
        flexShrink: 0,
      }} />
      <span style={{
        flex: 1, fontFamily: 'Cairo, sans-serif', fontSize: '12px',
        color: node.type === 'main' ? '#c8b890' : '#7a6a50',
        fontWeight: node.type === 'main' ? '700' : '400',
      }}>
        {node.name}
        {node.type === 'sub' && (
          <span style={{ fontSize: '9px', color: '#4a3a20', marginRight: '4px' }}>(فرعية)</span>
        )}
      </span>
      <input
        type="number" min="0" max="100000"
        value={localPoints[node.id] ?? 0}
        onChange={e => handleChange(node.id, e.target.value)}
        style={{
          width: '80px', padding: '5px 8px',
          background: 'rgba(10,7,2,0.8)',
          border: `1px solid ${pathColor.primary}40`,
          borderRadius: '6px', color: '#f0d060',
          fontSize: '13px', fontWeight: '700',
          fontFamily: 'Cairo, sans-serif', textAlign: 'center', outline: 'none',
        }}
      />
      <span style={{ fontSize: '10px', color: '#4a3a20', fontFamily: 'Cairo, sans-serif', minWidth: '30px' }}>
        نقطة
      </span>
    </div>
  );

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '16px', color: '#d4af37' }}>
            📍 نقاط المحطات
          </h3>
          <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: '11px', color: '#5a4a30', marginTop: '4px' }}>
            حدد عدد النقاط المطلوبة للوصول إلى كل محطة — تظهر بجانب اسم المدينة على الخريطة
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px' }}
        >
          {saved ? <><Check size={14} /> تم الحفظ!</> : <><Map size={14} /> حفظ التغييرات</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Iraqi Path */}
        <section className="card-historical" style={{ padding: '18px' }}>
          <h4 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '14px', color: '#52d68a', marginBottom: '12px' }}>
            ⚖️ المسار العراقي — من البصرة
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {path1Nodes.map(n => renderRow(n, { primary: '#2d9a5f', bright: '#52d68a' }))}
          </div>
        </section>

        {/* Levantine Path */}
        <div>
          <section className="card-historical" style={{ padding: '18px', marginBottom: '14px' }}>
            <h4 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '14px', color: '#60b4f5', marginBottom: '12px' }}>
              ⛵ المسار الشامي — من صور
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {path2Nodes.map(n => renderRow(n, { primary: '#2a7fc4', bright: '#60b4f5' }))}
            </div>
          </section>

          {/* Jerusalem separately */}
          <section className="card-historical" style={{ padding: '14px' }}>
            <h4 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '13px', color: '#d4af37', marginBottom: '10px' }}>
              🕌 القدس — الهدف النهائي
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', color: '#d4af37', fontWeight: '700', flex: 1 }}>
                القدس (فتح القدس)
              </span>
              <input
                type="number" min="0" max="100000"
                value={localPoints['dest'] ?? 1000}
                onChange={e => handleChange('dest', e.target.value)}
                style={{
                  width: '90px', padding: '6px 10px',
                  background: 'rgba(212,175,55,0.08)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: '8px', color: '#d4af37',
                  fontSize: '16px', fontWeight: '800',
                  fontFamily: 'Cairo, sans-serif',
                  textAlign: 'center', outline: 'none',
                }}
              />
              <span style={{ fontSize: '10px', color: '#5a4a30', fontFamily: 'Cairo, sans-serif' }}>
                = هدف الوصول
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('points');
  const { seasons, activeSeasonId, settings } = useGameStore();
  const season = seasons[activeSeasonId];
  const students = season?.students || [];
  
  const theme = settings.theme || 'dark';
  const toggleTheme = useGameStore(state => state.toggleTheme);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--admin-bg)',
        direction: 'rtl',
      }}
    >
      {/* ── Top Header ─────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 md:px-6 z-50 flex-wrap gap-2 py-2 md:py-0"
        style={{
          minHeight: '56px',
          background: 'var(--header-bg)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-gold-alpha)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>⚙️</span>
          <h1 style={{ fontFamily: 'Reem Kufi, serif', fontSize: '18px', color: 'var(--text-gold)', fontWeight: '700' }}>
            لوحة تحكم المشرف
          </h1>
          <span style={{
            background: 'var(--border-gold-alpha)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '3px 12px',
            fontFamily: 'Cairo, sans-serif',
            fontSize: '11px',
            color: 'var(--text-gold)',
          }}>
            {settings.gameName}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ padding: '7px 12px', fontSize: '13px' }}
          >
            {theme === 'light' ? '🌙 عاتم' : '💡 مضيء'}
          </button>
          <button
            onClick={() => navigate('/game')}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🗺️ الخريطة
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            style={{ padding: '7px 14px', fontSize: '13px' }}
          >
            🏠 الرئيسية
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* Side Navigation */}
        <nav 
          className="w-full md:w-[200px] md:min-w-[200px] flex md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden p-3 md:p-5"
          style={{
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(10px)',
            borderLeft: '1px solid var(--border-gold-alpha)',
          }}
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  minWidth: 'fit-content',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${isActive ? 'var(--gold)' : 'transparent'}`,
                  background: isActive ? 'var(--border-gold-alpha)' : 'transparent',
                  color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'right',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    style={{
                      marginRight: 'auto',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: 'var(--gold)',
                    }}
                  />
                )}
              </motion.button>
            );
          })}

          {/* Stats divider */}
          <div className="hidden md:block" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-gold-alpha)' }}>
            {[
              { label: 'إجمالي الطلاب', value: students.length, color: '#d4af37' },
              { label: 'العمليات اليوم', value: (season?.auditLog || []).filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length, color: '#52d68a' },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '6px 14px', marginBottom: '4px' }}>
                <div style={{ fontFamily: 'Cairo, sans-serif', fontSize: '18px', fontWeight: '800', color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: 'Cairo, sans-serif', fontSize: '9px', color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
        }} className="custom-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'points' && (
                <PointsTab students={students} settings={useGameStore.getState().settings} />
              )}
              {activeTab === 'students' && (
                <StudentsTab students={students} />
              )}
              {activeTab === 'nodepoints' && (
                <NodePointsTab />
              )}
              {activeTab === 'settings' && (
                <SettingsTab />
              )}
              {activeTab === 'log' && (
                <AuditLogTab season={season} students={students} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
