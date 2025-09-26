
import React, { useState } from 'react';
import FightPanel from '@/components/FightPanel';

export default function FightModal({open, onClose}:{open:boolean; onClose:()=>void}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[min(100%,840px)] max-h-[90vh] overflow-auto rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">Подземелья</div>
          <button onClick={onClose} className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">✕</button>
        </div>
        <FightPanel />
      </div>
    </div>
  );
}
