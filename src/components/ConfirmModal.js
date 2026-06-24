"use client";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', danger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="glass-panel modal-show relative w-full max-w-sm rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden text-center p-lg">
        <div className={'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ' + (danger ? 'bg-error/20 border border-error/30' : 'bg-secondary/20 border border-secondary/30')}>
          <span className={'material-symbols-outlined text-3xl ' + (danger ? 'text-error' : 'text-secondary')} style={{ fontVariationSettings: "'FILL' 1" }}>{danger ? 'delete' : 'warning'}</span>
        </div>
        {title && <h3 className="text-headline-md font-headline-md text-on-surface mb-2">{title}</h3>}
        <p className="text-body-md font-body-md text-on-surface-variant mb-lg">{message}</p>
        <div className="flex justify-center gap-4">
          <button onClick={onCancel} className="px-6 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-label-sm text-label-sm uppercase hover:bg-surface-variant/30 transition-colors">{cancelLabel}</button>
          <button onClick={onConfirm} className={'px-6 py-2 rounded-lg font-label-sm text-label-sm uppercase transition-all ' + (danger ? 'bg-error text-on-surface hover:bg-error/80 shadow-[0_0_15px_rgba(239,83,80,0.3)]' : 'bg-secondary text-on-surface hover:bg-secondary/80 shadow-[0_0_15px_rgba(74,225,118,0.3)]')}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
