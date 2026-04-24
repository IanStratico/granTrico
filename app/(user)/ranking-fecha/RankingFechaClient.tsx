"use client";

import { useMemo, useState } from "react";
import FieldView from "@/components/FieldView";
import FechaSwitcher from "@/components/FechaSwitcher";
import RankingLayout from "@/components/RankingLayout";

const formationOrder = [1, 2, 3, 4, 5, 6, 8, 7, 9, 10, 12, 13, 11, 15, 14];

export interface RankingTeamVM {
  equipoFechaId: number;
  equipoNombre: string;
  usuarioNombre: string;
  puntajeTotal: number;
  capitanId: number | null;
  pateadorId: number | null;
  jugadores: {
    jugadorId: number;
    slot: number;
    nombre: string;
    posicion: string;
    score: number | null;
    apodo?: string | null;
    plantel?: string | null;
    camada?: string | null;
  }[];
}

interface Props {
  title: string;
  teams: RankingTeamVM[];
  prevId: number | null;
  nextId: number | null;
  userEmail: string;
  userRole: "admin" | "user";
  isAdmin: boolean;
  estado: string;
}

export default function RankingFechaClient({
  title,
  teams,
  prevId,
  nextId,
  userEmail,
  userRole,
  isAdmin,
  estado,
}: Props) {
  const [query, setQuery] = useState("");
  const [modalTeam, setModalTeam] = useState<RankingTeamVM | null>(null);

  const lastPlaceId =
    estado === "PUNTUADA" && teams.length > 3
      ? teams[teams.length - 1].equipoFechaId
      : null;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return teams.filter(
      (t) =>
        t.equipoNombre.toLowerCase().includes(q) ||
        t.usuarioNombre.toLowerCase().includes(q),
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
          estado={estado}
        />
        <div className="text-xl font-semibold" style={{ color: "#c8a951" }}>
          Ranking de la fecha
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar equipo o usuario..."
          className="w-full rounded px-3 py-2 text-sm"
          style={{
            background: "#1a3a6b",
            border: "1px solid #c8a951",
            color: "#f5f0e0",
          }}
        />

        <div className="space-y-2">
          {top3.map((team, idx) => (
            <button
              key={team.equipoFechaId}
              onClick={() => setModalTeam(team)}
              className="w-full text-left rounded-lg p-3 flex items-center justify-between"
              style={{
                background: "#1a3a6b",
                border: "1px solid #c8a951",
                color: "#f5f0e0",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{["🥇", "🥈", "🥉"][idx]}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#f5f0e0" }}>
                    {team.equipoFechaId === lastPlaceId ? "💩 " : ""}{team.equipoNombre}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(245,240,224,0.6)" }}>
                    {team.usuarioNombre}
                  </p>
                </div>
              </div>
              <div className="text-lg font-bold" style={{ color: "#c8a951" }}>
                {team.puntajeTotal} pts
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {rest.map((team, idx) => (
            <button
              key={team.equipoFechaId}
              onClick={() => setModalTeam(team)}
              className="w-full flex items-center justify-between rounded px-3 py-2 text-sm"
              style={{
                background: "#0d1f35",
                border: "1px solid #1a3a6b",
                color: "#f5f0e0",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 text-right font-semibold" style={{ color: "#c8a951" }}>
                  {idx + 4}.
                </span>
                <div>
                  <p className="font-medium">
                    {team.equipoFechaId === lastPlaceId ? "💩 " : ""}{team.equipoNombre}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(245,240,224,0.6)" }}>
                    {team.usuarioNombre}
                  </p>
                </div>
              </div>
              <span className="font-semibold" style={{ color: "#c8a951" }}>
                {team.puntajeTotal} pts
              </span>
            </button>
          ))}
        </div>
      </div>

      {modalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div
            className="w-full max-w-3xl rounded-lg max-h-[90vh] overflow-y-auto p-4 space-y-4"
            style={{ background: "#0d1f35", boxShadow: "0 0 0 1px #c8a951" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "#c8a951" }}
                >
                  {modalTeam.equipoNombre}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "rgba(245,240,224,0.7)" }}
                >
                  {modalTeam.usuarioNombre}
                </p>
                <p
                  className="text-sm font-semibold mt-1"
                  style={{ color: "rgba(245,240,224,0.7)" }}
                >
                  Total: {modalTeam.puntajeTotal} pts
                </p>
              </div>
              <button
                className="text-sm px-3 py-1 rounded"
                style={{
                  border: "1px solid #c8a951",
                  color: "#f5f0e0",
                  background: "transparent",
                }}
                onClick={() => setModalTeam(null)}
              >
                Cerrar
              </button>
            </div>

            <FieldView
              readonly
              slots={(() => {
                const bySlot = Object.fromEntries(modalTeam.jugadores.map(j => [j.slot, j]));
                return formationOrder.map((slot) => {
                  const p = bySlot[slot];
                  return {
                    slot,
                    player: p
                      ? {
                          id: p.jugadorId,
                          name: p.apodo ?? p.nombre,
                          posicion: p.posicion,
                          isCapitan: modalTeam.capitanId === p.jugadorId,
                          isPateador: modalTeam.pateadorId === p.jugadorId,
                          score:
                            typeof p.score === "number"
                              ? p.score * (modalTeam.capitanId === p.jugadorId ? 2 : 1)
                              : null,
                          apodo: p.apodo ?? undefined,
                          plantel: p.plantel ?? undefined,
                          camada: p.camada ?? undefined,
                        }
                      : null,
                  };
                });
              })()}
              onSelectSlot={() => {}}
              onSetCapitan={() => {}}
            />
          </div>
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setModalTeam(null)}
          />
        </div>
      )}
    </RankingLayout>
  );
}
