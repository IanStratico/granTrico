'use client';

import { useMemo, useState } from 'react';

interface RowVM {
  equipoId: number;
  equipoNombre: string;
  usuarioNombre: string;
  total: number;
}

interface Props {
  rows: RowVM[];
}

const medal = ['🥇', '🥈', '🥉'];

export default function TablaGeneralClient({ rows }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        r.equipoNombre.toLowerCase().includes(q) ||
        r.usuarioNombre.toLowerCase().includes(q),
    );
  }, [query, rows]);

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <div className="space-y-3">
      <div className="text-xl font-semibold" style={{ color: '#c8a951' }}>Ranking de temporada</div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar equipo o usuario..."
        className="w-full rounded px-3 py-2 text-sm"
        style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}
      />

      <div className="space-y-2">
        {top3.map((row, idx) => (
          <div
            key={row.equipoId}
            className="rounded-lg p-3 flex items-center justify-between"
            style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{medal[idx]}</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold" style={{ color: '#f5f0e0' }}>{row.equipoNombre}</p>
                <p className="text-xs" style={{ color: 'rgba(245,240,224,0.7)' }}>{row.usuarioNombre}</p>
              </div>
            </div>
            <div className="text-lg font-bold" style={{ color: '#c8a951' }}>{row.total} pts</div>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {rest.map((row, idx) => (
          <div
            key={row.equipoId}
            className="flex items-center justify-between rounded px-3 py-2 text-sm"
            style={{ background: '#0d1f35', border: '1px solid #1a3a6b', color: '#f5f0e0' }}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-right font-semibold" style={{ color: '#c8a951' }}>{idx + 4}.</span>
              <span className="font-medium">{row.equipoNombre}</span>
            </div>
            <span className="font-semibold" style={{ color: '#c8a951' }}>{row.total} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
