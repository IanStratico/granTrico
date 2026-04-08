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
        className="border border-[#c8a951] rounded px-3 py-2 text-base w-full bg-[#1a3a6b] text-[#f5f0e0] placeholder-[#f5f0e0]/50"
      />
      <button className="rounded bg-[#1a6b3a] border border-[#c8a951] text-[#f5f0e0] px-4 py-2 text-base disabled:opacity-50" disabled={loading}>
        {loading ? 'Creando...' : 'Crear'}
      </button>
    </form>
  );
}
