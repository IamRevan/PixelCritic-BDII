"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-5xl text-primary" style={{fontVariationSettings:"'FILL' 1"}}>search_off</span>
        </div>
        <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight" style={{ fontSize: 'clamp(4rem, 10vw, 7rem)' }}>404</h1>
        <p className="text-headline-md font-headline-md text-primary mt-2">Pagina no encontrada</p>
        <p className="text-body-md font-body-md text-on-surface-variant mt-4 leading-relaxed">
          La pagina que buscas no existe o ha sido movida. Revisa la URL o vuelve al catalogo.
        </p>
        <div className="mt-lg flex justify-center gap-4">
          <Link href="/" className="flex items-center gap-2 bg-primary text-on-primary-fixed hover:bg-primary-container px-6 py-3 rounded-lg font-label-sm text-label-sm uppercase transition-all shadow-[0_0_20px_rgba(221,183,255,0.25)] hover:shadow-[0_0_30px_rgba(221,183,255,0.5)] border border-primary/30">
            <span className="material-symbols-outlined">grid_view</span>
            Ir al Catalogo
          </Link>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 border border-secondary/50 text-secondary hover:bg-secondary/10 px-6 py-3 rounded-lg font-label-sm text-label-sm uppercase transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
            Volver Atras
          </button>
        </div>
      </div>
    </div>
  );
}
