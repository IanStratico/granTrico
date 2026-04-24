'use client';

import { useMemo, useState } from 'react';
import FechaSwitcher from '@/components/FechaSwitcher';
import { abrevPlantel, FORWARD_POSITIONS } from '@/lib/constants';

interface JugadorVM {
  jugadorId: number;
  nombre: string;
  apellido: string;
  apodo?: string;
  posicion: string;
  camada?: string;
  plantel: string;
  score: number;
  tries: number;
  tackles: number;
  knockOns: number;
  penales: number;
  amarillas: number;
  rojas: number;
}

interface Props {
  title: string;
  estado: string;
  prevId: number | null;
  nextId: number | null;
  jugadores: JugadorVM[];
}


export default function RankingJugadoresClient({ title, estado, prevId, nextId, jugadores }: Props) {
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<JugadorVM | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return jugadores.filter(
      (j) =>
        j.nombre.toLowerCase().includes(q) ||
        j.apellido.toLowerCase().includes(q) ||
        (j.apodo ?? '').toLowerCase().includes(q),
    );
  }, [query, jugadores]);

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const displayName = (j: JugadorVM) => j.apodo || `${j.apellido}, ${j.nombre}`;

  return (
    <div className="space-y-3">
      <FechaSwitcher
        prevHref={prevId ? `/ranking-jugadores/${prevId}` : null}
        nextHref={nextId ? `/ranking-jugadores/${nextId}` : null}
        label={title}
      />
      <div className="text-xl font-semibold" style={{ color: '#c8a951' }}>Ranking de jugadores</div>

      {estado !== 'PUNTUADA' && (
        <div className="rounded px-3 py-2 text-sm" style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}>
          Los puntajes aún no están disponibles.
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o apodo..."
        className="w-full rounded px-3 py-2 text-sm"
        style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}
      />

      <div className="space-y-2">
        {top3.map((j, idx) => (
          <button
            key={j.jugadorId}
            onClick={() => setModal(j)}
            className="w-full text-left rounded-lg p-3 flex items-center justify-between"
            style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{['🥇', '🥈', '🥉'][idx]}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#f5f0e0' }}>{displayName(j)}</p>
                <p className="text-xs" style={{ color: 'rgba(245,240,224,0.7)' }}>
                  {abrevPlantel[j.plantel] ?? j.plantel} · {FORWARD_POSITIONS.includes(j.posicion) ? 'FWD' : 'BCK'}
                </p>
              </div>
            </div>
            <div className="text-lg font-bold" style={{ color: '#c8a951' }}>{j.score} pts</div>
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {rest.map((j, idx) => (
          <button
            key={j.jugadorId}
            onClick={() => setModal(j)}
            className="w-full flex items-center justify-between rounded px-3 py-2 text-sm"
            style={{ background: '#0d1f35', border: '1px solid #1a3a6b', color: '#f5f0e0' }}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-right font-semibold" style={{ color: '#c8a951' }}>{idx + 4}.</span>
              <span className="font-medium">{displayName(j)}</span>
              <span className="text-xs" style={{ color: 'rgba(245,240,224,0.5)' }}>
                {abrevPlantel[j.plantel] ?? j.plantel}
              </span>
            </div>
            <span className="font-semibold" style={{ color: '#c8a951' }}>{j.score} pts</span>
          </button>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className="w-full max-w-sm rounded-xl p-5 space-y-4"
            style={{ background: '#0d1f35', border: '1px solid #c8a951', color: '#f5f0e0' }}
          >
            <div className="space-y-1">
              <p className="text-lg font-semibold" style={{ color: '#c8a951' }}>{displayName(modal)}</p>
              <p className="text-xs" style={{ color: 'rgba(245,240,224,0.7)' }}>
                {abrevPlantel[modal.plantel] ?? modal.plantel} · {FORWARD_POSITIONS.includes(modal.posicion) ? 'FWD' : 'BCK'}
                {modal.camada ? ` · Camada ${modal.camada}` : ''}
              </p>
            </div>

            <table className="w-full text-sm">
              <tbody>
                {[
                  { label: 'Tries',     value: modal.tries,     pts: modal.tries * 10,      sign: '+' },
                  { label: 'Tackles',   value: modal.tackles,   pts: modal.tackles,          sign: '+' },
                  { label: 'Knock-ons', value: modal.knockOns,  pts: modal.knockOns * 2,     sign: '-' },
                  { label: 'Penales',   value: modal.penales,   pts: modal.penales * 2,      sign: '-' },
                  { label: 'Amarillas', value: modal.amarillas, pts: modal.amarillas * 5,    sign: '-' },
                  { label: 'Rojas',     value: modal.rojas,     pts: modal.rojas * 10,       sign: '-' },
                ].map(({ label, value, pts, sign }) => (
                  <tr key={label} style={{ borderBottom: '1px solid rgba(200,169,81,0.2)' }}>
                    <td className="py-1.5" style={{ color: 'rgba(245,240,224,0.8)' }}>{label}</td>
                    <td className="py-1.5 text-center w-10" style={{ color: '#f5f0e0' }}>{value}</td>
                    <td className="py-1.5 text-right" style={{ color: sign === '+' ? '#4ade80' : '#f87171' }}>
                      {sign}{pts} pts
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-3 font-semibold" style={{ color: '#c8a951' }}>Total</td>
                  <td />
                  <td className="pt-3 text-right font-bold" style={{ color: '#c8a951' }}>{modal.score} pts</td>
                </tr>
              </tbody>
            </table>

            <button
              className="w-full rounded-md py-2 text-sm"
              style={{ border: '1px solid #c8a951', color: '#f5f0e0', background: 'transparent' }}
              onClick={() => setModal(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
