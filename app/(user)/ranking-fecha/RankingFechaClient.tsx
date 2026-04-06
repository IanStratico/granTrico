'use client';

import { useMemo, useState } from 'react';
import FieldView from '@/components/FieldView';
import FechaSwitcher from '@/components/FechaSwitcher';
import RankingLayout from '@/components/RankingLayout';

const formationOrder = [1, 2, 3, 4, 5, 6, 8, 7, 9, 10, 12, 13, 11, 15, 14];

export interface RankingTeamVM {
  equipoFechaId: number;
  equipoNombre: string;
  usuarioNombre: string;
  puntajeTotal: number;
  capitanId: number | null;
  jugadores: {
    jugadorId: number;
    nombre: string;
    posicion: 'FORWARD' | 'BACK';
    score: number | null;
  }[];
}

interface Props {
  title: string;
  teams: RankingTeamVM[];
  prevId: number | null;
  nextId: number | null;
  userEmail: string;
  userRole: 'admin' | 'user';
  isAdmin: boolean;
  estado: string;
}

export default function RankingFechaClient({ title, teams, prevId, nextId, userEmail, userRole, isAdmin, estado }: Props) {
  const [query, setQuery] = useState('');
  const [modalTeam, setModalTeam] = useState<RankingTeamVM | null>(null);

  const lastPlaceId = estado === 'PUNTUADA' && teams.length > 0
    ? teams[teams.length - 1].equipoFechaId
    : null;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return teams.filter(
      (t) =>
        t.equipoNombre.toLowerCase().includes(q) ||
        t.usuarioNombre.toLowerCase().includes(q)
    );
  }, [query, teams]);

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <RankingLayout isAdmin={isAdmin} userEmail={userEmail} userRole={userRole}>
      <div className="space-y-3">
        <FechaSwitcher
          prevHref={prevId ? `/ranking-fecha/${prevId}` : null}
          nextHref={nextId ? `/ranking-fecha/${nextId}` : null}
          label={title}
        />
        <div className="text-xl font-semibold">Ranking de la fecha</div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar equipo o usuario..."
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <div className="space-y-2">
          {top3.map((team, idx) => (
            <button
              key={team.equipoFechaId}
              onClick={() => setModalTeam(team)}
              className="w-full text-left rounded-lg border bg-white shadow-sm p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{['🥇', '🥈', '🥉'][idx]}</span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{team.equipoNombre}{team.equipoFechaId === lastPlaceId ? ' 💩' : ''}</p>
                  <p className="text-xs text-gray-600">{team.usuarioNombre}</p>
                </div>
              </div>
              <div className="text-lg font-bold text-gray-800">{team.puntajeTotal} pts</div>
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {rest.map((team, idx) => (
            <button
              key={team.equipoFechaId}
              onClick={() => setModalTeam(team)}
              className="w-full flex items-center justify-between rounded border bg-white px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 text-right text-gray-500">{idx + 4}.</span>
                <span className="font-medium">{team.equipoNombre}{team.equipoFechaId === lastPlaceId ? ' 💩' : ''}</span>
                <span className="text-xs text-gray-500">({team.usuarioNombre})</span>
              </div>
              <span className="font-semibold">{team.puntajeTotal} pts</span>
            </button>
          ))}
        </div>
      </div>

      {modalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold">{modalTeam.equipoNombre}</p>
                <p className="text-sm text-gray-600">{modalTeam.usuarioNombre}</p>
                <p className="text-sm font-semibold mt-1">Total: {modalTeam.puntajeTotal} pts</p>
              </div>
              <button
                className="text-sm text-gray-500 px-3 py-1 rounded border"
                onClick={() => setModalTeam(null)}
              >
                Cerrar
              </button>
            </div>

            <FieldView
              readonly
              slots={formationOrder.map((slot, idx) => {
                const p = modalTeam.jugadores[idx];
                return {
                  slot,
                  player: p
                    ? {
                        id: p.jugadorId,
                        name: p.nombre,
                        posicion: p.posicion,
                        isCapitan: modalTeam.capitanId === p.jugadorId,
                        score:
                          typeof p.score === 'number'
                            ? p.score * (modalTeam.capitanId === p.jugadorId ? 2 : 1)
                            : null
                      }
                    : null
                };
              })}
              onSelectSlot={() => {}}
              onSetCapitan={() => {}}
            />
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setModalTeam(null)} />
        </div>
      )}
    </RankingLayout>
  );
}
