"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import ImageWithFallback from '@/components/ImageWithFallback';
import ConfirmModal from '@/components/ConfirmModal';
import { GameCardSkeleton } from '@/components/SkeletonCard';

const categoryColors = {
  'RPG': '#ddb7ff', 'Accion': '#ff8a65', 'Aventura': '#4ae176',
  'Deportes': '#64b5f6', 'Estrategia': '#ffd54f', 'Shooter': '#ef5350'
};

function getStars(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) =>
    '<span class="material-symbols-outlined text-sm ' + (i < full ? 'text-secondary' : 'text-outline-variant') + '" style="font-variation-settings:\'FILL\' ' + (i < full ? 1 : 0) + ';">star</span>'
  ).join('');
}

const sortOptions = [
  { label: 'Precio ↓', value: 'precio-desc' },
  { label: 'Precio ↑', value: 'precio-asc' },
  { label: 'Nombre A-Z', value: 'nombre-asc' },
  { label: 'Nombre Z-A', value: 'nombre-desc' },
  { label: 'Rating ↓', value: 'rating-desc' },
  { label: 'Rating ↑', value: 'rating-asc' },
  { label: 'Año ↓', value: 'anio-desc' },
  { label: 'Año ↑', value: 'anio-asc' },
];

export default function CatalogoPage() {
  const { user, loading: authLoading } = useAuth();
  const [games, setGames] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('precio-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [desarrolladoras, setDesarrolladoras] = useState([]);

  const [gameForm, setGameForm] = useState({ titulo: '', precio: '', categoria: '', anioLanzamiento: '', desarrolladora: '', descripcion: '', imagen: '' });

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editForm, setEditForm] = useState({ titulo: '', precio: '', categoria: '', anioLanzamiento: '', desarrolladora: '', descripcion: '', imagen: '' });

  const router = useRouter();
  const canEdit = user && (user.rol === 'admin' || user.rol === 'editor');

  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('/api/juegos');
      const data = await res.json();
      setGames(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar juegos:', err);
      setGames([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    fetch('/api/categorias').then(r => r.json()).then(d => setCategorias(Array.isArray(d) ? d : [])).catch(() => {});
    fetch('/api/desarrolladoras').then(r => r.json()).then(d => setDesarrolladoras(Array.isArray(d) ? d : [])).catch(() => {});
  }, [fetchGames]);

  const [showSeedPrompt, setShowSeedPrompt] = useState(false);
  useEffect(() => {
    if (!loading && games.length === 0) setShowSeedPrompt(true);
  }, [loading, games.length]);

  const handleSeed = async () => {
    setShowSeedPrompt(false);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      showToast('Base de datos poblada: ' + (data.colecciones?.juegos || 0) + ' juegos.');
      fetchGames();
    } catch (err) {
      showToast('Error al conectar con MongoDB. Verifica que el servicio este corriendo.', 'error');
    }
  };

  const gameList = Array.isArray(games) ? games : [];
  const filteredGames = gameList
    .filter(g => {
      const matchFilter = currentFilter === 'Todos' || g.categoria === currentFilter;
      const matchSearch = g.titulo.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          (g.categoria || '').toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      const [field, dir] = sortBy.split('-');
      const mul = dir === 'asc' ? 1 : -1;
      if (field === 'precio') return (a.precio || 0) > (b.precio || 0) ? mul : -mul;
      if (field === 'nombre') return a.titulo.localeCompare(b.titulo) * mul;
      if (field === 'rating') return ((a.calificacion || 0) > (b.calificacion || 0) ? mul : -mul);
      if (field === 'anio') return ((a.anioLanzamiento || 0) > (b.anioLanzamiento || 0) ? mul : -mul);
      return 0;
    });

  const handleAddGame = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/juegos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: gameForm.titulo,
          precio: parseFloat(gameForm.precio),
          categoria: gameForm.categoria,
          anioLanzamiento: parseInt(gameForm.anioLanzamiento),
          desarrolladora: gameForm.desarrolladora || 'Sin asignar',
          descripcion: gameForm.descripcion || '',
          imagen: gameForm.imagen || '',
        }),
      });
      if (res.ok) {
        showToast('"' + gameForm.titulo + '" anadido al catalogo.');
        setGameForm({ titulo: '', precio: '', categoria: '', anioLanzamiento: '', desarrolladora: '', descripcion: '', imagen: '' });
        setModalOpen(false);
        fetchGames();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Error al anadir el juego.', 'error');
      }
    } catch (err) {
      showToast('Error de conexion.', 'error');
    }
  };

  const openEditModal = (game) => {
    if (!canEdit) { showToast('Debes iniciar sesion como admin/editor.', 'error'); return; }
    setEditingGame(game);
    setEditForm({
      titulo: game.titulo || '',
      precio: game.precio?.toString() || '',
      categoria: game.categoria || '',
      anioLanzamiento: game.anioLanzamiento?.toString() || '',
      desarrolladora: game.desarrolladora || '',
      descripcion: game.descripcion || '',
      imagen: game.imagen || '',
    });
    setEditModalOpen(true);
  };

  const handleEditGame = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/juegos/' + editingGame._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: editForm.titulo,
          precio: parseFloat(editForm.precio),
          categoria: editForm.categoria,
          anioLanzamiento: parseInt(editForm.anioLanzamiento),
          desarrolladora: editForm.desarrolladora || 'Sin asignar',
          descripcion: editForm.descripcion || '',
          imagen: editForm.imagen || '',
        }),
      });
      if (res.ok) {
        showToast('"' + editForm.titulo + '" actualizado correctamente.');
        setEditModalOpen(false);
        setEditingGame(null);
        fetchGames();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Error al actualizar.', 'error');
      }
    } catch (err) {
      showToast('Error de conexion.', 'error');
    }
  };

  const confirmDeleteGame = (game) => {
    if (!canEdit) { showToast('Debes iniciar sesion como admin/editor.', 'error'); return; }
    setConfirmDelete({ game, type: 'game' });
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { game } = confirmDelete;
    try {
      const res = await fetch('/api/juegos/' + game._id, { method: 'DELETE' });
      if (res.ok) {
        showToast('"' + game.titulo + '" eliminado.', 'error');
        fetchGames();
      }
    } catch (err) {
      showToast('Error al eliminar.', 'error');
    } finally {
      setConfirmDelete(null);
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

  if (loading || authLoading) {
    return (
      <div>
        <div className="h-10 w-48 bg-surface-variant rounded animate-pulse mb-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <GameCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-md mb-xl">
        <div>
          <p className="text-label-sm font-label-sm text-secondary uppercase tracking-widest mb-2">PixelCriticDB</p>
          <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface tracking-tight mb-xs">Catalogo Central</h2>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-2xl">Explora y gestiona la base de datos de titulos editoriales.</p>
        </div>
        {canEdit ? (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-primary text-on-primary-fixed hover:bg-primary-container px-6 py-3 rounded-lg font-label-sm text-label-sm uppercase transition-all duration-300 shadow-[0_0_20px_rgba(221,183,255,0.25)] hover:shadow-[0_0_30px_rgba(221,183,255,0.5)] border border-primary/30 shrink-0">
            <span className="material-symbols-outlined">add_circle</span>
            Anadir Juego
          </button>
        ) : user ? (
          <div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-2 border-secondary/30">
            <span className="material-symbols-outlined text-secondary text-lg" style={{fontVariationSettings:"'FILL' 1"}}>visibility</span>
            <span className="text-label-sm font-label-sm text-on-surface-variant">Modo solo lectura</span>
          </div>
        ) : (
          <button onClick={() => router.push('/login')} className="flex items-center gap-2 border border-primary/40 text-primary hover:bg-primary/10 px-6 py-3 rounded-lg font-label-sm text-label-sm uppercase transition-all shrink-0">
            <span className="material-symbols-outlined">login</span>
            Iniciar Sesion
          </button>
        )}
      </div>

      <div className="glass-panel rounded-xl p-4 mb-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="hidden md:flex flex-1 max-w-md focus-within:ring-2 focus-within:ring-secondary/50 rounded-full bg-surface-container-low px-4 py-2 items-center gap-2 border border-outline-variant/50">
          <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
          <input
            className="bg-transparent border-none text-body-md font-body-md text-on-surface placeholder-on-surface-variant focus:ring-0 w-full outline-none"
            placeholder="Buscar juegos..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div id="filterBtns" className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
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
        <div className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant whitespace-nowrap">
          <span className="material-symbols-outlined text-sm">sort</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border border-outline-variant/50 rounded-lg px-2 py-1 text-label-sm font-label-sm text-on-surface cursor-pointer outline-none focus:border-secondary/50"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-surface">{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {showSeedPrompt && (
        <div className="glass-panel rounded-xl p-6 mb-lg flex flex-col md:flex-row items-center justify-between gap-4 border-primary/40 bg-primary/5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-primary" style={{fontVariationSettings:"'FILL' 1"}}>database</span>
            <div>
              <p className="text-body-md font-body-md text-on-surface font-semibold">Base de datos vacia</p>
              <p className="text-label-sm font-label-sm text-on-surface-variant">Desea cargar los datos de prueba con 17 juegos reales?</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={() => setShowSeedPrompt(false)} className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-label-sm text-label-sm uppercase hover:bg-surface-variant/30 transition-colors">Omitir</button>
            <button onClick={handleSeed} className="px-4 py-2 bg-primary text-on-primary-fixed rounded-lg font-label-sm text-label-sm uppercase transition-all hover:shadow-[0_0_20px_rgba(221,183,255,0.4)] border border-primary/30">Cargar Datos</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.length === 0 ? (
          <div className="col-span-full text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl opacity-30 block mb-4">search_off</span>
            <p className="text-body-lg font-body-lg">No se encontraron juegos con ese filtro.</p>
          </div>
        ) : (
          filteredGames.map((g) => (
            <div key={g._id} className="game-card rounded-2xl overflow-hidden group cursor-pointer flex flex-col h-full relative" onClick={() => router.push('/juego/' + g._id)}>
              <div className="absolute top-3 right-3 z-10 bg-surface/80 backdrop-blur-md border border-outline-variant/50 px-2 py-1 rounded-lg text-label-sm font-label-sm text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                {(g.calificacion || 0).toFixed(1)}
              </div>
              <div className="h-48 w-full relative overflow-hidden bg-surface-container-high">
                <ImageWithFallback
                  src={g.imagen}
                  alt={g.titulo}
                  className="w-full h-full object-cover"
                  fallbackIcon="sports_esports"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent pointer-events-none"></div>
              </div>
              <div className="p-md flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-label-sm uppercase tracking-wider border" style={{ background: (categoryColors[g.categoria] || '#ddb7ff') + '18', color: categoryColors[g.categoria] || '#ddb7ff', borderColor: (categoryColors[g.categoria] || '#ddb7ff') + '30' }}>
                    {g.categoria}
                  </span>
                  <span className="text-on-surface-variant text-label-sm font-label-sm">{g.anioLanzamiento}</span>
                </div>
                <h3 className="text-headline-md font-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors leading-tight">{g.titulo}</h3>
                <p className="text-xs text-on-surface-variant font-label-sm mb-2">{g.desarrolladora || ''}</p>
                <div className="flex items-center gap-1 mb-3" dangerouslySetInnerHTML={{ __html: getStars(g.calificacion || 0) }}></div>
                <div className="mt-auto pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                  <span className="text-body-lg font-body-lg font-semibold text-secondary">${(g.precio || 0).toFixed(2)}</span>
                  {canEdit && (
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(g); }} className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded" title="Editar">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); confirmDeleteGame(g); }} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded" title="Eliminar">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Modals ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="glass-panel modal-show relative w-full max-w-lg rounded-2xl shadow-2xl border border-primary/20 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
              <h3 className="text-headline-md font-headline-md text-primary font-bold tracking-tight">Nuevo Juego</h3>
              <button onClick={() => setModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors w-8 h-8 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddGame} className="p-md overflow-y-auto flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Titulo del Juego *</label>
                <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" placeholder="Ej. The Legend of Capibara" required type="text" value={gameForm.titulo} onChange={e => setGameForm({...gameForm, titulo: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Precio (USD) *</label>
                  <div className="relative"><span className="absolute left-0 top-2 text-on-surface-variant text-sm">$</span>
                  <input className="input-cyber w-full py-2 pl-4 text-body-md font-body-md text-secondary" placeholder="59.99" required step="0.01" min="0" type="number" value={gameForm.precio} onChange={e => setGameForm({...gameForm, precio: e.target.value})} /></div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Ano de Lanzamiento *</label>
                  <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" max="2030" min="1980" placeholder="2025" required type="number" value={gameForm.anioLanzamiento} onChange={e => setGameForm({...gameForm, anioLanzamiento: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Categoria *</label>
                  <select className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent appearance-none cursor-pointer" required value={gameForm.categoria} onChange={e => setGameForm({...gameForm, categoria: e.target.value})}>
                    <option value="">Selecciona...</option>
                    <option value="RPG">RPG</option><option value="Accion">Accion</option><option value="Aventura">Aventura</option>
                    <option value="Deportes">Deportes</option><option value="Estrategia">Estrategia</option><option value="Shooter">Shooter</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Desarrolladora</label>
                  <select className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent appearance-none cursor-pointer" value={gameForm.desarrolladora} onChange={e => setGameForm({...gameForm, desarrolladora: e.target.value})}>
                    <option value="">Selecciona...</option>
                    {desarrolladoras.map(d => <option key={d._id} value={d.nombre}>{d.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">URL de Imagen</label>
                <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" placeholder="https://..." value={gameForm.imagen} onChange={e => setGameForm({...gameForm, imagen: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Descripcion</label>
                <textarea className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface min-h-[80px] resize-none" placeholder="Descripcion del juego..." value={gameForm.descripcion} onChange={e => setGameForm({...gameForm, descripcion: e.target.value})} />
              </div>
              <div className="mt-2 flex justify-end gap-4 border-t border-outline-variant/30 pt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 border border-secondary text-secondary rounded-lg font-label-sm text-label-sm uppercase hover:bg-secondary/10 transition-colors">Cancelar</button>
                <button type="submit" className="bg-primary text-on-primary-fixed hover:bg-primary-container px-6 py-2 rounded-lg font-label-sm text-label-sm uppercase transition-all duration-300 shadow-[0_0_15px_rgba(221,183,255,0.2)] hover:shadow-[0_0_25px_rgba(221,183,255,0.5)]">Guardar Titulo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModalOpen && editingGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setEditModalOpen(false); setEditingGame(null); }}></div>
          <div className="glass-panel modal-show relative w-full max-w-lg rounded-2xl shadow-2xl border border-secondary/20 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
              <h3 className="text-headline-md font-headline-md text-secondary font-bold tracking-tight">Editar Juego</h3>
              <button onClick={() => { setEditModalOpen(false); setEditingGame(null); }} className="text-on-surface-variant hover:text-error transition-colors w-8 h-8 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleEditGame} className="p-md overflow-y-auto flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Titulo del Juego *</label>
                <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" required type="text" value={editForm.titulo} onChange={e => setEditForm({...editForm, titulo: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Precio (USD) *</label>
                  <div className="relative"><span className="absolute left-0 top-2 text-on-surface-variant text-sm">$</span>
                  <input className="input-cyber w-full py-2 pl-4 text-body-md font-body-md text-secondary" required step="0.01" min="0" type="number" value={editForm.precio} onChange={e => setEditForm({...editForm, precio: e.target.value})} /></div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Ano de Lanzamiento *</label>
                  <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" max="2030" min="1980" required type="number" value={editForm.anioLanzamiento} onChange={e => setEditForm({...editForm, anioLanzamiento: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Categoria *</label>
                  <select className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent appearance-none cursor-pointer" required value={editForm.categoria} onChange={e => setEditForm({...editForm, categoria: e.target.value})}>
                    <option value="">Selecciona...</option>
                    <option value="RPG">RPG</option><option value="Accion">Accion</option><option value="Aventura">Aventura</option>
                    <option value="Deportes">Deportes</option><option value="Estrategia">Estrategia</option><option value="Shooter">Shooter</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Desarrolladora</label>
                  <select className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent appearance-none cursor-pointer" value={editForm.desarrolladora} onChange={e => setEditForm({...editForm, desarrolladora: e.target.value})}>
                    <option value="">Selecciona...</option>
                    {desarrolladoras.map(d => <option key={d._id} value={d.nombre}>{d.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">URL de Imagen</label>
                <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" placeholder="https://..." value={editForm.imagen} onChange={e => setEditForm({...editForm, imagen: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Descripcion</label>
                <textarea className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface min-h-[80px] resize-none" placeholder="Descripcion del juego..." value={editForm.descripcion} onChange={e => setEditForm({...editForm, descripcion: e.target.value})} />
              </div>
              <div className="mt-2 flex justify-end gap-4 border-t border-outline-variant/30 pt-6">
                <button type="button" onClick={() => { setEditModalOpen(false); setEditingGame(null); }} className="px-6 py-2 border border-secondary text-secondary rounded-lg font-label-sm text-label-sm uppercase hover:bg-secondary/10 transition-colors">Cancelar</button>
                <button type="submit" className="bg-secondary text-on-surface rounded-lg px-6 py-2 font-label-sm text-label-sm uppercase transition-all duration-300 shadow-[0_0_15px_rgba(74,225,118,0.2)] hover:shadow-[0_0_25px_rgba(74,225,118,0.5)]">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete !== null}
        title="Eliminar Juego"
        message={'Esta seguro de eliminar "' + (confirmDelete?.game?.titulo || '') + '" del catalogo? Esta accion no se puede deshacer.'}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        danger={true}
      />
    </>
  );
}
