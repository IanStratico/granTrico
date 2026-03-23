'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTemporadaForm() {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/admin/temporadas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre })
    });
    setLoading(false);
    setNombre('');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        required
        className="border rounded px-3 py-2 text-base w-full"
      />
      <button className="rounded bg-blue-600 text-white px-4 py-2 text-base disabled:opacity-50" disabled={loading}>
        {loading ? 'Creando...' : 'Crear'}
      </button>
    </form>
  );
}
