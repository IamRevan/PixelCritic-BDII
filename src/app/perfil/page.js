"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ImageWithFallback from '@/components/ImageWithFallback';

const reviewColors = { 5: '#4ae176', 4: '#ddb7ff', 3: '#ffd54f', 2: '#ff8a65', 1: '#ef5350' };

function getStars(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    '<span class="material-symbols-outlined text-sm ' + (i < rating ? 'text-secondary' : 'text-outline-variant') + '" style="font-variation-settings:\'FILL\' ' + (i < rating ? 1 : 0) + ';">star</span>'
  ).join('');
}

export default function PerfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ calificacion: 5, comentario: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const fetchData = useCallback(async () => {
    try {
      const [reviewsRes, gamesRes] = await Promise.all([
        fetch('/api/resenas'),
        fetch('/api/juegos'),
      ]);
      const allReviews = await reviewsRes.json();
      const allGames = await gamesRes.json();
      setReviews(Array.isArray(allReviews) ? allReviews.filter(r => r.autor === user?.username) : []);
      setGames(Array.isArray(allGames) ? allGames : []);
      setLoading(false);
    } catch (err) {
      setReviews([]);
      setGames([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  const handleEditReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    setEditSubmitting(true);
    try {
      const res = await fetch('/api/resenas/' + editingReview._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calificacion: editForm.calificacion,
          comentario: editForm.comentario.trim(),
        }),
      });
      if (res.ok) {
        showToast('Resena actualizada.');
        setEditingReview(null);
        fetchData();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Error al actualizar.', 'error');
      }
    } catch (err) {
      showToast('Error de conexion.', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  const deleteReview = async (id) => {
    if (!confirm('Eliminar esta resena?')) return;
    try {
      const res = await fetch('/api/resenas/' + id, { method: 'DELETE' });
      if (res.ok) {
        showToast('Resena eliminada.', 'error');
        fetchData();
      }
    } catch (err) {
      showToast('Error al eliminar.', 'error');
    }
  };

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const icon = type === 'success' ? 'check_circle' : 'delete';
    const colorClass = type === 'success' ? 'text-secondary border-secondary/50' : 'text-error border-error/50';
    toast.className = 'glass-panel px-4 py-3 rounded-xl border flex items-center gap-3 toast-animate shadow-lg pointer-events-auto ' + colorClass;
    toast.innerHTML = '<span class="material-symbols-outlined" style="font-variationSettings:\'FILL\' 1;">' + icon + '</span><span class="text-body-md font-body-md text-on-surface">' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  if (authLoading || loading) {
    return (
      <div className="animate-pulse space-y-6 mt-lg">
        <div className="h-10 w-64 bg-surface-variant rounded"></div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-variant rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <div className="pt-lg">
        <div className="flex items-center gap-4 mb-lg">
          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary" style={{fontVariationSettings:"'FILL' 1"}}>account_circle</span>
          </div>
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">{user.username}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-3 py-0.5 rounded-full text-label-sm font-label-sm border" style={{ background: (user.rol === 'admin' ? '#ff8a65' : user.rol === 'editor' ? '#ddb7ff' : '#4ae176') + '18', color: user.rol === 'admin' ? '#ff8a65' : user.rol === 'editor' ? '#ddb7ff' : '#4ae176', borderColor: (user.rol === 'admin' ? '#ff8a65' : user.rol === 'editor' ? '#ddb7ff' : '#4ae176') + '30' }}>{user.rol}</span>
              <span className="text-label-sm font-label-sm text-on-surface-variant">{reviews.length} resenas</span>
            </div>
          </div>
        </div>

        <div className="border-b border-outline-variant/30 pb-4 mb-lg flex items-center justify-between">
          <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings:"'FILL' 1"}}>rate_review</span>
            Mis Resenas
          </h3>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl opacity-30 block mb-4" style={{fontVariationSettings:"'FILL' 1"}}>rate_review</span>
            <p className="text-body-lg font-body-lg">No has publicado ninguna resena aun.</p>
            <p className="text-label-sm font-label-sm mt-2">Explora el catalogo y deja tu opinion en los juegos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reviews.map((r, i) => {
              const game = games.find(g => g.titulo === r.juego);
              return (
                <div key={r._id || i} className="glass-panel rounded-xl p-5 review-card relative group" style={{ borderLeftColor: reviewColors[r.calificacion] || '#4d4354' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                        {game ? (
                          <ImageWithFallback src={game.imagen} alt={r.juego} className="w-full h-full object-cover" fallbackIcon="sports_esports" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-sm text-outline-variant">sports_esports</span></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-headline-md font-headline-md text-on-surface font-semibold truncate">{r.juego}</p>
                        <div className="flex items-center gap-1 mt-1" dangerouslySetInnerHTML={{ __html: getStars(r.calificacion) }}></div>
                        <p className="text-body-md font-body-md text-on-surface-variant italic mt-2 line-clamp-2">"{r.comentario}"</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setEditingReview(r); setEditForm({ calificacion: r.calificacion, comentario: r.comentario }); }} className="p-2 border border-secondary/40 text-secondary rounded-lg hover:bg-secondary/10 transition-all" title="Editar">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => deleteReview(r._id)} className="p-2 border border-error/40 text-error rounded-lg hover:bg-error/10 transition-all" title="Eliminar">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
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
              <button onClick={() => setEditingReview(null)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleEditReview} className="p-md flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Calificacion</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setEditForm({...editForm, calificacion: star})} className={'p-1 rounded-lg transition-all hover:scale-110 ' + (star <= editForm.calificacion ? 'text-secondary' : 'text-outline-variant')}>
                      <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' " + (star <= editForm.calificacion ? 1 : 0)}}>star</span>
                    </button>
                  ))}
                  <span className="text-body-lg font-body-lg text-secondary font-bold ml-2">{editForm.calificacion}.0 / 5.0</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Comentario</label>
                <textarea className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface min-h-[100px] resize-none" value={editForm.comentario} onChange={e => setEditForm({...editForm, comentario: e.target.value})} required />
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
    </>
  );
}
