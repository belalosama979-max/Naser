import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Trophy } from 'lucide-react';

export default function HallOfFame() {
  const { hallOfFame } = useGameStore();

  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-full overflow-y-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-['Reem_Kufi'] text-[var(--color-secondary)] glow-gold mb-4">قاعة الفاتحين</h1>
        <p className="text-[var(--color-on-surface-variant)] text-lg">أبطال سطروا أسماءهم في تاريخ تحرير القدس</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hallOfFame.length === 0 ? (
          <div className="col-span-full text-center py-20 opacity-50">
            <Trophy className="w-20 h-20 mx-auto mb-4 text-[var(--color-secondary)] opacity-50" />
            <p className="text-2xl font-['Amiri'] text-[var(--color-on-surface)]">لم يبلغ أحد أبواب القدس بعد...</p>
          </div>
        ) : (
          hallOfFame.map((hero, index) => (
            <div key={index} className="glass-panel p-6 rounded-2xl border border-[var(--color-secondary)]/50 relative group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-[var(--color-secondary)] rounded-full flex items-center justify-center text-black font-bold text-xl shadow-[0_0_15px_var(--color-secondary)]">
                {index + 1}
              </div>
              
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-[var(--color-secondary-container)] overflow-hidden mb-4 bg-[var(--color-surface-container-high)]">
                {hero.avatar ? (
                  <img src={hero.avatar} alt={hero.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--color-secondary)]">
                    {hero.name.substring(0, 2)}
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-center text-[var(--color-on-surface)] mb-2 font-['Reem_Kufi']">{hero.name}</h3>
              
              <div className="space-y-2 text-sm text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container)] p-3 rounded-xl border border-[var(--color-outline-variant)]">
                <div className="flex justify-between border-b border-[var(--color-outline-variant)] pb-1">
                  <span>الموسم:</span>
                  <span className="font-bold text-[var(--color-secondary-fixed)]">{hero.seasonName}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-outline-variant)] pb-1">
                  <span>النقاط النهائية:</span>
                  <span className="font-bold text-[var(--color-secondary)]">{hero.points}</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ الوصول:</span>
                  <span>{new Date(hero.dateReached).toLocaleDateString('ar')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
