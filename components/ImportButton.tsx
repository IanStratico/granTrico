'use client';

import { useState } from 'react';

interface Props {
  label: string;
  endpoint: string;
  extraFields?: Record<string, string | number>;
}

export default function ImportButton({ label, endpoint, extraFields }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ procesados?: number; errores?: any[] } | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    const form = new FormData();
    form.append('file', file);
    if (extraFields) {
      Object.entries(extraFields).forEach(([k, v]) => form.append(k, String(v)));
    }
    const res = await fetch(endpoint, { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
      />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="rounded bg-[#1a6b3a] border border-[#c8a951] text-[#f5f0e0] px-3 py-2 text-sm disabled:opacity-50"
      >
        {loading ? 'Procesando...' : label}
      </button>
      {result && (
        <div className="text-xs text-[#f5f0e0] space-y-1">
          <p>Procesados: {result.procesados ?? 0}</p>
          <p>Errores: {result.errores ? result.errores.length : 0}</p>
          {result.errores && result.errores.length > 0 && (
            <ul className="list-disc list-inside text-red-600">
              {result.errores.slice(0, 3).map((err: any, idx: number) => (
                <li key={idx}>
                  Fila {err.fila ?? '-'}: {err.error ?? 'Error'}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
