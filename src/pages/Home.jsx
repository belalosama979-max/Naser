import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import SeasonSummary from '../components/SeasonSummary';

export default function Home() {
  const { seasons, createSeason, archiveSeason, setActiveSeason } = useGameStore();
  const navigate = useNavigate();

  const [isCreating, setIsCreating] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');

  const handleEnterSeason = (seasonId) => {
    setActiveSeason(seasonId);
    navigate('/map');
  };

  const handleArchiveSeason = (seasonId) => {
    if (window.confirm('هل أنت متأكد من أرشفة هذا الموسم؟ لا يمكن التراجع عن الأرشفة.')) {
      archiveSeason(seasonId);
    }
  };

  const handleCreateSeason = (e) => {
    e.preventDefault();
    if (!newSeasonName.trim()) return;
    createSeason(newSeasonName);
    setIsCreating(false);
    setNewSeasonName('');
  };

  // Convert seasons object to array
  const seasonsList = Object.values(seasons).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--bg-secondary)',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>📂 مواسم الفتوحات (النشطة والمؤرشفة)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            يمكنك إدارة عدة مواسم. كل موسم يحتفظ بطلابه ونقاطهم وتاريخ إنجازاتهم الخاصة.
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="btn btn-gold"
        >
          ➕ إضافة موسم جديد
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <form onSubmit={handleCreateSeason} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>اسم الموسم الجديد:</label>
            <input 
              type="text" 
              value={newSeasonName} 
              onChange={(e) => setNewSeasonName(e.target.value)} 
              className="form-input" 
              placeholder="مثال: موسم صلاح الدين" 
              autoFocus 
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">إنشاء</button>
          <button type="button" onClick={() => setIsCreating(false)} className="btn btn-secondary">إلغاء</button>
        </form>
      )}

      {/* Seasons Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {seasonsList.length > 0 ? (
          seasonsList.map((season) => (
            <SeasonSummary
              key={season.id}
              season={season}
              onEnter={handleEnterSeason}
              onArchive={handleArchiveSeason}
            />
          ))
        ) : (
          <div className="glass-panel" style={{
            padding: '4rem 2rem',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '3rem' }}>📁</span>
            <h3 style={{ marginTop: '1rem' }}>لا توجد مواسم حالية</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              لم يتم العثور على أي موسم. ابدأ بإنشاء أول موسم الآن!
            </p>
            <button 
              onClick={() => setIsCreating(true)}
              className="btn btn-gold"
            >
              ➕ إنشاء موسم أول
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
