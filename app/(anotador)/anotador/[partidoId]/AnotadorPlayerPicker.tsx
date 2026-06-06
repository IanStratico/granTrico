"use client";

import { useState, useMemo } from "react";
import { labelPosicion } from "@/lib/constants";

interface Convocado {
  jfId: number;
  jugadorId: number;
  nombre: string;
  apellido: string;
  apodo: string | null;
  posicion: string;
  puntajeCalculado: number;
}

interface Props {
  convocados: Convocado[];
  accionLabel: string;
  onSelect: (jfId: number, convocado: Convocado) => void;
  onClose: () => void;
  disabled?: boolean;
}

export default function AnotadorPlayerPicker({ convocados, accionLabel, onSelect, onClose, disabled }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return convocados;
    return convocados.filter(
      (c) =>
        c.apellido.toLowerCase().includes(q) ||
        c.nombre.toLowerCase().includes(q) ||
        (c.apodo ?? "").toLowerCase().includes(q)
    );
  }, [convocados, query]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div
        className="mt-auto w-full rounded-t-2xl flex flex-col"
        style={{
          background: "#0d1f35",
          border: "1px solid #c8a951",
          maxHeight: "90vh",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="font-bold text-base" style={{ color: "#c8a951" }}>
            {accionLabel} — ¿Quién?
          </p>
          <button onClick={onClose} style={{ color: "rgba(245,240,224,0.5)", fontSize: "1.25rem" }}>
            ✕
          </button>
        </div>

        <div className="px-4 pb-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar jugador..."
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: "#1a3a6b", border: "1px solid #c8a951", color: "#f5f0e0" }}
          />
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-6">
          {filtered.map((c) => (
            <button
              key={c.jfId}
              onClick={() => onSelect(c.jfId, c)}
              disabled={disabled}
              className="w-full text-left rounded-lg px-3 py-3 mb-1.5 flex items-center justify-between disabled:opacity-40 active:scale-[0.99] transition-transform"
              style={{ background: "#1a3a6b", border: "1px solid rgba(200,169,81,0.3)" }}
            >
              <div>
                <p className="font-semibold text-sm" style={{ color: "#f5f0e0" }}>
                  {c.apodo ?? `${c.apellido}, ${c.nombre}`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,224,0.5)" }}>
                  {c.apodo ? `${c.apellido}, ${c.nombre} · ` : ""}{labelPosicion[c.posicion] ?? c.posicion}
                </p>
              </div>
              <span className="text-sm font-bold ml-3" style={{ color: "#c8a951" }}>
                {c.puntajeCalculado} pts
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-6 text-sm" style={{ color: "rgba(245,240,224,0.4)" }}>
              Sin resultados
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
