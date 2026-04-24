"use client";

import { useMemo, useState } from "react";
import { Plantel } from "@prisma/client";
import { labelPosicion, FORWARD_POSITIONS, BACK_POSITIONS } from "@/lib/constants";

export interface PlayerOption {
  jugadorId: number;
  nombre: string;
  posicion: string;
  plantel: Plantel;
  camada: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (playerId: number) => void;
  slotLabel: string;
  expectedPosition?: string;
  jugadores: PlayerOption[];
  takenIds: number[];
  currentId: number | null;
  fullPlanteles?: string[];
}

export default function PlayerSelectModal({
  open,
  onClose,
  onSelect,
  slotLabel,
  expectedPosition,
  jugadores,
  takenIds,
  currentId,
  fullPlanteles,
}: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return jugadores
      .filter((j) => {
        const inName = `${j.nombre}`.toLowerCase().includes(q);
        const available = j.jugadorId === currentId || !takenIds.includes(j.jugadorId);
        const correctPosition =
          !expectedPosition ||
          j.posicion === expectedPosition ||
          (j.posicion === 'FORWARD' && FORWARD_POSITIONS.includes(expectedPosition)) ||
          (j.posicion === 'BACK' && BACK_POSITIONS.includes(expectedPosition));
        return inName && available && correctPosition;
      })
      .map((j) => ({
        ...j,
        blocked: !!fullPlanteles?.includes(j.plantel),
      }))
      .sort((a, b) => Number(a.blocked) - Number(b.blocked));
  }, [jugadores, query, takenIds, currentId, expectedPosition, fullPlanteles]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60">
      <div
        className="mt-6 w-full max-w-md rounded-lg flex flex-col max-h-[90vh]"
        style={{ background: "#0d1f35", border: "1px solid #c8a951" }}
      >
        <div className="p-3" style={{ borderBottom: "1px solid #1a3a6b" }}>
          <p className="text-sm font-semibold" style={{ color: "#c8a951" }}>Seleccionar jugador</p>
          <p className="text-xs" style={{ color: "rgba(245,240,224,0.6)" }}>{slotLabel}</p>
        </div>
        <div className="p-3" style={{ borderBottom: "1px solid #1a3a6b" }}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar jugador..."
            className="w-full rounded px-3 py-2 text-base outline-none"
            style={{
              background: "#1a3a6b",
              border: "1px solid #c8a951",
              color: "#f5f0e0",
            }}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul>
            {filtered.map((j) => (
              <li
                key={j.jugadorId}
                className="px-3 py-2"
                style={{
                  borderBottom: "1px solid #1a3a6b",
                  cursor: j.blocked ? "default" : "pointer",
                  opacity: j.blocked ? 0.45 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!j.blocked) e.currentTarget.style.background = "#1a3a6b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                onClick={() => {
                  if (j.blocked) return;
                  onSelect(j.jugadorId);
                  onClose();
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "#f5f0e0" }}>{j.nombre}</span>
                  {j.blocked ? (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: "#6b1a1a", color: "#f5f0e0", border: "1px solid #c87551" }}
                    >
                      {j.plantel} 4/4
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "#c8a951" }}>
                      {labelPosicion[j.posicion] ?? j.posicion}
                    </span>
                  )}
                </div>
                <p className="text-[11px]" style={{ color: "rgba(245,240,224,0.5)" }}>
                  {j.plantel} · Camada {j.camada}
                </p>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-sm" style={{ color: "rgba(245,240,224,0.5)" }}>
                No hay jugadores disponibles
              </li>
            )}
          </ul>
        </div>
        <div className="p-3 flex justify-end" style={{ borderTop: "1px solid #1a3a6b" }}>
          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded"
            style={{ border: "1px solid #c8a951", color: "#f5f0e0", background: "transparent" }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
