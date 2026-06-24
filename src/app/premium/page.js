"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ImageWithFallback from '@/components/ImageWithFallback';
import { PremiumCardSkeleton } from '@/components/SkeletonCard';
import { useDebounce } from '@/hooks/useDebounce';

// ============================================
// Favoritos del Equipo - Pagina Premium
// Muestra juegos marcados como favoritos.
// Incluye filtros por categoria y busqueda,
// toggle de favoritos y calificacion dinamica
// basada en las resenas reales.
// ============================================

const catColors = { 'RPG': '#ddb7ff', 'Accion': '#ff8a65', 'Aventura': '#4ae176', 'Deportes': '#64b5f6', 'Estrategia': '#ffd54f', 'Shooter': '#ef5350' };

function getStars(rating, size = 'text-base') {
  return Array.from({ length: 5 }, (_, i) =>
    '<span class="material-symbols-outlined ' + size + ' ' + (i < rating ? 'text-secondary' : 'text-outline-variant') + '" style="font-variation-settings:\'FILL\' ' + (i < rating ? 1 : 0) + ';">star</span>'
  ).join('');
}

export default function PremiumPage() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchData = useCallback(async () => {
    try {
      const [gamesRes, reviewsRes] = await Promise.all([
        fetch('/api/juegos'),
        fetch('/api/resenas'),
      ]);
      const gamesData = await gamesRes.json();
      const reviewsData = await reviewsRes.json();
      setGames(Array.isArray(gamesData) ? gamesData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar:', err);
      setGames([]);
      setReviews([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Calcular rating dinamico para cada juego basado en resenas reales
  const getGameRating = (game) => {
    const gameReviews = reviews.filter(r => r.juego === game.titulo);
    if (gameReviews.length > 0) {
      return Math.round((gameReviews.reduce((s, r) => s + r.calificacion, 0) / gameReviews.length) * 10) / 10;
    }
    return game.calificacion || 0;
  };

  // Juegos favoritos con rating dinamico
  const favoriteGames = games.filter(g => g.favorito);
  const favoriteWithRating = favoriteGames.map(g => ({ ...g, calificacionDinamica: getGameRating(g) }));

  // Filtros
  const filteredFavorites = favoriteWithRating
    .filter(g => currentFilter === 'Todos' || g.categoria === currentFilter)
    .filter(g => g.titulo.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .sort((a, b) => (b.calificacionDinamica || 0) - (a.calificacionDinamica || 0));

  // Resenas destacadas (calificacion >= 4)
  const topReviews = reviews.filter(r => r.calificacion >= 4);

  // Metricas
  const avgRating = games.length > 0
    ? (games.reduce((s, g) => s + getGameRating(g), 0) / games.length).toFixed(1)
    : '0.0';
  const perfectGames = games.filter(g => getGameRating(g) >= 5).length;

  // Toggle favorito
  const toggleFavorite = async (game) => {
    try {
      const res = await fetch('/api/juegos/' + game._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorito: !game.favorito }),
      });
      if (res.ok) {
        showToast(game.favorito ? 'Eliminado de favoritos' : 'Agregado a favoritos');
        fetchData();
      }
    } catch (err) {
      showToast('Error al actualizar', 'error');
    }
  };

  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const icon = type === 'success' ? 'favorite' : 'delete';
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
    return (
      <div className="mt-lg">
        <div className="h-10 w-64 bg-surface-variant rounded animate-pulse mb-lg"></div>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md lg:gap-gutter mt-lg">
          <PremiumCardSkeleton featured={true} />
          {Array.from({ length: 4 }).map((_, i) => <PremiumCardSkeleton key={i} />)}
        </section>
      </div>
    );
  }

  return (
    <>
      <section className="mt-lg">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
          <div>
            <div className="flex items-center gap-xs mb-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <span className="text-label-sm font-label-sm text-primary tracking-widest uppercase">Coleccion Exclusiva Tecno Capibara</span>
            </div>
            <h2 className="text-display-lg font-display-lg text-on-surface" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>Favoritos<br /><span className="text-primary">del Equipo</span></h2>
            <p className="text-body-lg font-body-lg text-on-surface-variant mt-3 max-w-2xl">La seleccion editorial de nuestros expertos. Titulos marcados como favoritos por el equipo.</p>
          </div>
          <div className="glass-panel flex items-center gap-sm px-4 py-3 rounded-2xl border-primary/20 shrink-0">
            <span className="material-symbols-outlined text-secondary">favorite</span>
            <span className="text-label-sm font-label-sm text-on-surface">{favoriteGames.length} Favoritos</span>
          </div>
        </div>
      </section>

      {/* Filtros y busqueda */}
      <div className="glass-panel rounded-xl p-4 my-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="hidden md:flex flex-1 max-w-md focus-within:ring-2 focus-within:ring-secondary/50 rounded-full bg-surface-container-low px-4 py-2 items-center gap-2 border border-outline-variant/50">
          <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
          <input
            className="bg-transparent border-none text-body-md font-body-md text-on-surface placeholder-on-surface-variant focus:ring-0 w-full outline-none"
            placeholder="Buscar en favoritos..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['Todos', 'Aventura', 'Accion', 'Deportes', 'RPG', 'Estrategia', 'Shooter'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCurrentFilter(cat)}
              className={'filter-btn px-4 py-1.5 rounded-full text-label-sm font-label-sm border border-outline-variant/50 whitespace-nowrap transition-colors ' + (currentFilter === cat ? 'active' : 'text-on-surface-variant hover:text-on-surface')}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de juegos favoritos */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md lg:gap-gutter mt-lg">
        {filteredFavorites.length === 0 ? (
          <div className="col-span-full text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl opacity-30 block mb-4">workspace_premium</span>
            <p className="text-body-lg font-body-lg">No hay juegos favoritos con ese filtro.</p>
            <p className="text-label-sm font-label-sm mt-2">Marca juegos como favoritos desde el catalogo o el panel admin.</p>
          </div>
        ) : (
          filteredFavorites.map((g, idx) => {
            const isFeatured = idx === 0;
            const color = catColors[g.categoria] || '#ddb7ff';
            const rating = g.calificacionDinamica || 0;

            if (isFeatured) {
              return (
                <article key={g._id} className="glass-card rounded-2xl overflow-hidden group relative lg:col-span-2 flex flex-col md:flex-row min-h-[380px]">
                  <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
                    <span className="bg-primary/20 text-primary border border-primary/40 text-label-sm font-label-sm px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> PREMIUM
                    </span>
                    <span className="bg-surface-container/80 text-on-surface text-label-sm font-label-sm px-3 py-1 rounded-full backdrop-blur-md">{g.categoria}</span>
                  </div>
                  <div className="w-full md:w-3/5 min-h-[220px] md:min-h-full relative overflow-hidden bg-surface-container-high">
                    <ImageWithFallback src={g.imagen} alt={g.titulo} className="w-full h-full object-cover" fallbackIcon="sports_esports" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-surface/30 md:to-surface"></div>
                  </div>
                  <div className="w-full md:w-2/5 p-lg flex flex-col justify-center bg-surface md:bg-transparent">
                    <h3 className="text-headline-lg font-headline-lg text-on-surface mb-2 group-hover:text-primary transition-colors">{g.titulo}</h3>
                    <p className="text-on-surface-variant text-body-md font-body-md mb-4 line-clamp-3">{g.descripcion || 'Sin descripcion.'}</p>
                    <div className="flex items-center gap-1 mb-2" dangerouslySetInnerHTML={{ __html: getStars(rating, 'text-lg') }}></div>
                    <p className="text-label-sm font-label-sm text-on-surface-variant mb-6">{rating.toFixed(1)} / 5.0 | {reviews.filter(r => r.juego === g.titulo).length} resenas | {g.desarrolladora || ''} | {g.anioLanzamiento || ''}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-headline-md font-headline-md text-secondary">${(g.precio || 0).toFixed(2)}</span>
                      <div className="flex gap-2">
                        <button onClick={() => toggleFavorite(g)} className="border border-error/50 text-error hover:bg-error/10 font-label-sm text-label-sm px-4 py-3 rounded-full transition-colors flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>heart_broken</span> Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }

            return (
              <article key={g._id} className="glass-card rounded-2xl overflow-hidden group relative flex flex-col h-[400px]">
                <div className="absolute top-3 left-3 z-10 flex gap-2">
                  <span className="bg-primary/20 text-primary border border-primary/40 text-label-sm font-label-sm px-2 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> PREMIUM
                  </span>
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-surface/80 backdrop-blur-md border border-secondary/30 text-secondary text-label-sm font-label-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {rating.toFixed(1)}
                  </div>
                </div>
                <div className="h-1/2 relative overflow-hidden bg-surface-container-high">
                  <ImageWithFallback src={g.imagen} alt={g.titulo} className="w-full h-full object-cover" fallbackIcon="sports_esports" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent"></div>
                </div>
                <div className="h-1/2 p-md flex flex-col bg-surface-container relative">
                  <span className="text-[10px] font-label-sm uppercase tracking-wider mb-1" style={{ color: color }}>{g.categoria} | {g.anioLanzamiento || ''}</span>
                  <h3 className="text-headline-md font-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors">{g.titulo}</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant line-clamp-2 mb-auto text-sm">{g.descripcion || ''}</p>
                  <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 mt-3">
                    <span className="text-headline-md font-headline-md text-secondary">${(g.precio || 0).toFixed(2)}</span>
                    <button onClick={() => toggleFavorite(g)} className="border border-error/50 text-error hover:bg-error/10 font-label-sm text-label-sm px-3 py-2 rounded-full transition-colors flex items-center gap-1 text-xs">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>heart_broken</span> Quitar
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Seccion de todos los juegos (para agregar a favoritos) */}
      <section className="mt-xl">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-lg">
          <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            Todos los Juegos
          </h3>
          <span className="text-label-sm font-label-sm text-on-surface-variant">Agrega mas juegos a favoritos</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {games.filter(g => !g.favorito).map(g => {
            const rating = getGameRating(g);
            return (
              <button
                key={g._id}
                onClick={() => toggleFavorite(g)}
                className="glass-panel rounded-xl px-4 py-3 border border-primary/20 hover:border-secondary/50 transition-all flex items-center gap-3 group"
              >
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors" style={{fontVariationSettings:"'FILL' 1"}}>add</span>
                <div className="text-left">
                  <p className="text-body-md font-body-md text-on-surface group-hover:text-secondary transition-colors">{g.titulo}</p>
                  <div className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
                    <span style={{ color: catColors[g.categoria] || '#ddb7ff' }}>{g.categoria}</span>
                    <span>${(g.precio || 0).toFixed(2)}</span>
                    <span>{rating.toFixed(1)}/5</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Resenas Destacadas */}
      <section className="flex flex-col gap-6 mt-xl">
        <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>rate_review</span>
          <h3 className="text-headline-md font-headline-md text-on-surface">Resenas Destacadas</h3>
          <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-variant px-3 py-1 rounded-full uppercase">Calificacion {'>='} 4</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {topReviews.length === 0 ? (
            <p className="col-span-full text-on-surface-variant text-center py-10">No hay resenas destacadas.</p>
          ) : (
            topReviews.map((r, i) => {
              const reviewColors = { 5: '#4ae176', 4: '#ddb7ff' };
              return (
                <div key={r._id || i} className="glass-panel rounded-xl p-5 review-card" style={{ borderLeftColor: reviewColors[r.calificacion] || '#4d4354' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">person</span>
                      </div>
                      <div>
                        <p className="text-body-md font-body-md text-on-surface font-semibold">{r.autor}</p>
                        <p className="text-label-sm font-label-sm text-on-surface-variant">{r.juego}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1" dangerouslySetInnerHTML={{ __html: getStars(r.calificacion, 'text-sm') }}></div>
                      <span className="text-label-sm font-label-sm" style={{ color: reviewColors[r.calificacion] || '#4ae176' }}>{r.calificacion}.0 / 5</span>
                    </div>
                  </div>
                  <p className="text-body-md font-body-md text-on-surface-variant italic leading-relaxed">"{r.comentario}"</p>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Metricas */}
      <section className="mt-xl">
        <div className="glass-card rounded-2xl p-lg">
          <div className="flex items-center gap-2 mb-8 border-b border-outline-variant/30 pb-4">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            <h3 className="text-headline-md font-headline-md text-on-surface">Metricas del Equipo</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="score-ring border-4 border-primary/40 bg-primary/10 glow-primary text-primary">{games.length}</div>
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Juegos en Catalogo</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="score-ring border-4 border-secondary/40 bg-secondary/10 glow-secondary text-secondary">{avgRating}</div>
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Calificacion Media</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="score-ring border-4 border-primary/40 bg-primary/10 text-primary">{perfectGames}</div>
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Titulos Perfectos (5/5)</p>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-secondary/20 glow-secondary">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50 text-secondary shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-secondary mb-1">CALIDAD VERIFICADA</p>
                <p className="text-body-md font-body-md text-on-surface-variant text-sm">Calificaciones calculadas en tiempo real desde las resenas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
