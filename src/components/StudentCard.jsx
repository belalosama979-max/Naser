import React from 'react';

export default function StudentCard({ student }) {
  // Use path color or fallback to gold/primary
  let baseColor = student.pathId === 'path2' ? 'var(--blue)' : 'var(--primary)';
  
  if (student.hasJerusalemBadge) {
    baseColor = 'var(--gold)';
  }

  return (
    <div 
      className="referee-card" 
      style={{
        backgroundColor: baseColor,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: student.hasJerusalemBadge ? '0 0 15px rgba(217, 119, 6, 0.4)' : '0 6px 12px rgba(0,0,0,0.2)',
        color: '#fff',
        width: '100px',
        height: '140px',
        margin: '0 auto'
      }}
    >
      <span className="referee-card-category" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        {student.hasJerusalemBadge ? '🏆 بطل القدس' : `ترتيب: ${student.currentRank}`}
      </span>
      
      <div style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
        {student.avatar ? (
          <img src={student.avatar} alt={student.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)' }} />
        ) : (
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {student.name.substring(0, 1)}
          </div>
        )}
      </div>

      <strong className="referee-card-name" style={{ fontSize: '0.75rem', lineHeight: '1.1' }}>
        {student.name}
      </strong>
      
      <span className="referee-card-value" style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', marginTop: 'auto' }}>
        {student.points} ن
      </span>
      
      <div style={{ width: '80%', height: '4px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '2px', marginTop: '0.35rem' }}>
        <div style={{ height: '100%', width: `${student.progress}%`, backgroundColor: '#fff', borderRadius: '2px' }} />
      </div>
    </div>
  );
}
