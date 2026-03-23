'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Error al registrar');
    } else {
      setMessage('Registrado con éxito. Ahora podés iniciar sesión.');
      setNombre('');
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Registro</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2 text-base"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2 text-base"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2 text-base"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 text-white px-4 py-2 text-base disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        <div className="text-center text-sm text-gray-700 space-x-1">
          <span>¿Ya tenés cuenta?</span>
          <a href="/login" className="text-blue-600 underline">
            Iniciar sesión
          </a>
        </div>
      </form>
      {message && <p className="text-green-700 text-sm">{message}</p>}
      {error && <p className="text-red-700 text-sm">{error}</p>}
    </main>
  );
}
