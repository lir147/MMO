
import React, { PropsWithChildren } from 'react'
export default function Modal({ open, onClose, children, title }: PropsWithChildren<{ open: boolean; onClose: ()=>void; title?: string }>) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-4" onClick={e=>e.stopPropagation()}>
        {title && <div className="text-white/80 font-semibold mb-2">{title}</div>}
        {children}
        <div className="mt-4 text-right"><button className="btn" onClick={onClose}>Закрыть</button></div>
      </div>
    </div>
  )
}
