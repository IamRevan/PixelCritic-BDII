"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// ============================================
// Admin - Panel de gestion centralizada
// Solo accesible para admin y editor
// CRUD completo: juegos, usuarios,
// categorias, desarrolladoras y resenas
// ============================================

const catColors = { 'RPG': '#ddb7ff', 'Accion': '#ff8a65', 'Aventura': '#4ae176', 'Deportes': '#64b5f6', 'Estrategia': '#ffd54f', 'Shooter': '#ef5350' };
const roleColors = { 'admin': '#ff8a65', 'editor': '#ddb7ff', 'user': '#4ae176' };

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Data states
  const [games, setGames] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [desarrolladoras, setDesarrolladoras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [editGameModal, setEditGameModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [addGameModal, setAddGameModal] = useState(false);
  const [editCategoriaModal, setEditCategoriaModal] = useState(false);
  const [editDesarrolladoraModal, setEditDesarrolladoraModal] = useState(false);
  const [addCategoriaModal, setAddCategoriaModal] = useState(false);
  const [addDesarrolladoraModal, setAddDesarrolladoraModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [editingDesarrolladora, setEditingDesarrolladora] = useState(null);
  const [showSeedPrompt, setShowSeedPrompt] = useState(false);

  // Form states
  const [gameForm, setGameForm] = useState({ titulo: '', precio: '', categoria: '', anioLanzamiento: '', desarrolladora: '', descripcion: '', imagen: '' });
  const [userForm, setUserForm] = useState({ username: '', email: '', edad: '', rol: 'user', activo: true });

  // ── Redirect if not authenticated or role is "user" ──
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.rol === 'user') {
        router.push('/');
      }
    }
  }, [authLoading, user, router]);

  const isAdmin = user?.rol === 'admin';

  // ── Fetch all data ──
  const fetchData = useCallback(async () => {
    try {
      const [gRes, rRes, uRes, cRes, dRes] = await Promise.all([
        fetch('/api/juegos'), fetch('/api/resenas'), fetch('/api/usuarios'),
        fetch('/api/categorias'), fetch('/api/desarrolladoras'),
      ]);
      const gData = await gRes.json();
      const rData = await rRes.json();
      const uData = await uRes.json();
      const cData = await cRes.json();
      const dData = await dRes.json();
      setGames(Array.isArray(gData) ? gData : []);
      setReviews(Array.isArray(rData) ? rData : []);
      setUsers(Array.isArray(uData) ? uData : []);
      setCategorias(Array.isArray(cData) ? cData : []);
      setDesarrolladoras(Array.isArray(dData) ? dData : []);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setGames([]); setReviews([]); setUsers([]); setCategorias([]); setDesarrolladoras([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user && user.rol !== 'user') fetchData(); }, [user, fetchData]);

  useEffect(() => {
    if (!loading && games.length === 0) setShowSeedPrompt(true);
  }, [loading, games.length]);

  const handleSeed = async () => {
    setShowSeedPrompt(false);
    try {
      await fetch('/api/seed', { method: 'POST' });
      showToast('Base de datos poblada exitosamente.');
      fetchData();
    } catch (err) { showToast('Error al conectar con MongoDB.', 'error'); }
  };

  // ═════════════════════════════════════════════════════
  // GAME CRUD
  // ═════════════════════════════════════════════════════

  const openEditGame = (game) => {
    setEditingGame(game);
    setGameForm({
      titulo: game.titulo || '',
      precio: game.precio?.toString() || '',
      categoria: game.categoria || '',
      anioLanzamiento: game.anioLanzamiento?.toString() || '',
      desarrolladora: game.desarrolladora || '',
      descripcion: game.descripcion || '',
      imagen: game.imagen || '',
    });
    setEditGameModal(true);
  };

  const saveGameEdit = async (e) => {
    e.preventDefault();
    if (!editingGame) return;
    try {
      const res = await fetch('/api/juegos/' + editingGame._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: gameForm.titulo,
          precio: parseFloat(gameForm.precio),
          categoria: gameForm.categoria,
          anioLanzamiento: parseInt(gameForm.anioLanzamiento),
          desarrolladora: gameForm.desarrolladora,
          descripcion: gameForm.descripcion,
          imagen: gameForm.imagen,
        }),
      });
      if (res.ok) {
        showToast('"' + gameForm.titulo + '" actualizado correctamente.');
        setEditGameModal(false);
        fetchData();
      }
    } catch (err) { showToast('Error al actualizar.', 'error'); }
  };

  const deleteGame = async (game) => {
    if (!confirm('Eliminar "' + game.titulo + '" del inventario?')) return;
    try {
      const res = await fetch('/api/juegos/' + game._id, { method: 'DELETE' });
      if (res.ok) { showToast('"' + game.titulo + '" eliminado.', 'error'); fetchData(); }
    } catch (err) { showToast('Error al eliminar.', 'error'); }
  };

  const addGame = async (e) => {
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
        showToast('"' + gameForm.titulo + '" agregado.');
        setAddGameModal(false);
        setGameForm({ titulo: '', precio: '', categoria: '', anioLanzamiento: '', desarrolladora: '', descripcion: '' });
        fetchData();
      }
    } catch (err) { showToast('Error al agregar.', 'error'); }
  };

  // ═════════════════════════════════════════════════════
  // USER CRUD
  // ═════════════════════════════════════════════════════

  const openEditUser = (u) => {
    setEditingUser(u);
    setUserForm({ username: u.username, email: u.email, edad: u.edad?.toString() || '18', rol: u.rol || 'user', activo: u.activo !== false });
    setEditUserModal(true);
  };

  const saveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch('/api/usuarios/' + editingUser._id, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: userForm.rol, activo: userForm.activo, edad: parseInt(userForm.edad), email: userForm.email }),
      });
      if (res.ok) { showToast('Usuario ' + userForm.username + ' actualizado.'); setEditUserModal(false); fetchData(); }
    } catch (err) { showToast('Error al actualizar usuario.', 'error'); }
  };

  const deleteUser = async (u) => {
    if (!confirm('Eliminar usuario "' + u.username + '"?')) return;
    try {
      const res = await fetch('/api/usuarios/' + u._id, { method: 'DELETE' });
      if (res.ok) { showToast('Usuario "' + u.username + '" eliminado.', 'error'); fetchData(); }
    } catch (err) { showToast('Error al eliminar usuario.', 'error'); }
  };

  const createUser = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.value,
          email: form.email.value,
          password: form.password.value,
          edad: parseInt(form.edad.value),
          rol: form.rol.value,
          activo: true,
        }),
      });
      const data = await res.json();
      if (res.ok) { showToast('Usuario "' + data.username + '" creado con rol ' + data.rol + '.'); setCreateUserModal(false); form.reset(); fetchData(); }
      else { showToast(data.error || 'Error al crear usuario.', 'error'); }
    } catch (err) { showToast('Error al crear usuario.', 'error'); }
  };

  // ═════════════════════════════════════════════════════
  // CATEGORIA CRUD
  // ═════════════════════════════════════════════════════

  const openEditCategoria = (c) => {
    setEditingCategoria(c);
    setAddCategoriaModal(false);
    setEditCategoriaModal(true);
  };

  const saveCategoriaEdit = async (e) => {
    e.preventDefault();
    if (!editingCategoria) return;
    const form = e.target;
    try {
      const res = await fetch('/api/categorias/' + editingCategoria._id, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.value,
          descripcion: form.descripcion.value,
          popularidad: form.popularidad.value,
          aptaParaNinos: form.aptaParaNinos.checked,
        }),
      });
      if (res.ok) { showToast('Categoria "' + form.nombre.value + '" actualizada.'); setEditCategoriaModal(false); fetchData(); }
    } catch (err) { showToast('Error al actualizar categoria.', 'error'); }
  };

  const deleteCategoria = async (c) => {
    if (!confirm('Eliminar categoria "' + c.nombre + '"?')) return;
    try {
      const res = await fetch('/api/categorias/' + c._id, { method: 'DELETE' });
      if (res.ok) { showToast('Categoria "' + c.nombre + '" eliminada.', 'error'); fetchData(); }
    } catch (err) { showToast('Error al eliminar categoria.', 'error'); }
  };

  const addCategoria = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.value,
          descripcion: form.descripcion.value,
          popularidad: form.popularidad.value,
          aptaParaNinos: form.aptaParaNinos.checked,
        }),
      });
      if (res.ok) { showToast('Categoria "' + form.nombre.value + '" creada.'); setAddCategoriaModal(false); form.reset(); fetchData(); }
    } catch (err) { showToast('Error al crear categoria.', 'error'); }
  };

  // ═════════════════════════════════════════════════════
  // DESARROLLADORA CRUD
  // ═════════════════════════════════════════════════════

  const openEditDesarrolladora = (d) => {
    setEditingDesarrolladora(d);
    setAddDesarrolladoraModal(false);
    setEditDesarrolladoraModal(true);
  };

  const saveDesarrolladoraEdit = async (e) => {
    e.preventDefault();
    if (!editingDesarrolladora) return;
    const form = e.target;
    try {
      const res = await fetch('/api/desarrolladoras/' + editingDesarrolladora._id, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.value,
          pais: form.pais.value,
          anioFundacion: parseInt(form.anioFundacion.value),
          sitioWeb: form.sitioWeb.value,
        }),
      });
      if (res.ok) { showToast('Desarrolladora "' + form.nombre.value + '" actualizada.'); setEditDesarrolladoraModal(false); fetchData(); }
    } catch (err) { showToast('Error al actualizar desarrolladora.', 'error'); }
  };

  const deleteDesarrolladora = async (d) => {
    if (!confirm('Eliminar desarrolladora "' + d.nombre + '"?')) return;
    try {
      const res = await fetch('/api/desarrolladoras/' + d._id, { method: 'DELETE' });
      if (res.ok) { showToast('Desarrolladora "' + d.nombre + '" eliminada.', 'error'); fetchData(); }
    } catch (err) { showToast('Error al eliminar desarrolladora.', 'error'); }
  };

  const addDesarrolladora = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await fetch('/api/desarrolladoras', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.value,
          pais: form.pais.value,
          anioFundacion: parseInt(form.anioFundacion.value),
          sitioWeb: form.sitioWeb.value,
        }),
      });
      if (res.ok) { showToast('Desarrolladora "' + form.nombre.value + '" creada.'); setAddDesarrolladoraModal(false); form.reset(); fetchData(); }
    } catch (err) { showToast('Error al crear desarrolladora.', 'error'); }
  };

  // ═════════════════════════════════════════════════════
  // REVIEW CRUD
  // ═════════════════════════════════════════════════════

  const deleteReview = async (review) => {
    if (!confirm('Eliminar resena de "' + review.autor + '"?')) return;
    try {
      const res = await fetch('/api/resenas/' + review._id, { method: 'DELETE' });
      if (res.ok) { showToast('Resena de "' + review.autor + '" eliminada.', 'error'); fetchData(); }
    } catch (err) { showToast('Error al eliminar resena.', 'error'); }
  };

  // ═════════════════════════════════════════════════════
  // TOAST
  // ═════════════════════════════════════════════════════

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

  // ═════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-pulse">sync</span>
          <p className="text-on-surface-variant mt-4">{authLoading ? 'Cargando...' : 'Redirigiendo al login...'}</p>
        </div>
      </div>
    );
  }

  if (user?.rol === 'user') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-6xl text-error" style={{fontVariationSettings:"'FILL' 1"}}>lock</span>
        <p className="text-headline-md font-headline-md text-on-surface">Acceso Restringido</p>
        <p className="text-body-md font-body-md text-on-surface-variant">Solo administradores y editores pueden acceder al panel.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-pulse">sync</span>
          <p className="text-on-surface-variant mt-4">Cargando panel de administracion...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="pt-lg flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-label-sm font-label-sm text-secondary uppercase tracking-widest mb-2">Panel de Control</p>
          <h2 className="text-display-lg font-display-lg text-on-surface tracking-tight">Gestion <span className="text-primary">Admin</span></h2>
          <p className="text-body-lg font-body-lg text-on-surface-variant mt-2 max-w-2xl">
            Bienvenido, <span className="text-primary font-semibold">{user?.username}</span> ({user?.rol}). Control centralizado del inventario y la comunidad.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="glass-panel rounded-xl px-5 py-4 text-center min-w-[110px]">
            <p className="text-display-lg font-display-lg text-primary leading-none" style={{ fontSize: '32px' }}>{games.length}</p>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mt-1">Juegos</p>
          </div>
          <div className="glass-panel rounded-xl px-5 py-4 text-center min-w-[110px]">
            <p className="text-display-lg font-display-lg text-secondary leading-none" style={{ fontSize: '32px' }}>{users.length}</p>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mt-1">Usuarios</p>
          </div>
          <div className="glass-panel rounded-xl px-5 py-4 text-center min-w-[110px]">
            <p className="text-display-lg font-display-lg text-error leading-none" style={{ fontSize: '32px' }}>{reviews.length}</p>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mt-1">Resenas</p>
          </div>
        </div>
      </div>

      {/* Seed prompt banner */}
      {showSeedPrompt && (
        <div className="glass-panel rounded-xl p-6 mt-xl flex flex-col md:flex-row items-center justify-between gap-4 border-primary/40 bg-primary/5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-primary" style={{fontVariationSettings:"'FILL' 1"}}>database</span>
            <div>
              <p className="text-body-md font-body-md text-on-surface font-semibold">Base de datos vacia</p>
              <p className="text-label-sm font-label-sm text-on-surface-variant">Cargar datos de prueba con usuarios, juegos y resenas?</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={() => setShowSeedPrompt(false)} className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-label-sm text-label-sm uppercase hover:bg-surface-variant/30 transition-colors">Omitir</button>
            <button onClick={handleSeed} className="px-4 py-2 bg-primary text-on-primary-fixed rounded-lg font-label-sm text-label-sm uppercase transition-all hover:shadow-[0_0_20px_rgba(221,183,255,0.4)] border border-primary/30">Cargar Datos</button>
          </div>
        </div>
      )}

      {/* ── SECTION 1: GAMES ── */}
      <section className="flex flex-col gap-6 mt-xl">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">inventory_2</span>
            Inventario de Juegos
          </h3>
          <div className="flex items-center gap-3">
            <span className="bg-surface-variant text-on-surface-variant text-label-sm font-label-sm px-3 py-1 rounded-full uppercase">{games.length} Items</span>
            <button onClick={() => setAddGameModal(true)} className="flex items-center gap-2 bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 px-4 py-2 rounded-lg text-label-sm font-label-sm uppercase transition-all">
              <span className="material-symbols-outlined text-lg">add</span> Nuevo Juego
            </button>
          </div>
        </div>
        <div className="glass-panel rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto table-scroll">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container/50">
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Titulo</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Categoria</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Desarrolladora</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Ano</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Precio</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {games.map((g) => (
                  <tr key={g._id} className="hover:bg-surface-container-high/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex-shrink-0 flex items-center justify-center" style={{ border: '1px solid ' + (catColors[g.categoria] || '#4d4354') + '30' }}>
                          <span className="material-symbols-outlined text-sm" style={{ color: catColors[g.categoria] || '#cfc2d6' }}>sports_esports</span>
                        </div>
                        <div>
                          <span className="text-body-md font-body-md text-on-surface font-medium group-hover:text-primary transition-colors">{g.titulo}</span>
                          {g.descripcion && <p className="text-label-sm font-label-sm text-on-surface-variant truncate max-w-[200px]">{g.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-label-sm font-label-sm border" style={{ background: (catColors[g.categoria] || '#ddb7ff') + '18', color: catColors[g.categoria] || '#ddb7ff', borderColor: (catColors[g.categoria] || '#ddb7ff') + '30' }}>{g.categoria}</span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant font-label-sm">{g.desarrolladora || '-'}</td>
                    <td className="py-4 px-6 text-on-surface-variant font-label-sm">{g.anioLanzamiento}</td>
                    <td className="py-4 px-6 text-body-md font-body-md text-secondary font-mono">${(g.precio || 0).toFixed(2)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditGame(g)} className="inline-flex items-center gap-2 px-3 py-2 border border-secondary/50 text-secondary rounded-lg hover:bg-secondary/10 hover:border-secondary transition-all text-label-sm font-label-sm uppercase">
                          <span className="material-symbols-outlined text-[16px]">edit</span> Editar
                        </button>
                        <button onClick={() => deleteGame(g)} className="inline-flex items-center gap-2 px-3 py-2 border border-error/30 text-error rounded-lg hover:bg-error/10 hover:border-error transition-all text-label-sm font-label-sm uppercase">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: USERS ── */}
      <section className="flex flex-col gap-6 mt-xl">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">group</span>
            Gestion de Usuarios
          </h3>
          <div className="flex items-center gap-3">
            <span className="bg-surface-variant text-on-surface-variant text-label-sm font-label-sm px-3 py-1 rounded-full uppercase">{users.length} Usuarios</span>
            {isAdmin && (
              <button onClick={() => setCreateUserModal(true)} className="flex items-center gap-2 bg-secondary/20 text-secondary border border-secondary/40 hover:bg-secondary/30 px-4 py-2 rounded-lg text-label-sm font-label-sm uppercase transition-all">
                <span className="material-symbols-outlined text-lg">person_add</span> Crear Usuario
              </button>
            )}
          </div>
        </div>
        <div className="glass-panel rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto table-scroll">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container/50">
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Username</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Edad</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Rol</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
                  {isAdmin && <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Accion</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={'w-8 h-8 rounded-full flex items-center justify-center border ' + (u.rol === 'admin' ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : u.rol === 'editor' ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-secondary/20 border-secondary/30 text-secondary')}>
                          <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>person</span>
                        </div>
                        <span className="text-body-md font-body-md text-on-surface font-medium">{u.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant font-label-sm">{u.email}</td>
                    <td className="py-4 px-6 text-on-surface-variant font-label-sm">{u.edad}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 rounded-full text-label-sm font-label-sm" style={{ background: (roleColors[u.rol] || '#4ae176') + '18', color: roleColors[u.rol] || '#4ae176', border: '1px solid ' + (roleColors[u.rol] || '#4ae176') + '30' }}>{u.rol}</span>
                    </td>
                    <td className="py-4 px-6">
                      {u.activo ? (
                        <span className="px-2 py-1 rounded-full text-label-sm font-label-sm bg-secondary/15 text-secondary border border-secondary/30"> Activo</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-label-sm font-label-sm bg-error/15 text-error border border-error/30"> Inactivo</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditUser(u)} className="inline-flex items-center gap-2 px-3 py-2 border border-secondary/50 text-secondary rounded-lg hover:bg-secondary/10 transition-all text-label-sm font-label-sm uppercase">
                            <span className="material-symbols-outlined text-[16px]">edit</span> Rol
                          </button>
                          <button onClick={() => deleteUser(u)} className="inline-flex items-center gap-2 px-3 py-2 border border-error/30 text-error rounded-lg hover:bg-error/10 transition-all text-label-sm font-label-sm uppercase">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: CATEGORIES & DEVELOPERS ── */}
      <section className="flex flex-col gap-6 mt-xl">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">category</span>
            Categorias y Desarrolladoras
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories */}
          <div className="glass-panel rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container/50 flex items-center justify-between">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Categorias ({categorias.length})</p>
              <button onClick={() => setAddCategoriaModal(true)} className="flex items-center gap-1 text-secondary border border-secondary/40 hover:bg-secondary/10 px-3 py-1.5 rounded-lg text-label-sm font-label-sm uppercase transition-all">
                <span className="material-symbols-outlined text-sm">add</span> Anadir
              </button>
            </div>
            <div className="overflow-x-auto table-scroll">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container/30">
                    <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase">Nombre</th>
                    <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase">Popularidad</th>
                    <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase">Ninos</th>
                    <th className="py-3 px-4 text-right text-label-sm font-label-sm text-on-surface-variant uppercase">Accion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {categorias.map((c, i) => (
                    <tr key={c._id || i} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="py-3 px-4 text-body-md font-body-md text-on-surface">{c.nombre}</td>
                      <td className="py-3 px-4 text-on-surface-variant font-label-sm">{c.popularidad}</td>
                      <td className="py-3 px-4">{c.aptaParaNinos ? <span className="text-secondary text-label-sm font-label-sm">Si</span> : <span className="text-error text-label-sm font-label-sm">No</span>}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditCategoria(c)} className="p-2 text-on-surface-variant hover:text-secondary transition-colors" title="Editar">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => deleteCategoria(c)} className="p-2 text-on-surface-variant hover:text-error transition-colors" title="Eliminar">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Developers */}
          <div className="glass-panel rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container/50 flex items-center justify-between">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Desarrolladoras ({desarrolladoras.length})</p>
              <button onClick={() => setAddDesarrolladoraModal(true)} className="flex items-center gap-1 text-secondary border border-secondary/40 hover:bg-secondary/10 px-3 py-1.5 rounded-lg text-label-sm font-label-sm uppercase transition-all">
                <span className="material-symbols-outlined text-sm">add</span> Anadir
              </button>
            </div>
            <div className="overflow-x-auto table-scroll">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container/30">
                    <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase">Nombre</th>
                    <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase">Pais</th>
                    <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase">Fundacion</th>
                    <th className="py-3 px-4 text-right text-label-sm font-label-sm text-on-surface-variant uppercase">Accion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {desarrolladoras.map((d, i) => (
                    <tr key={d._id || i} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="py-3 px-4 text-body-md font-body-md text-on-surface">{d.nombre}</td>
                      <td className="py-3 px-4 text-on-surface-variant font-label-sm">{d.pais}</td>
                      <td className="py-3 px-4 text-on-surface-variant font-label-sm">{d.anioFundacion}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditDesarrolladora(d)} className="p-2 text-on-surface-variant hover:text-secondary transition-colors" title="Editar">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => deleteDesarrolladora(d)} className="p-2 text-on-surface-variant hover:text-error transition-colors" title="Eliminar">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: REVIEWS ── */}
      <section className="flex flex-col gap-6 mt-xl">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-error">gavel</span>
            Moderacion de Resenas
          </h3>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Reportes: {reviews.filter(r => r.calificacion <= 2).length}</span>
          </span>
        </div>
        <div className="glass-panel rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto table-scroll">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container/50">
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Autor</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Juego</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider w-24">Rating</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Comentario</th>
                  <th className="py-4 px-6 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {reviews.map((r) => {
                  const ratingColor = r.calificacion >= 4 ? 'text-secondary' : r.calificacion >= 3 ? 'text-primary' : 'text-error';
                  const isFlagged = r.calificacion <= 2;
                  return (
                    <tr key={r._id} className={'hover:bg-surface-container-high/30 transition-colors ' + (isFlagged ? 'bg-error/5' : '')}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">person</span></div>
                          <div>
                            <span className="text-body-md font-body-md text-on-surface font-medium block">{r.autor}</span>
                            {isFlagged && <span className="text-[10px] text-error font-label-sm uppercase tracking-wider"> Reportado</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant font-label-sm">{r.juego}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <span className={'material-symbols-outlined ' + ratingColor + ' text-[14px]'} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className={'text-body-md font-body-md ' + ratingColor + ' font-bold font-mono'}>{r.calificacion}.0</span>
                        </div>
                      </td>
                      <td className="py-4 px-6"><p className="text-body-md font-body-md text-on-surface-variant italic truncate max-w-xs">"{r.comentario}"</p></td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => deleteReview(r)} className="inline-flex items-center gap-2 px-3 py-2 border border-error/40 text-error rounded-lg hover:bg-error/10 hover:border-error transition-all text-label-sm font-label-sm uppercase">
                          <span className="material-symbols-outlined text-[16px]">delete</span> Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* MODAL: Full Edit Game */}
      {/* ═══════════════════════════════════════ */}
      {editGameModal && editingGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditGameModal(false)}></div>
          <div className="glass-panel modal-show relative w-full max-w-lg rounded-2xl shadow-2xl border border-primary/20 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
              <h3 className="text-headline-md font-headline-md text-primary font-bold">Editar Juego</h3>
              <button onClick={() => setEditGameModal(false)} className="text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={saveGameEdit} className="p-md overflow-y-auto flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Titulo</label>
                <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" value={gameForm.titulo} onChange={e => setGameForm({...gameForm, titulo: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Precio (USD)</label>
                  <div className="relative">
                    <span className="absolute left-0 top-2 text-on-surface-variant">$</span>
                    <input className="input-cyber w-full py-2 pl-4 text-body-md font-body-md text-secondary" type="number" step="0.01" min="0" value={gameForm.precio} onChange={e => setGameForm({...gameForm, precio: e.target.value})} required />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Ano</label>
                  <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" type="number" min="1980" max="2030" value={gameForm.anioLanzamiento} onChange={e => setGameForm({...gameForm, anioLanzamiento: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Categoria</label>
                  <select className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent" value={gameForm.categoria} onChange={e => setGameForm({...gameForm, categoria: e.target.value})} required>
                    <option value="">Selecciona...</option>
                    <option>RPG</option><option>Accion</option><option>Aventura</option>
                    <option>Deportes</option><option>Estrategia</option><option>Shooter</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Desarrolladora</label>
                  <select className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent" value={gameForm.desarrolladora} onChange={e => setGameForm({...gameForm, desarrolladora: e.target.value})}>
                    <option value="">Selecciona...</option>
                    {desarrolladoras.map(d => <option key={d._id} value={d.nombre}>{d.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">URL de Imagen</label>
                <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" value={gameForm.imagen} onChange={e => setGameForm({...gameForm, imagen: e.target.value})} placeholder="https://..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Descripcion</label>
                <textarea className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface min-h-[80px] resize-none" value={gameForm.descripcion} onChange={e => setGameForm({...gameForm, descripcion: e.target.value})} placeholder="Descripcion del juego..." />
              </div>
              <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-4">
                <button type="button" onClick={() => setEditGameModal(false)} className="px-6 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-label-sm text-label-sm uppercase hover:bg-surface-variant/30 transition-colors">Cancelar</button>
                <button type="submit" className="bg-secondary text-on-secondary hover:bg-secondary/80 px-6 py-2 rounded-lg font-label-sm text-label-sm uppercase transition-all shadow-[0_0_15px_rgba(74,225,118,0.2)]">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* MODALS: Add / Edit Categoria */}
      {/* ═══════════════════════════════════════ */}
      {addCategoriaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddCategoriaModal(false)}></div>
          <div className="glass-panel modal-show relative w-full max-w-md rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
              <h3 className="text-headline-md font-headline-md text-primary font-bold">Nueva Categoria</h3>
              <button onClick={() => setAddCategoriaModal(false)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={addCategoria} className="p-md flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Nombre *</label>
                <input name="nombre" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Descripcion</label>
                <input name="descripcion" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" placeholder="Descripcion breve" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Popularidad</label>
                  <select name="popularidad" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent" defaultValue="Media">
                    <option>Baja</option><option>Media</option><option>Alta</option><option>Muy Alta</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Apta para ninos</label>
                  <div className="flex items-center mt-2">
                    <input name="aptaParaNinos" type="checkbox" defaultChecked className="w-4 h-4 accent-secondary" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-4">
                <button type="button" onClick={() => setAddCategoriaModal(false)} className="px-6 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-label-sm text-label-sm uppercase hover:bg-surface-variant/30">Cancelar</button>
                <button type="submit" className="bg-secondary text-on-secondary hover:bg-secondary/80 px-6 py-2 rounded-lg font-label-sm text-label-sm uppercase transition-all shadow-[0_0_15px_rgba(74,225,118,0.2)]">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editCategoriaModal && editingCategoria && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditCategoriaModal(false)}></div>
          <div className="glass-panel modal-show relative w-full max-w-md rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
              <h3 className="text-headline-md font-headline-md text-primary font-bold">Editar: {editingCategoria.nombre}</h3>
              <button onClick={() => setEditCategoriaModal(false)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={saveCategoriaEdit} className="p-md flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Nombre</label>
                <input name="nombre" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" defaultValue={editingCategoria.nombre} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Descripcion</label>
                <input name="descripcion" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" defaultValue={editingCategoria.descripcion || ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Popularidad</label>
                  <select name="popularidad" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent" defaultValue={editingCategoria.popularidad || 'Media'}>
                    <option>Baja</option><option>Media</option><option>Alta</option><option>Muy Alta</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Apta para ninos</label>
                  <div className="flex items-center mt-2">
                    <input name="aptaParaNinos" type="checkbox" defaultChecked={editingCategoria.aptaParaNinos !== false} className="w-4 h-4 accent-secondary" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-4">
                <button type="button" onClick={() => setEditCategoriaModal(false)} className="px-6 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-label-sm text-label-sm uppercase hover:bg-surface-variant/30">Cancelar</button>
                <button type="submit" className="bg-primary text-on-primary-fixed hover:bg-primary-container px-6 py-2 rounded-lg font-label-sm text-label-sm uppercase transition-all shadow-[0_0_15px_rgba(221,183,255,0.2)]">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* MODALS: Add / Edit Desarrolladora */}
      {/* ═══════════════════════════════════════ */}
      {addDesarrolladoraModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddDesarrolladoraModal(false)}></div>
          <div className="glass-panel modal-show relative w-full max-w-md rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
              <h3 className="text-headline-md font-headline-md text-primary font-bold">Nueva Desarrolladora</h3>
              <button onClick={() => setAddDesarrolladoraModal(false)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={addDesarrolladora} className="p-md flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Nombre *</label>
                <input name="nombre" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Pais</label>
                  <input name="pais" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" placeholder="Ej. Japon" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Ano Fundacion</label>
                  <input name="anioFundacion" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" type="number" min="1900" max="2030" placeholder="2020" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Sitio Web</label>
                <input name="sitioWeb" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" placeholder="www.ejemplo.com" />
              </div>
              <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-4">
                <button type="button" onClick={() => setAddDesarrolladoraModal(false)} className="px-6 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-label-sm text-label-sm uppercase hover:bg-surface-variant/30">Cancelar</button>
                <button type="submit" className="bg-secondary text-on-secondary hover:bg-secondary/80 px-6 py-2 rounded-lg font-label-sm text-label-sm uppercase transition-all shadow-[0_0_15px_rgba(74,225,118,0.2)]">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editDesarrolladoraModal && editingDesarrolladora && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditDesarrolladoraModal(false)}></div>
          <div className="glass-panel modal-show relative w-full max-w-md rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
              <h3 className="text-headline-md font-headline-md text-primary font-bold">Editar: {editingDesarrolladora.nombre}</h3>
              <button onClick={() => setEditDesarrolladoraModal(false)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={saveDesarrolladoraEdit} className="p-md flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Nombre</label>
                <input name="nombre" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" defaultValue={editingDesarrolladora.nombre} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Pais</label>
                  <input name="pais" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" defaultValue={editingDesarrolladora.pais || ''} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Ano Fundacion</label>
                  <input name="anioFundacion" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" type="number" min="1900" max="2030" defaultValue={editingDesarrolladora.anioFundacion || ''} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Sitio Web</label>
                <input name="sitioWeb" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" defaultValue={editingDesarrolladora.sitioWeb || ''} />
              </div>
              <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-4">
                <button type="button" onClick={() => setEditDesarrolladoraModal(false)} className="px-6 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-label-sm text-label-sm uppercase hover:bg-surface-variant/30">Cancelar</button>
                <button type="submit" className="bg-primary text-on-primary-fixed hover:bg-primary-container px-6 py-2 rounded-lg font-label-sm text-label-sm uppercase transition-all shadow-[0_0_15px_rgba(221,183,255,0.2)]">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* MODAL: Edit User Role */}
      {/* ═══════════════════════════════════════ */}
      {editUserModal && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditUserModal(false)}></div>
          <div className="glass-panel modal-show relative w-full max-w-md rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
              <h3 className="text-headline-md font-headline-md text-primary font-bold">Editar: {editingUser.username}</h3>
              <button onClick={() => setEditUserModal(false)} className="text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={saveUserEdit} className="p-md flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Rol</label>
                <select className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent" value={userForm.rol} onChange={e => setUserForm({...userForm, rol: e.target.value})}>
                  <option value="user">user</option>
                  <option value="editor">editor</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Email</label>
                <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Edad</label>
                  <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" type="number" min="1" value={userForm.edad} onChange={e => setUserForm({...userForm, edad: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Estado</label>
                  <div className="flex items-center gap-3 mt-2">
                    <button type="button" onClick={() => setUserForm({...userForm, activo: true})} className={'px-4 py-2 rounded-lg text-label-sm font-label-sm uppercase border transition-all ' + (userForm.activo ? 'bg-secondary/20 text-secondary border-secondary/50' : 'border-outline-variant text-on-surface-variant')}>Activo</button>
                    <button type="button" onClick={() => setUserForm({...userForm, activo: false})} className={'px-4 py-2 rounded-lg text-label-sm font-label-sm uppercase border transition-all ' + (!userForm.activo ? 'bg-error/20 text-error border-error/50' : 'border-outline-variant text-on-surface-variant')}>Inactivo</button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-4">
                <button type="button" onClick={() => setEditUserModal(false)} className="px-6 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-label-sm text-label-sm uppercase hover:bg-surface-variant/30">Cancelar</button>
                <button type="submit" className="bg-primary text-on-primary-fixed hover:bg-primary-container px-6 py-2 rounded-lg font-label-sm text-label-sm uppercase transition-all shadow-[0_0_15px_rgba(221,183,255,0.2)]">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* MODAL: Create User */}
      {/* ═══════════════════════════════════════ */}
      {createUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCreateUserModal(false)}></div>
          <div className="glass-panel modal-show relative w-full max-w-md rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
              <h3 className="text-headline-md font-headline-md text-primary font-bold">Crear Nuevo Usuario</h3>
              <button onClick={() => setCreateUserModal(false)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={createUser} className="p-md flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Username *</label>
                  <input name="username" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Password *</label>
                  <input name="password" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" type="password" required />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Email *</label>
                <input name="email" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" type="email" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Edad</label>
                  <input name="edad" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" type="number" min="1" defaultValue="18" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Rol</label>
                  <select name="rol" className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent" defaultValue="user">
                    <option value="user">user</option>
                    <option value="editor">editor</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-4">
                <button type="button" onClick={() => setCreateUserModal(false)} className="px-6 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-label-sm text-label-sm uppercase hover:bg-surface-variant/30">Cancelar</button>
                <button type="submit" className="bg-secondary text-on-secondary hover:bg-secondary/80 px-6 py-2 rounded-lg font-label-sm text-label-sm uppercase transition-all shadow-[0_0_15px_rgba(74,225,118,0.2)]">Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* MODAL: Add Game */}
      {/* ═══════════════════════════════════════ */}
      {addGameModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAddGameModal(false)}></div>
          <div className="glass-panel modal-show relative w-full max-w-lg rounded-2xl shadow-2xl border border-primary/20 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50">
              <h3 className="text-headline-md font-headline-md text-primary font-bold">Nuevo Juego</h3>
              <button onClick={() => setAddGameModal(false)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={addGame} className="p-md overflow-y-auto flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Titulo *</label>
                <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" value={gameForm.titulo} onChange={e => setGameForm({...gameForm, titulo: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Precio *</label>
                  <div className="relative"><span className="absolute left-0 top-2 text-on-surface-variant">$</span>
                  <input className="input-cyber w-full py-2 pl-4 text-body-md font-body-md text-secondary" type="number" step="0.01" min="0" value={gameForm.precio} onChange={e => setGameForm({...gameForm, precio: e.target.value})} required /></div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Ano *</label>
                  <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" type="number" min="1980" max="2030" value={gameForm.anioLanzamiento} onChange={e => setGameForm({...gameForm, anioLanzamiento: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Categoria *</label>
                  <select className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent" value={gameForm.categoria} onChange={e => setGameForm({...gameForm, categoria: e.target.value})} required>
                    <option value="">Selecciona...</option>
                    <option>RPG</option><option>Accion</option><option>Aventura</option><option>Deportes</option><option>Estrategia</option><option>Shooter</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Desarrolladora</label>
                  <select className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface bg-transparent" value={gameForm.desarrolladora} onChange={e => setGameForm({...gameForm, desarrolladora: e.target.value})}>
                    <option value="">Selecciona...</option>
                    {desarrolladoras.map(d => <option key={d._id} value={d.nombre}>{d.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">URL Imagen</label>
                <input className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface" placeholder="https://..." value={gameForm.imagen} onChange={e => setGameForm({...gameForm, imagen: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant uppercase">Descripcion</label>
                <textarea className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface min-h-[80px] resize-none" placeholder="Descripcion del juego..." value={gameForm.descripcion} onChange={e => setGameForm({...gameForm, descripcion: e.target.value})} />
              </div>
              <div className="flex justify-end gap-4 border-t border-outline-variant/30 pt-4">
                <button type="button" onClick={() => setAddGameModal(false)} className="px-6 py-2 border border-secondary text-secondary rounded-lg font-label-sm text-label-sm uppercase hover:bg-secondary/10 transition-colors">Cancelar</button>
                <button type="submit" className="bg-primary text-on-primary-fixed hover:bg-primary-container px-6 py-2 rounded-lg font-label-sm text-label-sm uppercase transition-all shadow-[0_0_15px_rgba(221,183,255,0.2)]">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
