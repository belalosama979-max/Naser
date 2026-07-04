import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SeasonSummary({ season, onEnter, onEdit, onArchive }) {
  const navigate = useNavigate();
  const students = season.students || [];
  const totalStudents = students.length;
  
  // Find leader
  const leader = students.slice().sort((a, b) => b.points - a.points)[0];
  
  // Average progress
  const averageProgress = totalStudents > 0 
    ? Math.round(students.reduce((sum, p) => sum + (p.progress || 0), 0) / totalStudents) 
    : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'غير معروف';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="glass-panel animate-room-card" style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      backgroundColor: season.status === 'archived' ? 'rgba(31, 41, 55, 0.25)' : 'rgba(17, 24, 39, 0.6)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s'
    }}>
      {/* القسم العلوي: تفاصيل الموسم */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              🏢 {season.name}
            </h2>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: season.status === 'archived' ? 'var(--danger-light)' : 'var(--success-light)',
              color: season.status === 'archived' ? 'var(--danger)' : 'var(--success)',
              fontWeight: 700
            }}>
              {season.status === 'archived' ? '🗄️ منتهي/مؤرشف' : '🟢 نشط'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <span>👥 الطلاب: <strong>{totalStudents}</strong></span>
            <span>👑 المتصدر: <strong style={{ color: 'var(--gold)' }}>{leader ? leader.name : 'لا يوجد'}</strong></span>
            <span>📅 تاريخ الإنشاء: <strong>{formatDate(season.createdAt)}</strong></span>
          </div>
        </div>

        {/* أزرار التحكم بالنسخة */}
        <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'center' }}>
          <button 
            onClick={() => onEnter(season.id)} 
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            🗺️ دخول للخريطة
          </button>
          {season.status !== 'archived' && (
            <button 
              onClick={() => onArchive(season.id)} 
              className="btn btn-secondary"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
            >
              🗄️ إنهاء وأرشفة
            </button>
          )}
        </div>
      </div>

      {/* نسبة إنجاز النسخة بالكامل */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
          <span>📈 نسبة إنجاز الموسم الإجمالية:</span>
          <span style={{ color: 'var(--primary-hover)' }}>{averageProgress}%</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ 
              width: `${averageProgress}%`, 
              backgroundColor: 'var(--primary)' 
            }}
          />
        </div>
      </div>

      {/* القسم السفلي: جدول اللاعبين التفصيلي */}
      <div style={{ marginTop: '0.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
          📋 قائمة تفاصيل تقدم الطلاب:
        </h4>
        
        {totalStudents > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem' }}>الترتيب</th>
                  <th style={{ padding: '0.5rem' }}>اسم الطالب</th>
                  <th style={{ padding: '0.5rem', color: '#93c5fd' }}>📍 النقاط</th>
                  <th style={{ padding: '0.5rem' }}>شريط التقدم والنسبة</th>
                </tr>
              </thead>
              <tbody>
                {students.map((player) => {
                  return (
                    <tr key={player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <span className="badge-silver" style={{
                          padding: '0.15rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}>
                          #{player.currentRank}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>
                        <img src={player.avatar || '/placeholder-avatar.png'} alt="" className="w-6 h-6 rounded-full inline-block ml-2 object-cover bg-gray-800" />
                        {player.name}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', fontWeight: 800, color: '#93c5fd' }}>
                        {player.points} ن
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', width: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="progress-bar-container" style={{ flex: 1, height: '6px' }}>
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${player.progress}%`,
                                backgroundColor: player.pathId === 'path2' ? '#2a7fc4' : '#2d9a5f'
                              }} 
                            />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', width: '32px', textAlign: 'left' }}>
                            {player.progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '1rem' }}>
            لا يوجد طلاب مضافون في هذا الموسم. أضف طلابًا لتبدأ الرحلة.
          </div>
        )}
      </div>
      
      <style>{`
        .animate-room-card {
          animation: roomCardFade 0.35s ease-out;
        }
        @keyframes roomCardFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
