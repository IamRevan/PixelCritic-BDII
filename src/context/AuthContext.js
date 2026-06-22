"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// ============================================
// AuthContext - Estado de autenticacion global
// Almacena el usuario logueado en localStorage
// ============================================

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recuperar sesion al iniciar
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pixelcritic_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      // Ignorar errores de parseo
    }
    setLoading(false);
  }, []);

  // Funcion de login
  const login = async (username, password) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al iniciar sesion');
    }

    // Guardar en localStorage
    localStorage.setItem('pixelcritic_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Funcion de logout
  const logout = () => {
    localStorage.removeItem('pixelcritic_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
