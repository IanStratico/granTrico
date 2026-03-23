'use client';

import { useState } from 'react';

export default function ImportJugadoresForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ procesados?: number; errores?: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/jugadores/import', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Error al importar');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError('Error al importar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-base"
      />
      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || loading}
        className="rounded bg-blue-600 text-white px-4 py-2 text-base disabled:opacity-60"
      >
        {loading ? 'Importando...' : 'Confirmar importación'}
      </button>
      <p className="text-xs text-gray-500">Formato: nombre,apellido,apodo,camada,posicion</p>
      {loading && <p className="text-sm text-gray-700">Procesando...</p>}
      {result && (
        <p className="text-sm text-gray-800">
          Procesados: {result.procesados ?? 0} · Errores: {result.errores?.length ?? 0}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
