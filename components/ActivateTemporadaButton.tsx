'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ActivateTemporadaButton({ temporadaId }: { temporadaId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const activate = async () => {
    setLoading(true);
    await fetch('/api/admin/temporadas/activar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temporadaId })
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={activate}
      disabled={loading}
      className="rounded bg-green-600 text-white px-3 py-2 text-sm disabled:opacity-50"
    >
      {loading ? 'Activando...' : 'Activar'}
    </button>
  );
}
