"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ImageWithFallback from '@/components/ImageWithFallback';
import { DetailSkeleton } from '@/components/SkeletonCard';

// ============================================
// Detalle del Juego - Pagina individual
// Muestra info completa del juego, resenas
// y formulario para dejar una nueva resena
// ============================================

const catColors = { 'RPG': '#ddb7ff', 'Accion': '#ff8a65', 'Aventura': '#4ae176', 'Deportes': '#64b5f6', 'Estrategia': '#ffd54f', 'Shooter': '#ef5350' };

function getStars(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) =>
    '<span class="material-symbols-outlined text-xl ' + (i < full ? 'text-secondary' : 'text-outline-variant') + '" style="font-variation-settings:\'FILL\' ' + (i < full ? 1 : 0) + ';">star</span>'
  ).join('');
}

export default function GameDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado del formulario de resena
  const [reviewForm, setReviewForm] = useState({ calificacion: 5, comentario: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Estado del modal de editar resena
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewForm, setEditReviewForm] = useState({ calificacion: 5, comentario: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const gameRes = await fetch('/api/juegos/' + id);
      if (!gameRes.ok) { setError('Juego no encontrado'); setLoading(false); return; }
      const gameData = await gameRes.json();
      setGame(gameData);

      const reviewsRes = await fetch('/api/resenas');
      const reviewsData = await reviewsRes.json();
      const allReviews = Array.isArray(reviewsData) ? reviewsData : [];
      setReviews(allReviews.filter(r => r.juego === gameData.titulo));

      setLoading(false);
    } catch (err) {
      setError('Error al cargar los datos');
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { setReviewError('Debes iniciar sesion para dejar una resena.'); return; }
    if (!reviewForm.comentario.trim()) { setReviewError('El comentario no puede estar vacio.'); return; }
    setSubmitting(true);
    setReviewError('');

    try {
      const res = await fetch('/api/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autor: user.username,
          juego: game.titulo,
          calificacion: reviewForm.calificacion,
          comentario: reviewForm.comentario.trim(),
        }),
      });

      if (res.ok) {
        showToast('Resena publicada exitosamente.');
        setReviewForm({ calificacion: 5, comentario: '' });
        loadData(); // Recargar resenas
      } else {
        const errData = await res.json();
        setReviewError(errData.error || 'Error al publicar resena.');
      }
    } catch (err) {
      setReviewError('Error de conexion.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    setEditSubmitting(true);
    try {
      const res = await fetch('/api/resenas/' + editingReview._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calificacion: editReviewForm.calificacion,
          comentario: editReviewForm.comentario.trim(),
        }),
      });
      if (res.ok) {
        showToast('Resena actualizada exitosamente.');
        setEditingReview(null);
        loadData();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Error al actualizar resena.', 'error');
      }
    } catch (err) {
      showToast('Error de conexion.', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const icon = type === 'success' ? 'check_circle' : 'delete';
    const colorClass = type === 'success' ? 'text-secondary border-secondary/50' : 'text-error border-error/50';
    toast.className = 'glass-panel px-4 py-3 rounded-xl border flex items-center gap-3 toast-animate shadow-lg pointer-events-auto ' + colorClass;
    toast.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1;">' + icon + '</span><span class="text-body-md font-body-md text-on-surface">' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-6xl text-error" style={{fontVariationSettings:"'FILL' 1"}}>search_off</span>
        <p className="text-headline-md font-headline-md text-on-surface">{error || 'Juego no encontrado'}</p>
        <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-fixed rounded-lg font-label-sm text-label-sm uppercase transition-all hover:shadow-[0_0_20px_rgba(221,183,255,0.4)]">
          <span className="material-symbols-outlined">arrow_back</span> Volver al Catalogo
        </Link>
      </div>
    );
  }

  const color = catColors[game.categoria] || '#ddb7ff';
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.calificacion, 0) / reviews.length) : game.calificacion || 0;

  return (
    <div className="pt-lg">
      <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-lg">
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="text-label-sm font-label-sm uppercase tracking-wider">Volver al Catalogo</span>
      </Link>

      <div className="glass-panel rounded-2xl overflow-hidden border-primary/20">
        <div className="relative h-48 md:h-64 bg-surface-container-high flex items-center justify-center">
          <ImageWithFallback src={game.imagen} alt={game.titulo} className="w-full h-full object-cover" fallbackIcon="sports_esports" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent"></div>
          <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-md border border-secondary/30 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
            <span className="text-headline-md font-headline-md text-secondary font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-label-sm font-label-sm text-on-surface-variant">/ 5.0</span>
          </div>
        </div>

        <div className="p-lg">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-lg">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-lg text-label-sm font-label-sm border" style={{ background: color + '18', color: color, borderColor: color + '30' }}>{game.categoria}</span>
                <span className="text-on-surface-variant text-label-sm font-label-sm">{game.anioLanzamiento}</span>
                {game.desarrolladora && <span className="text-on-surface-variant text-label-sm font-label-sm">por {game.desarrolladora}</span>}
              </div>
              <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight">{game.titulo}</h1>
            </div>
            <div className="text-right">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Precio</p>
              <p className="text-headline-lg font-headline-lg text-secondary font-bold">${(game.precio || 0).toFixed(2)}</p>
            </div>
          </div>

          {game.descripcion && (
            <div className="mb-lg p-4 rounded-xl bg-surface-container-high/50 border border-outline-variant/20">
              <p className="text-label-sm font-label-sm text-secondary uppercase tracking-wider mb-2">Descripcion</p>
              <p className="text-body-lg font-body-lg text-on-surface-variant leading-relaxed">{game.descripcion}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-lg">
            <div className="bg-surface-container-high/30 rounded-xl p-4 text-center border border-outline-variant/20">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Categoria</p>
              <p className="text-body-md font-body-md text-on-surface font-semibold mt-1" style={{ color: color }}>{game.categoria}</p>
            </div>
            <div className="bg-surface-container-high/30 rounded-xl p-4 text-center border border-outline-variant/20">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Ano</p>
              <p className="text-body-md font-body-md text-on-surface font-semibold mt-1">{game.anioLanzamiento}</p>
            </div>
            <div className="bg-surface-container-high/30 rounded-xl p-4 text-center border border-outline-variant/20">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Desarrolladora</p>
              <p className="text-body-md font-body-md text-on-surface font-semibold mt-1">{game.desarrolladora || 'Sin asignar'}</p>
            </div>
            <div className="bg-surface-container-high/30 rounded-xl p-4 text-center border border-outline-variant/20">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Resenas</p>
              <p className="text-body-md font-body-md text-on-surface font-semibold mt-1">{reviews.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div dangerouslySetInnerHTML={{ __html: getStars(avgRating) }}></div>
            <span className="text-body-md font-body-md text-on-surface-variant ml-2">({avgRating.toFixed(1)} promedio basado en {reviews.length} resenas)</span>
          </div>
        </div>
      </div>

      {/* ── Review Form ── */}
      <div className="mt-xl glass-panel rounded-xl p-lg border-primary/20">
        <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2 mb-lg">
          <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings:"'FILL' 1"}}>rate_review</span>
          {user ? 'Deja tu Resena' : 'Inicia sesion para dejar una resena'}
        </h3>

        {user ? (
          <form onSubmit={handleSubmitReview} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Tu Calificacion</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({...reviewForm, calificacion: star})}
                    className={'p-1 rounded-lg transition-all hover:scale-110 ' + (star <= reviewForm.calificacion ? 'text-secondary' : 'text-outline-variant')}
                  >
                    <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' " + (star <= reviewForm.calificacion ? 1 : 0)}}>star</span>
                  </button>
                ))}
                <span className="text-body-lg font-body-lg text-secondary font-bold ml-2">{reviewForm.calificacion}.0 / 5.0</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Comentario</label>
              <textarea
                className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface min-h-[100px] resize-none"
                placeholder="Escribe tu opinion sobre este juego..."
                value={reviewForm.comentario}
                onChange={e => setReviewForm({...reviewForm, comentario: e.target.value})}
                required
              />
            </div>
            {reviewError && (
              <div className="bg-error/10 border border-error/30 rounded-xl p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-sm" style={{fontVariationSettings:"'FILL' 1"}}>error</span>
                <p className="text-body-md font-body-md text-error text-sm">{reviewError}</p>
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-secondary text-on-secondary hover:bg-secondary/80 px-6 py-3 rounded-lg font-label-sm text-label-sm uppercase transition-all shadow-[0_0_15px_rgba(74,225,118,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <><span className="material-symbols-outlined animate-spin text-sm">sync</span> Publicando...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>send</span> Publicar Resena</>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-fixed rounded-lg font-label-sm text-label-sm uppercase transition-all hover:shadow-[0_0_20px_rgba(221,183,255,0.4)]">
              <span className="material-symbols-outlined">login</span> Iniciar Sesion
            </Link>
          </div>
        )}
      </div>

      {/* ── Reviews list ── */}
      <div className="mt-xl">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-lg">
          <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings:"'FILL' 1"}}>rate_review</span>
            Resenas de {game.titulo}
          </h3>
          <span className="bg-surface-variant text-on-surface-variant text-label-sm font-label-sm px-3 py-1 rounded-full uppercase">{reviews.length} Resenas</span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl opacity-30 block mb-4" style={{fontVariationSettings:"'FILL' 1"}}>rate_review</span>
            <p className="text-body-lg font-body-lg">Este juego no tiene resenas aun.</p>
            <p className="text-label-sm font-label-sm mt-2">Se el primero en dejar tu opinion!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r, i) => {
              const reviewColors = { 5: '#4ae176', 4: '#ddb7ff', 3: '#ffd54f', 2: '#ff8a65', 1: '#ef5350' };
              return (
                  <div key={r._id || i} className="glass-panel rounded-xl p-5 review-card relative group" style={{ borderLeftColor: reviewColors[r.calificacion] || '#4d4354' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings:"'FILL' 1"}}>person</span>
                        </div>
                        <div>
                          <p className="text-body-md font-body-md text-on-surface font-semibold">{r.autor}</p>
                          <div className="flex items-center gap-1" dangerouslySetInnerHTML={{ __html: getStars(r.calificacion) }}></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(user && (user.username === r.autor || user.rol === 'admin')) && (
                          <button onClick={() => { setEditingReview(r); setEditReviewForm({ calificacion: r.calificacion, comentario: r.comentario }); }} className="text-on-surface-variant hover:text-secondary transition-colors p-1" title="Editar resena">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                        )}
                        <span className="text-label-sm font-label-sm font-bold" style={{ color: reviewColors[r.calificacion] || '#4ae176' }}>{r.calificacion}.0</span>
                      </div>
                    </div>
                    <p className="text-body-md font-body-md text-on-surface-variant italic leading-relaxed">"{r.comentario}"</p>
                  </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Edit Review Modal ── */}
      {editingReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingReview(null)}></div>
          <div className="glass-panel modal-show relative w-full max-w-md rounded-2xl shadow-2xl border border-secondary/20 flex flex-col overflow-hidden">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
              <h3 className="text-headline-md font-headline-md text-secondary font-bold">Editar Resena</h3>
              <button onClick={() => setEditingReview(null)} className="text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleEditReview} className="p-md flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Calificacion</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditReviewForm({...editReviewForm, calificacion: star})}
                      className={'p-1 rounded-lg transition-all hover:scale-110 ' + (star <= editReviewForm.calificacion ? 'text-secondary' : 'text-outline-variant')}
                    >
                      <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' " + (star <= editReviewForm.calificacion ? 1 : 0)}}>star</span>
                    </button>
                  ))}
                  <span className="text-body-lg font-body-lg text-secondary font-bold ml-2">{editReviewForm.calificacion}.0 / 5.0</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Comentario</label>
                <textarea
                  className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface min-h-[100px] resize-none"
                  placeholder="Escribe tu opinion sobre este juego..."
                  value={editReviewForm.comentario}
                  onChange={e => setEditReviewForm({...editReviewForm, comentario: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-4">
                <button type="button" onClick={() => setEditingReview(null)} className="px-6 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-label-sm text-label-sm uppercase hover:bg-surface-variant/30">Cancelar</button>
                <button type="submit" disabled={editSubmitting} className="bg-secondary text-on-secondary hover:bg-secondary/80 px-6 py-2 rounded-lg font-label-sm text-label-sm uppercase transition-all shadow-[0_0_15px_rgba(74,225,118,0.2)] disabled:opacity-50 flex items-center gap-2">
                  {editSubmitting ? <><span className="material-symbols-outlined animate-spin text-sm">sync</span> Guardando...</> : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
