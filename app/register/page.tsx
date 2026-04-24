'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Error al registrar');
      setLoading(false);
    } else {
      router.push('/login');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#0d1f35' }}
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Logo + título */}
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="GranTrico" width={72} height={72} className="rounded-xl" />
          <div className="text-center">
            <h1 className="text-2xl font-bold" style={{ color: '#c8a951' }}>Trico Fantasy</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(245,240,224,0.55)' }}>Fantasy rugby del club</p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: '#1a3a6b', border: '1px solid #c8a951' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: '#f5f0e0' }}>Crear cuenta</h2>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(245,240,224,0.6)' }}>
                Nombre
              </label>
              <input
                type="text"
                required
                autoComplete="name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                style={{ background: '#0d1f35', border: '1px solid rgba(200,169,81,0.5)', color: '#f5f0e0' }}
                placeholder="Tu nombre"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(245,240,224,0.6)' }}>
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                style={{ background: '#0d1f35', border: '1px solid rgba(200,169,81,0.5)', color: '#f5f0e0' }}
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(245,240,224,0.6)' }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                style={{ background: '#0d1f35', border: '1px solid rgba(200,169,81,0.5)', color: '#f5f0e0' }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold disabled:opacity-50 transition-opacity"
              style={{ background: '#1a6b3a', border: '1px solid #c8a951', color: '#f5f0e0' }}
            >
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm" style={{ color: 'rgba(245,240,224,0.55)' }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" style={{ color: '#c8a951' }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
