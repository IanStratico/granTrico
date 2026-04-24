"use client";

import { useState, useMemo } from "react";
import { Plantel, Posicion } from "@prisma/client";
import FieldView from "./FieldView";
import PlayerSelectModal from "./PlayerSelectModal";
import { FORMATION_ORDER, SLOT_POSITION_MAP, FORWARD_POSITIONS, labelPosicion } from "@/lib/constants";

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
  initialPateadorId: number | null;
}

export default function TeamBuilder({
  fechaId,
  fechaEstado,
  totalEquipo,
  playerScores,
  convocados,
  initialSelected,
  initialCapitanId,
  initialPateadorId,
}: Props) {
  const formationOrder = FORMATION_ORDER;
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
  const [pateador, setPateador] = useState<number | null>(initialPateadorId);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
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
    const forwards = selected.filter((id) => {
      const pos = convocados.find((c) => c.jugadorId === id)?.posicion;
      return pos ? FORWARD_POSITIONS.includes(pos) : false;
    }).length;
    const backs = selected.length - forwards;
    const porPlantel: Record<string, number> = {};
    for (const id of selected) {
      const c = convocados.find((v) => v.jugadorId === id);
      if (!c) continue;
      porPlantel[c.plantel] = (porPlantel[c.plantel] || 0) + 1;
    }
    return { total: selected.length, forwards, backs, porPlantel };
  }, [selected, convocados]);

  const currentSlotPlayer = useMemo(() => {
    if (activeSlot === null) return null;
    const idx = formationOrder.indexOf(activeSlot);
    const pId = idx >= 0 ? assignments[idx] : null;
    return pId ? convocados.find((c) => c.jugadorId === pId) ?? null : null;
  }, [activeSlot, assignments, convocados, formationOrder]);

  const fullPlanteles = useMemo(() => {
    const adjusted = { ...counts.porPlantel };
    if (currentSlotPlayer) {
      adjusted[currentSlotPlayer.plantel] = (adjusted[currentSlotPlayer.plantel] || 0) - 1;
    }
    return Object.entries(adjusted)
      .filter(([, n]) => n >= 4)
      .map(([plantel]) => plantel);
  }, [counts.porPlantel, currentSlotPlayer]);

  const openSlot = (slot: number) => {
    setShowDetailModal(false);
    setShowSelectorModal(false);
    setConflictError(null);
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
      if (pateador && !next.includes(pateador)) {
        setPateador(null);
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
    if (!pateador) {
      setError("Debes elegir un pateador");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/user/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fechaId,
        asignaciones: formationOrder
          .map((slot: number, idx: number) =>
            assignments[idx] !== null ? { slot, jugadorId: assignments[idx] } : null,
          )
          .filter(Boolean),
        capitanId: capitan,
        pateadorId: pateador,
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
            isPateador: pateador === p.jugadorId,
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
    ? `#${activeSlot} — ${labelPosicion[SLOT_POSITION_MAP[activeSlot]] ?? ""}`
    : "";

  return (
    <div className="space-y-3">
      {fechaEstado === "PUNTUADA" && typeof totalEquipo === "number" && (
        <div
          className="rounded px-3 py-2 text-sm font-semibold"
          style={{
            background: "#1a3a6b",
            border: "1px solid #c8a951",
            color: "#c8a951",
          }}
        >
          Total: {totalEquipo} pts
        </div>
      )}
      {fechaEstado === "CERRADA" && (
        <div
          className="rounded px-3 py-2 text-sm"
          style={{
            background: "#1a3a6b",
            color: "#c8a951",
            border: "1px solid #c8a951",
          }}
        >
          La fecha está cerrada. No se puede editar el equipo.
        </div>
      )}
      {fechaEstado === "PUNTUADA" && (
        <div
          className="rounded px-3 py-2 text-sm"
          style={{
            background: "#1a6b3a",
            color: "#f5f0e0",
            border: "1px solid #c8a951",
          }}
        >
          Fecha puntuada. Visualizá los puntajes por jugador.
        </div>
      )}
      <div
        className="sticky top-[40px] z-20 backdrop-blur border-y py-2 px-2 text-sm flex flex-wrap gap-3"
        style={{
          background: "#0d1f35",
          borderColor: "#c8a951",
          color: "#f5f0e0",
        }}
      >
        <span>{counts.total}/15</span>
        <span>FW {counts.forwards}/8</span>
        <span>BK {counts.backs}/7</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(counts.porPlantel).map(([plantel, cantidad]) => (
          <span
            key={plantel}
            className="px-2 py-1 text-xs rounded"
            style={{
              background: "#1a3a6b",
              border: "1px solid #c8a951",
              color: "#f5f0e0",
            }}
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

      <details
        className="rounded px-3 py-2 text-sm"
        style={{ background: "#1a3a6b", border: "1px solid #c8a951" }}
      >
        <summary
          className="cursor-pointer select-none"
          style={{ color: "#c8a951" }}
        >
          Ver reglas
        </summary>
        <ul
          className="list-disc list-inside mt-2 space-y-1"
          style={{ color: "#f5f0e0" }}
        >
          <li>15 jugadores exactos</li>
          <li>Máx 8 forwards, 7 backs</li>
          <li>Máx 4 por plantel</li>
          <li>1 capitán obligatorio</li>
          <li>1 pateador obligatorio</li>
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
        expectedPosition={activeSlot ? SLOT_POSITION_MAP[activeSlot] : undefined}
        jugadores={convocados.map((c) => ({
          ...c,
          nombre: `${c.apellido}, ${c.nombre} - ${c.apodo}`,
          camada: `${c.camada}`,
        }))}
        takenIds={takenIds}
        currentId={activeSlotPlayerId()}
        fullPlanteles={fullPlanteles}
      />

      {showDetailModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className="w-full max-w-sm rounded-xl p-5 space-y-4"
            style={{
              background: "#0d1f35",
              border: "1px solid #c8a951",
              color: "#f5f0e0",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#fff", border: "2px solid #c8a951" }}
              >
                <span className="text-base font-bold" style={{ color: "#1a3a6b" }}>
                  {(selectedPlayer.apodo || selectedPlayer.apellido || "")
                    .split(" ")
                    .slice(0, 2)
                    .map((w: string) => w[0]?.toUpperCase() ?? "")
                    .join("")}
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <div
                  className="text-sm uppercase"
                  style={{ color: "rgba(245,240,224,0.7)" }}
                >
                  {selectedPlayer.apodo || "Sin apodo"}
                </div>
                <div
                  className="text-base font-semibold"
                  style={{ color: "#f5f0e0" }}
                >
                  {selectedPlayer.nombre} {selectedPlayer.apellido}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "rgba(245,240,224,0.7)" }}
                >
                  {selectedPlayer.plantel} ·{" "}
                  {FORWARD_POSITIONS.includes(selectedPlayer.posicion) ? "FW" : "BK"}
                </div>
                {selectedPlayer.camada && (
                  <div
                    className="text-xs"
                    style={{ color: "rgba(245,240,224,0.6)" }}
                  >
                    Camada {selectedPlayer.camada}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {fechaEstado === "PREVIA" ? (
                <>
                  <button
                    className="w-full rounded-md py-2 text-sm font-semibold"
                    style={{
                      background: "#1a6b3a",
                      border: "1px solid #c8a951",
                      color: "#f5f0e0",
                    }}
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowSelectorModal(true);
                    }}
                  >
                    Cambiar jugador
                  </button>
                  {selectedPlayer.jugadorId === capitan ? (
                    <p
                      className="text-xs text-center"
                      style={{ color: "#c8a951" }}
                    >
                      Es el capitán actual ⭐
                    </p>
                  ) : (
                    <button
                      className="w-full rounded-md py-2 text-sm font-semibold"
                      style={{ background: "#c8a951", color: "#000" }}
                      onClick={() => {
                        if (selectedPlayer.jugadorId === pateador) {
                          setConflictError("A donde vas mostro 😅 Un jugador no puede ser capitán y pateador a la vez.");
                          return;
                        }
                        setCapitan(selectedPlayer.jugadorId);
                        setConflictError(null);
                        setShowDetailModal(false);
                        setSelectedPlayer(null);
                      }}
                    >
                      Hacer capitán
                    </button>
                  )}
                  {selectedPlayer.jugadorId === pateador ? (
                    <p
                      className="text-xs text-center"
                      style={{ color: "#c8a951" }}
                    >
                      Es el pateador actual 🥾
                    </p>
                  ) : (
                    <button
                      className="w-full rounded-md py-2 text-sm font-semibold"
                      style={{ background: "#1a3a6b", border: "1px solid #c8a951", color: "#f5f0e0" }}
                      onClick={() => {
                        if (selectedPlayer.jugadorId === capitan) {
                          setConflictError("A donde vas mostro 😅 Un jugador no puede ser capitán y pateador a la vez.");
                          return;
                        }
                        setPateador(selectedPlayer.jugadorId);
                        setConflictError(null);
                        setShowDetailModal(false);
                        setSelectedPlayer(null);
                      }}
                    >
                      Hacer pateador 🥾
                    </button>
                  )}
                  {conflictError && (
                    <p className="text-xs text-center font-semibold" style={{ color: "#fca5a5" }}>
                      {conflictError}
                    </p>
                  )}
                </>
              ) : (
                <p
                  className="text-xs text-center"
                  style={{ color: "rgba(245,240,224,0.7)" }}
                >
                  La fecha está {fechaEstado.toLowerCase()}. Solo lectura.
                </p>
              )}
              <button
                className="w-full rounded-md py-2 text-sm"
                style={{
                  border: "1px solid #c8a951",
                  color: "#f5f0e0",
                  background: "transparent",
                }}
                onClick={() => {
                  setConflictError(null);
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
          className="rounded px-4 py-2 disabled:opacity-50"
          style={{
            background: "#1a6b3a",
            border: "1px solid #c8a951",
            color: "#f5f0e0",
          }}
        >
          {loading ? "Guardando..." : "Confirmar equipo"}
        </button>
      )}

      {message && (
        <div className="rounded px-3 py-2 text-sm" style={{ background: "#1a6b3a", border: "1px solid #c8a951", color: "#f5f0e0" }}>
          {message}
        </div>
      )}
      {error && (
        <div className="rounded px-3 py-2 text-sm" style={{ background: "#6b1a1a", border: "1px solid #c87551", color: "#f5f0e0" }}>
          {error}
        </div>
      )}
    </div>
  );
}
