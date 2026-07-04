import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import MapEngine from '../components/MapEngine';
import AdminModal from '../components/AdminModal';
import StudentCard from '../components/StudentCard';
import confetti from 'canvas-confetti';

export default function MapView() {
  const { seasons, activeSeasonId } = useGameStore();
  const season = seasons[activeSeasonId];
  
  const students = season?.students || [];
  const prevStudentsRef = useRef(students);

  // Layout control (similar to the drawer in Snakes and Ladders)
  const [isPathsCollapsed, setIsPathsCollapsed] = useState(false);

  // Confetti Logic
  useEffect(() => {
    const prevStudents = prevStudentsRef.current;
    const newlyReached = students.filter(s => 
      s.hasJerusalemBadge && !prevStudents.find(ps => ps.id === s.id)?.hasJerusalemBadge
    );

    if (newlyReached.length > 0) {
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#d97706', '#ffffff', '#10b981'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#d97706', '#ffffff', '#10b981'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
    prevStudentsRef.current = students;
  }, [students]);

  const path1Students = students.filter(s => s.pathId === 'path1').sort((a,b) => b.progress - a.progress);
  const path2Students = students.filter(s => s.pathId === 'path2').sort((a,b) => b.progress - a.progress);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      backgroundColor: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)'
    }}>
      {/* Admin Modal Overlay */}
      <AdminModal />

      {/* Main Container */}
      <div style={{ flex: 1, height: '100%', display: 'flex', position: 'relative' }}>
        
        {/* RIGHT PANEL: Path 1 (المسار العراقي) */}
        {!isPathsCollapsed && (
          <div className="glass-panel" style={{
            width: '240px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border-color)',
            zIndex: 10,
            transition: 'all 0.3s'
          }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: 'rgba(13, 148, 136, 0.1)' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>المسار الأول</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>من البصرة إلى القدس</p>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem', alignContent: 'start' }}>
              {path1Students.map(student => (
                <StudentCard key={student.id} student={student} />
              ))}
              {path1Students.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.5 }}>لا يوجد فرسان</p>}
            </div>
          </div>
        )}

        {/* CENTER: Map */}
        <div style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
          {/* Top Control Bar */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none' }}>
            <button 
              onClick={() => setIsPathsCollapsed(!isPathsCollapsed)} 
              className="btn btn-secondary" 
              style={{ pointerEvents: 'auto', padding: '0.5rem 1rem' }}
            >
              {isPathsCollapsed ? '👥 إظهار المسارات' : '➡️ إخفاء المسارات'}
            </button>

            <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', textAlign: 'center', border: '1px solid var(--gold)', pointerEvents: 'auto', boxShadow: '0 4px 20px rgba(217, 119, 6, 0.2)' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)', margin: 0 }}>{season?.name}</h1>
            </div>
          </div>

          {/* Actual Map Engine */}
          <div style={{ flex: 1, position: 'relative' }}>
            <MapEngine />
          </div>
        </div>

        {/* LEFT PANEL: Path 2 (المسار الشامي) */}
        {!isPathsCollapsed && (
          <div className="glass-panel" style={{
            width: '240px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--border-color)',
            zIndex: 10,
            transition: 'all 0.3s'
          }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--blue)' }}>المسار الثاني</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>من صور إلى القدس</p>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem', alignContent: 'start' }}>
              {path2Students.map(student => (
                <StudentCard key={student.id} student={student} />
              ))}
              {path2Students.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.5 }}>لا يوجد فرسان</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
