'use client';

import { useState } from 'react';

export interface StatsRow {
  jfId: number;
  jugador: string;
  tries: number;
  tackles: number;
  knockOns: number;
  penales: number;
  amarillas: number;
  rojas: number;
  conversionesMetidas: number;
  conversionesErradas: number;
  penalesMetidos: number;
  penalesErrados: number;
  puntajeOverride: number | null;
}

interface Props {
  fechaId: number;
  rows: StatsRow[];
}

export default function StatsTableClient({ fechaId, rows }: Props) {
  const [data, setData] = useState(rows);
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const updateField = (id: number, field: keyof StatsRow, value: number | null) => {
    setData((prev) =>
      prev.map((row) => (row.jfId === id ? { ...row, [field]: value } : row))
    );
  };

  const onSubmit = async () => {
    setStatus('saving');
    setError(null);
    const payload = {
      fechaId,
      rows: data.map((r) => ({
        jfId: r.jfId,
        tries: r.tries,
        tackles: r.tackles,
        knockOns: r.knockOns,
        penales: r.penales,
        amarillas: r.amarillas,
        rojas: r.rojas,
        conversionesMetidas: r.conversionesMetidas,
        conversionesErradas: r.conversionesErradas,
        penalesMetidos: r.penalesMetidos,
        penalesErrados: r.penalesErrados,
        puntajeOverride: r.puntajeOverride
      }))
    };
    const res = await fetch('/api/admin/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || 'Error al guardar');
      setStatus('error');
      return;
    }
    setStatus('ok');
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left">Jugador</th>
              <th className="px-2 py-2">Tries</th>
              <th className="px-2 py-2">Tackles</th>
              <th className="px-2 py-2">Knock ons</th>
              <th className="px-2 py-2">Penales</th>
              <th className="px-2 py-2">Amarillas</th>
              <th className="px-2 py-2">Rojas</th>
              <th className="px-2 py-2">C+</th>
              <th className="px-2 py-2">C-</th>
              <th className="px-2 py-2">P+</th>
              <th className="px-2 py-2">P-</th>
              <th className="px-2 py-2">Puntaje override</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.jfId} className="border-t">
                <td className="px-2 py-2 text-left">{c.jugador}</td>
                {(['tries', 'tackles', 'knockOns', 'penales', 'amarillas', 'rojas', 'conversionesMetidas', 'conversionesErradas', 'penalesMetidos', 'penalesErrados'] as const).map((field) => (
                  <td key={field} className="px-2 py-1">
                    <input
                      type="number"
                      value={c[field]}
                      onChange={(e) => updateField(c.jfId, field, Number(e.target.value))}
                      className="w-20 border rounded px-2 py-1"
                      min={0}
                    />
                  </td>
                ))}
                <td className="px-2 py-1">
                  <input
                    type="number"
                    value={c.puntajeOverride ?? ''}
                    onChange={(e) =>
                      updateField(
                        c.jfId,
                        'puntajeOverride',
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                    className="w-24 border rounded px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 items-center">
        <button
          onClick={onSubmit}
          disabled={status === 'saving'}
          className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'saving' ? 'Guardando...' : 'Guardar y recalcular'}
        </button>
        {status === 'ok' && <span className="text-sm text-green-700">Guardado</span>}
        {error && <span className="text-sm text-red-700">{error}</span>}
      </div>
    </div>
  );
}
