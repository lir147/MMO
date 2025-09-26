
import React from 'react';
import type { Effect } from '@/types/battle';

const titles: Record<string, string> = {
  stun: 'Оглушение',
  poison: 'Яд',
  slow: 'Замедление',
};

export default function EffectsBar({ effects }: { effects?: Effect[] }) {
  if (!effects || !effects.length) return null;
  return (
    <div className="flex gap-2 mt-2">
      {effects.map((e, i) => (
        <div key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-800/70 border border-slate-700">
          <span title={titles[e.code] || e.code} aria-label={e.code}>{e.icon || '•'}</span>
          <span>{e.turns}</span>
        </div>
      ))}
    </div>
  );
}
