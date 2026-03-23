"use client";

import { useMemo, useState } from "react";
import { Plantel, Posicion } from "@prisma/client";

export interface PlayerOption {
  jugadorId: number;
  nombre: string;
  posicion: Posicion;
  plantel: Plantel;
  camada: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (playerId: number) => void;
  slotLabel: string;
  jugadores: PlayerOption[];
  takenIds: number[];
  currentId: number | null;
}

export default function PlayerSelectModal({
  open,
  onClose,
  onSelect,
  slotLabel,
  jugadores,
  takenIds,
  currentId,
}: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return jugadores.filter((j) => {
      const inName = `${j.nombre}`.toLowerCase().includes(q);
      const available =
        j.jugadorId === currentId || !takenIds.includes(j.jugadorId);
      return inName && available;
    });
  }, [jugadores, query, takenIds, currentId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
      <div className="mt-6 w-full max-w-md bg-white rounded-lg shadow-lg flex flex-col max-h-[90vh]">
        <div className="p-3 border-b">
          <p className="text-sm font-semibold">Seleccionar jugador</p>
          <p className="text-xs text-gray-600">{slotLabel}</p>
        </div>
        <div className="p-3 border-b">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar jugador..."
            className="w-full border rounded px-3 py-2 text-base"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y">
            {filtered.map((j) => (
              <li
                key={j.jugadorId}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onSelect(j.jugadorId);
                  onClose();
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{j.nombre}</span>
                  <span className="text-xs text-gray-600">
                    {j.posicion === "FORWARD" ? "FW" : "BK"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Plantel: {j.plantel} - Camada: {j.camada}
                </p>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-gray-500">
                No hay jugadores disponibles
              </li>
            )}
          </ul>
        </div>
        <div className="p-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded border"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
