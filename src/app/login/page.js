"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// ============================================
// Login - Pagina de inicio de sesion
// Muestra credenciales genericas visibles
// ============================================

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      router.push('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <div className="glass-panel rounded-2xl w-full max-w-md p-lg relative z-10 border-primary/20 shadow-[0_0_40px_rgba(221,183,255,0.1)]">
        {/* Logo */}
        <div className="text-center mb-lg">
          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-primary" style={{fontVariationSettings:"'FILL' 1"}}>account_circle</span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-primary font-bold">PixelCritic</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-2">Inicia sesion para gestionar el catalogo</p>
        </div>

        {/* Default credentials */}
        <div className="bg-surface-container-high/50 rounded-xl p-4 mb-lg border border-outline-variant/30">
          <p className="text-label-sm font-label-sm text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">info</span> Credenciales de prueba
          </p>
          <div className="flex flex-col gap-1 text-body-md font-body-md text-on-surface-variant">
            <p><span className="text-primary">Admin:</span> admin / admin123</p>
            <p><span className="text-primary">Admin:</span> SamuelJ / samuel123</p>
            <p><span className="text-primary">Admin:</span> AdminCapibara / capibara2025</p>
            <p><span className="text-primary">Editor:</span> MariangelO / mari123</p>
            <p><span className="text-primary">Editor:</span> FabianaR / fabi123</p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-error/10 border border-error/30 rounded-xl p-3 mb-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-sm" style={{fontVariationSettings:"'FILL' 1"}}>error</span>
            <p className="text-body-md font-body-md text-error text-sm">{error}</p>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Usuario</label>
            <input
              className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              type="text"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Contrasena</label>
            <input
              className="input-cyber w-full py-2 text-body-md font-body-md text-on-surface"
              placeholder="Ingresa tu contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary-fixed hover:bg-primary-container py-3 rounded-lg font-label-sm text-label-sm uppercase transition-all duration-300 shadow-[0_0_20px_rgba(221,183,255,0.25)] hover:shadow-[0_0_30px_rgba(221,183,255,0.5)] border border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="material-symbols-outlined animate-spin text-sm">sync</span> Verificando...</>
            ) : (
              <><span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>login</span> Iniciar Sesion</>
            )}
          </button>
        </form>

        {/* Back link */}
        <div className="mt-6 text-center">
          <a href="/" className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver al Catalogo
          </a>
        </div>
      </div>
    </div>
  );
}
