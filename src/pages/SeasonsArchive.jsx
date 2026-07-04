import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Archive, Search } from 'lucide-react';

export default function SeasonsArchive() {
  const { seasons, activeSeasonId } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Get archived seasons (all seasons except the active one, or keep all to view history)
  const archivedSeasons = Object.values(seasons).filter(s => s.id !== activeSeasonId).sort((a,b) => b.createdAt - a.createdAt);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-[var(--color-outline-variant)] pb-4 gap-4">
        <div>
          <h1 className="text-4xl font-['Reem_Kufi'] text-[var(--color-secondary)] glow-gold mb-2 flex items-center gap-3">
            <Archive className="w-8 h-8" /> أرشيف المواسم
          </h1>
          <p className="text-[var(--color-on-surface-variant)]">تصفح سجلات الفتوحات السابقة</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="بحث في المواسم..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline)] focus:border-[var(--color-secondary)] p-3 pr-10 rounded-xl text-[var(--color-on-surface)] outline-none transition-colors"
          />
          <Search className="w-5 h-5 absolute right-3 top-3.5 text-[var(--color-on-surface-variant)]" />
        </div>
      </div>

      <div className="space-y-8">
        {archivedSeasons.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Archive className="w-16 h-16 mx-auto mb-4 text-[var(--color-secondary)] opacity-50" />
            <p className="text-xl font-['Amiri'] text-[var(--color-on-surface)]">لا يوجد مواسم مؤرشفة حتى الآن.</p>
          </div>
        ) : (
          archivedSeasons
          .filter(s => s.name.includes(searchTerm))
          .map(season => (
            <div key={season.id} className="glass-panel p-6 rounded-2xl border border-[var(--color-outline-variant)]">
              <div className="flex justify-between items-end mb-6 border-b border-[var(--color-outline-variant)]/50 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--color-secondary)] font-['Reem_Kufi']">{season.name}</h2>
                  <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">تاريخ الإنشاء: {new Date(season.createdAt).toLocaleDateString('ar')}</p>
                </div>
                <div className="text-center bg-[var(--color-surface-container)] px-4 py-2 rounded-xl">
                  <p className="text-xs text-[var(--color-on-surface-variant)]">عدد الطلاب</p>
                  <p className="font-bold text-[var(--color-on-surface)] text-lg">{season.students.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Path 1 Summary */}
                <div className="bg-[var(--color-surface-container-high)] p-4 rounded-xl border border-[var(--color-outline-variant)]/40">
                  <h3 className="font-bold text-[var(--color-on-surface)] mb-4 pb-2 border-b border-[var(--color-outline-variant)]">فرسان المسار الأول</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                    {season.students.filter(s => s.pathId === 'path1').sort((a,b) => b.points - a.points).map(s => (
                      <div key={s.id} className="flex justify-between items-center text-sm">
                        <span className="text-[var(--color-on-surface)]">{s.name} {s.hasJerusalemBadge && '🏅'}</span>
                        <span className="font-bold text-[var(--color-secondary)]">{s.points} pt</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Path 2 Summary */}
                <div className="bg-[var(--color-surface-container-high)] p-4 rounded-xl border border-[var(--color-outline-variant)]/40">
                  <h3 className="font-bold text-[var(--color-on-surface)] mb-4 pb-2 border-b border-[var(--color-outline-variant)]">فرسان المسار الثاني</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                    {season.students.filter(s => s.pathId === 'path2').sort((a,b) => b.points - a.points).map(s => (
                      <div key={s.id} className="flex justify-between items-center text-sm">
                        <span className="text-[var(--color-on-surface)]">{s.name} {s.hasJerusalemBadge && '🏅'}</span>
                        <span className="font-bold text-[var(--color-secondary)]">{s.points} pt</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
