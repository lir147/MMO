
import React, { useState } from 'react';
import FightModal from '@/components/FightModal';

export default function FightButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={()=>setOpen(true)} className="px-3 py-1 rounded bg-sky-700 hover:bg-sky-600">Сразиться</button>
      <FightModal open={open} onClose={()=>setOpen(false)} />
    </>
  );
}
