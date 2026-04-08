'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateFechaForm() {
  const [nro, setNro] = useState<number | ''>('');
  const [rival, setRival] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/admin/fechas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nro: Number(nro), rival })
    });
    setLoading(false);
    setNro('');
    setRival('');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-2 max-w-xs">
      <input
        type="number"
        value={nro}
        onChange={(e) => setNro(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder="Nro"
        required
        className="border border-[#c8a951] rounded px-3 py-2 text-base w-full bg-[#1a3a6b] text-[#f5f0e0] placeholder-[#f5f0e0]/50"
      />
      <input
        type="text"
        value={rival}
        onChange={(e) => setRival(e.target.value)}
        placeholder="Rival"
        required
        className="border border-[#c8a951] rounded px-3 py-2 text-base w-full bg-[#1a3a6b] text-[#f5f0e0] placeholder-[#f5f0e0]/50"
      />
      <button className="rounded bg-[#1a6b3a] border border-[#c8a951] text-[#f5f0e0] px-4 py-2 text-base disabled:opacity-50" disabled={loading}>
        {loading ? 'Creando...' : 'Crear'}
      </button>
    </form>
  );
}
