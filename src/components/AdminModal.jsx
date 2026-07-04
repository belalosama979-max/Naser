import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Trophy, Award, Trash2, Edit, Plus, X } from 'lucide-react';

export default function AdminModal() {
  const { 
    seasons, 
    activeSeasonId, 
    addStudent, 
    deleteStudent, 
    addPoints, 
    updateSettings, 
    settings,
    isAdminModalOpen,
    setAdminModalOpen
  } = useGameStore();

  const season = seasons[activeSeasonId];
  
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPath, setNewStudentPath] = useState('path1');
  
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [cardType, setCardType] = useState('العبادات');
  const [pointsInput, setPointsInput] = useState('');
  const [isDeduct, setIsDeduct] = useState(false);

  if (!isAdminModalOpen) return null;

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    addStudent({ name: newStudentName, pathId: newStudentPath });
    setNewStudentName('');
  };

  const handleAddPoints = (e) => {
    e.preventDefault();
    const pts = parseInt(pointsInput);
    if (!selectedStudentId || isNaN(pts) || pts <= 0) return;
    const delta = isDeduct ? -pts : pts;
    addPoints(selectedStudentId, delta, cardType, 'المشرف');
    setPointsInput('');
  };

  const students = season?.students || [];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>🛠️ لوحة المشرف لإدارة المعركة</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>الموسم الحالي: {season?.name}</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>الهدف (نقاط القدس):</span>
              <input 
                type="number" 
                value={settings.targetPoints}
                onChange={(e) => updateSettings({ targetPoints: parseInt(e.target.value) || 1000 })}
                className="form-input"
                style={{ width: '80px', padding: '0.25rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--gold)' }}
              />
            </div>
            <button 
              onClick={() => setAdminModalOpen(false)}
              className="btn btn-danger"
              style={{ padding: '0.5rem' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Right Area: Students & Points */}
          <div style={{ flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
            
            {/* Add Points Panel */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Award size={20} /> منح النقاط للفرسان
              </h3>
              <form onSubmit={handleAddPoints} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>اختر الفارس</label>
                  <select 
                    className="form-input"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                  >
                    <option value="">-- اختر من القائمة --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.points} ن) - {s.pathId === 'path1' ? 'عراقي' : 'شامي'}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ width: '150px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>نوع المكافأة</label>
                  <select 
                    className="form-input"
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value)}
                  >
                    <option value="العبادات">العبادات</option>
                    <option value="دوام المركز">دوام المركز</option>
                    <option value="المهام">المهام</option>
                    <option value="المهمة الأسبوعية">المهمة الأسبوعية</option>
                  </select>
                </div>

                <div style={{ width: '80px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>العملية</label>
                  <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', height: '38px' }}>
                    <button type="button" onClick={() => setIsDeduct(false)} style={{ flex: 1, background: !isDeduct ? 'var(--success)' : 'var(--bg-tertiary)', color: !isDeduct ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                    <button type="button" onClick={() => setIsDeduct(true)} style={{ flex: 1, background: isDeduct ? 'var(--danger)' : 'var(--bg-tertiary)', color: isDeduct ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>−</button>
                  </div>
                </div>

                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>النقاط</label>
                  <input 
                    type="number" 
                    className="form-input"
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                    min="1"
                    required
                    placeholder="+0"
                    style={{ textAlign: 'center', fontWeight: 'bold' }}
                  />
                </div>

                <button type="submit" className="btn btn-gold" style={{ padding: '0.75rem 2rem' }}>
                  اعتماد
                </button>
              </form>
            </div>

            {/* Manage Students */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>قائمة الفرسان ({students.length})</h3>
              
              <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <input 
                    type="text" 
                    placeholder="اسم الفارس الجديد..." 
                    className="form-input"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ width: '200px' }}>
                  <select 
                    className="form-input"
                    value={newStudentPath}
                    onChange={(e) => setNewStudentPath(e.target.value)}
                  >
                    <option value="path1">المسار الأول (العراقي)</option>
                    <option value="path2">المسار الثاني (الشامي)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={18} /> إضافة
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
                {students.map(student => (
                  <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {student.name.substring(0, 2)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '1rem' }}>{student.name}</p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          <span style={{ color: student.pathId === 'path1' ? '#10b981' : '#3b82f6' }}>{student.pathId === 'path1' ? 'مسار عراقي' : 'مسار شامي'}</span>
                          <span>النقاط: <strong style={{ color: 'var(--gold)' }}>{student.points}</strong></span>
                          <span>التقدم: {student.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { if(confirm('تأكيد الحذف؟')) deleteStudent(student.id) }} className="btn btn-danger" style={{ padding: '0.5rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Left Area: Audit Log */}
          <div style={{ flex: 1, padding: '1.5rem', borderLeft: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>سجل العمليات الأخير</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {season?.auditLog?.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد حركات بعد.</div>
              ) : (
                season?.auditLog?.map(log => {
                  const s = students.find(st => st.id === log.studentId);
                  return (
                    <div key={log.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', borderRight: '4px solid var(--primary)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{s ? s.name : 'فارس محذوف'}</strong>
                        <span style={{ color: log.pointsDelta > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                          {log.pointsDelta > 0 ? '+' : ''}{log.pointsDelta}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>{log.cardType}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
