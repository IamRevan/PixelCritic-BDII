"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import './globals.css';

// ============================================
// Layout principal con sidebar y topbar
// Incluye AuthProvider para gestion de sesion
// ============================================

function NavBar({ children }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const links = [
    { href: "/", label: "Catalogo", icon: "grid_view" },
    { href: "/admin", label: "Administracion", icon: "settings_applications" },
    { href: "/premium", label: "Favoritos del Equipo", icon: "workspace_premium" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const toggleNav = () => setNavOpen(!navOpen);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // No mostrar sidebar en la pagina de login
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div>
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* ── Side Navigation ── */}
      <nav className={`fixed left-0 top-0 h-screen w-64 z-40 bg-surface-container-low/90 backdrop-blur-xl border-r border-outline-variant/30 flex flex-col py-md transition-transform duration-300 ${navOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-gutter mb-lg">
          <h1 className="text-headline-md font-headline-md font-bold text-primary tracking-tight">PixelCritic</h1>
          <p className="text-label-sm font-label-sm text-on-surface-variant mt-xs">Gamer Editorial</p>
        </div>
        <div className="flex-1 flex flex-col gap-2 px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setNavOpen(false)}
              className={`flex items-center gap-4 rounded-full px-4 py-3 transition-all duration-300 ${
                isActive(link.href)
                  ? 'nav-active'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
              }`}
            >
              <span className="material-symbols-outlined" style={isActive(link.href) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {link.icon}
              </span>
              <span className="text-label-sm font-label-sm">{link.label}</span>
            </Link>
          ))}
        </div>
        <div className="px-gutter mt-auto flex items-center gap-sm">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant overflow-hidden">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "28px" }}>account_circle</span>
          </div>
          <div className="flex flex-col">
            <span className="text-label-sm font-label-sm text-on-surface">{user ? user.username : 'Invitado'}</span>
            <span className="text-xs text-secondary font-label-sm">{user ? user.rol : 'Sin sesion'}</span>
          </div>
        </div>
      </nav>

      {/* ── Nav Overlay (mobile) ── */}
      {navOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={toggleNav}></div>
      )}

      {/* ── Top Bar ── */}
      <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center h-20 px-gutter md:ml-64">
        <div className="flex items-center gap-sm">
          <button onClick={toggleNav} className="md:hidden text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-headline-md font-headline-md font-black text-primary md:hidden">PixelCritic</span>
        </div>
        <div className="hidden md:flex flex-1 max-w-md"></div>
        <div className="flex items-center gap-md ml-auto">
          {user ? (
            <>
              <span className="text-label-sm font-label-sm text-on-surface-variant hidden sm:block">{user.username} ({user.rol})</span>
              <button onClick={handleLogout} className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:border-error/30">
                <span className="material-symbols-outlined text-lg">logout</span>
                <span className="text-label-sm font-label-sm hidden sm:inline">Salir</span>
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 rounded-lg text-label-sm font-label-sm uppercase transition-all">
              <span className="material-symbols-outlined text-lg">login</span>
              <span className="hidden sm:inline">Iniciar Sesion</span>
            </Link>
          )}
          <button className="text-on-surface-variant hover:text-primary transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 pt-24 pb-16 md:ml-64 px-4 md:px-gutter min-h-screen">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 bg-surface-container-lowest md:ml-64 py-base border-t border-outline-variant/20 flex flex-wrap justify-between items-center gap-4 px-gutter">
        <span className="text-label-sm font-label-sm font-bold text-primary">PixelCritic</span>
        <div className="flex gap-4">
          <a className="text-label-sm font-label-sm text-on-tertiary-fixed-variant hover:text-secondary transition-colors" href="#">Terminos</a>
          <a className="text-label-sm font-label-sm text-on-tertiary-fixed-variant hover:text-secondary transition-colors" href="#">Privacidad</a>
          <a className="text-label-sm font-label-sm text-on-tertiary-fixed-variant hover:text-secondary transition-colors" href="#">Contacto</a>
        </div>
        <span className="text-label-sm font-label-sm text-on-tertiary-fixed-variant hidden md:block">Desarrollado por el Grupo Tecno Capibara</span>
      </footer>

      {/* ── Toast Container ── */}
      <div id="toast-container" className="fixed bottom-6 right-4 md:right-gutter z-[110] flex flex-col gap-2 pointer-events-none"></div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="PixelCritic - Plataforma de catalogos y resenas de videojuegos" />
        <title>PixelCritic - Gamer Editorial</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>" />
      </head>
      <body className="bg-background text-on-background min-h-screen font-body-md selection:bg-primary-container selection:text-on-primary-container">
        <AuthProvider>
          <NavBar>{children}</NavBar>
        </AuthProvider>
      </body>
    </html>
  );
}
