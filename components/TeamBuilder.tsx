"use client";

import { useState, useMemo } from "react";
import { Plantel, Posicion } from "@prisma/client";
import FieldView from "./FieldView";
import PlayerSelectModal from "./PlayerSelectModal";

export interface ConvocadoVM {
  jugadorId: number;
  nombre: string;
  apellido: string;
  apodo?: string | null;
  camada?: number | null;
  posicion: Posicion;
  plantel: Plantel;
}

interface Props {
  fechaId: number;
  fechaEstado: string;
  totalEquipo: number | null;
  playerScores: Record<number, number>;
  convocados: ConvocadoVM[];
  initialSelected: number[];
  initialCapitanId: number | null;
}

export default function TeamBuilder({
  fechaId,
  fechaEstado,
  totalEquipo,
  playerScores,
  convocados,
  initialSelected,
  initialCapitanId,
}: Props) {
  const formationOrder = [1, 2, 3, 4, 5, 6, 8, 7, 9, 10, 12, 13, 11, 15, 14];
  const initAssignments = () => {
    const arr: (number | null)[] = Array(formationOrder.length).fill(null);
    initialSelected.forEach((id, idx) => {
      if (idx < arr.length) arr[idx] = id;
    });
    return arr;
  };

  const [assignments, setAssignments] =
    useState<(number | null)[]>(initAssignments);
  const [capitan, setCapitan] = useState<number | null>(initialCapitanId);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null); // slot number, not index
  const readonly = fechaEstado !== "PREVIA";
  const [selectedPlayer, setSelectedPlayer] = useState<ConvocadoVM | null>(
    null,
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSelectorModal, setShowSelectorModal] = useState(false);

  const selected = useMemo(
    () => assignments.filter((v): v is number => v !== null),
    [assignments],
  );

  const counts = useMemo(() => {
    const forwards = selected.filter(
      (id) =>
        convocados.find((c) => c.jugadorId === id)?.posicion === "FORWARD",
    ).length;
    const backs = selected.filter(
      (id) => convocados.find((c) => c.jugadorId === id)?.posicion === "BACK",
    ).length;
    const porPlantel: Record<string, number> = {};
    for (const id of selected) {
      const c = convocados.find((v) => v.jugadorId === id);
      if (!c) continue;
      porPlantel[c.plantel] = (porPlantel[c.plantel] || 0) + 1;
    }
    return { total: selected.length, forwards, backs, porPlantel };
  }, [selected, convocados]);

  const openSlot = (slot: number) => {
    setShowDetailModal(false);
    setShowSelectorModal(false);
    setActiveSlot(slot);
    const idx = formationOrder.indexOf(slot);
    const playerId = idx >= 0 ? assignments[idx] : null;
    if (readonly && !playerId) return;
    if (playerId) {
      const player = convocados.find((c) => c.jugadorId === playerId) || null;
      setSelectedPlayer(player);
      setShowDetailModal(true);
    } else {
      setSelectedPlayer(null);
      setShowSelectorModal(true);
    }
  };

  const assignPlayerToSlot = (playerId: number | null) => {
    if (activeSlot === null) return;
    setAssignments((prev) => {
      const next = [...prev];
      const idx = formationOrder.indexOf(activeSlot);
      if (idx === -1) return prev;
      const otherIdx = next.findIndex((v, i) => v === playerId && i !== idx);
      if (otherIdx !== -1) next[otherIdx] = null;
      next[idx] = playerId;
      if (capitan && !next.includes(capitan)) {
        setCapitan(null);
      }
      return next;
    });
  };

  const activeSlotPlayerId = () => {
    if (activeSlot === null) return null;
    const idx = formationOrder.indexOf(activeSlot);
    return idx === -1 ? null : assignments[idx];
  };

  const submit = async () => {
    if (readonly) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    if (!capitan) {
      setError("Debes elegir un capitán");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/user/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fechaId,
        jugadorIds: selected,
        capitanId: capitan,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al guardar");
    } else {
      setMessage("Equipo guardado");
    }
    setLoading(false);
  };

  const fieldSlots = formationOrder.map((slot, idx) => {
    const pId = assignments[idx];
    const p = pId ? convocados.find((c) => c.jugadorId === pId) : null;
    const baseScore = pId ? playerScores[pId] : null;
    const displayScore =
      typeof baseScore === "number" && fechaEstado === "PUNTUADA"
        ? baseScore * (capitan === pId ? 2 : 1)
        : null;
    return {
      slot,
      player: p
        ? {
            id: p.jugadorId,
            name: `${p.apellido}, ${p.nombre}`,
            posicion: p.posicion,
            isCapitan: capitan === p.jugadorId,
            score: displayScore,
            apodo: p.apodo ?? undefined,
            plantel: p.plantel,
            camada: p.camada != null ? String(p.camada) : undefined,
          }
        : null,
    };
  });

  const takenIds = assignments.filter((v): v is number => v !== null);

  const slotLabel = activeSlot
    ? `#${activeSlot} ${convocados.find((c) => c.jugadorId === activeSlotPlayerId())?.posicion ?? ""}`
    : "";

  return (
    <div className="space-y-3">
      {fechaEstado === "PUNTUADA" && typeof totalEquipo === "number" && (
        <div className="rounded border bg-white px-3 py-2 text-sm font-semibold">
          Total: {totalEquipo} pts
        </div>
      )}
      {fechaEstado === "CERRADA" && (
        <div className="rounded border bg-amber-50 text-amber-800 px-3 py-2 text-sm">
          La fecha está cerrada. No se puede editar el equipo.
        </div>
      )}
      {fechaEstado === "PUNTUADA" && (
        <div className="rounded border bg-green-50 text-green-800 px-3 py-2 text-sm">
          Fecha puntuada. Visualizá los puntajes por jugador.
        </div>
      )}
      <div className="sticky top-[40px] z-20 bg-gray-50/95 backdrop-blur border-y py-2 px-2 text-sm flex flex-wrap gap-3">
        <span>{counts.total}/15</span>
        <span>FW {counts.forwards}/8</span>
        <span>BK {counts.backs}/7</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(counts.porPlantel).map(([plantel, cantidad]) => (
          <span
            key={plantel}
            className="px-2 py-1 text-xs rounded bg-white text-black"
          >
            {plantel} {cantidad}
          </span>
        ))}
      </div>

      <div className="px-1">
        <FieldView
          slots={fieldSlots}
          onSelectSlot={openSlot}
          onSetCapitan={(playerId) => setCapitan(playerId)}
          readonly={readonly}
        />
      </div>

      <details className="bg-white border rounded px-3 py-2 text-sm">
        <summary className="cursor-pointer select-none">Ver reglas</summary>
        <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
          <li>15 jugadores exactos</li>
          <li>Máx 8 forwards, 7 backs</li>
          <li>Máx 4 por plantel</li>
          <li>1 capitán obligatorio</li>
        </ul>
      </details>
      {/* Modal selección */}
      <PlayerSelectModal
        open={showSelectorModal}
        onClose={() => setShowSelectorModal(false)}
        onSelect={(playerId) => {
          assignPlayerToSlot(playerId);
          setShowSelectorModal(false);
          if (
            capitan &&
            !assignments.includes(capitan) &&
            capitan !== playerId
          ) {
            setCapitan(null);
          }
        }}
        slotLabel={slotLabel}
        jugadores={convocados.map((c) => ({
          ...c,
          nombre: `${c.apellido}, ${c.nombre} - ${c.apodo}`,
          camada: `${c.camada}`,
        }))}
        takenIds={takenIds}
        currentId={activeSlotPlayerId()}
      />

      {showDetailModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-gray-900 text-white p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xs text-white/60">Foto</span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-sm uppercase text-white/70">
                  {selectedPlayer.apodo || "Sin apodo"}
                </div>
                <div className="text-base font-semibold">
                  {selectedPlayer.nombre} {selectedPlayer.apellido}
                </div>
                <div className="text-xs text-white/70">
                  {selectedPlayer.plantel} ·{" "}
                  {selectedPlayer.posicion === "FORWARD" ? "FW" : "BK"}
                </div>
                {selectedPlayer.camada && (
                  <div className="text-xs text-white/60">
                    Camada {selectedPlayer.camada}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {fechaEstado === "PREVIA" ? (
                <>
                  <button
                    className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold"
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowSelectorModal(true);
                    }}
                  >
                    Cambiar jugador
                  </button>
                  {selectedPlayer.jugadorId === capitan ? (
                    <p className="text-xs text-amber-400 text-center">Es el capitán actual ⭐</p>
                  ) : (
                    <button
                      className="w-full rounded-md bg-amber-500 py-2 text-sm font-semibold text-black"
                      onClick={() => {
                        setCapitan(selectedPlayer.jugadorId);
                        setShowDetailModal(false);
                        setSelectedPlayer(null);
                      }}
                    >
                      Hacer capitán
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs text-white/70 text-center">
                  La fecha está {fechaEstado.toLowerCase()}. Solo lectura.
                </p>
              )}
              <button
                className="w-full rounded-md border border-white/30 py-2 text-sm"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPlayer(null);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {!readonly && (
        <button
          onClick={submit}
          disabled={loading}
          className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Confirmar equipo"}
        </button>
      )}

      {message && <p className="text-green-700 text-sm">{message}</p>}
      {error && <p className="text-red-700 text-sm">{error}</p>}
    </div>
  );
}
