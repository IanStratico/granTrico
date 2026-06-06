"use client";

import { useEffect, useState } from "react";
import { labelPosicion } from "@/lib/constants";

interface JugadorScore {
  jfId: number;
  jugadorId: number;
  nombre: string;
  apellido: string;
  apodo: string | null;
  posicion: string;
  puntaje: number;
}

interface Props {
  partidoId: number;
  onClose: () => void;
}

export default function LiveScoresSheet({ partidoId, onClose }: Props) {
  const [jugadores, setJugadores] = useState<JugadorScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/anotador/partidos/${partidoId}/live`);
      if (res.ok) {
        const data = await res.json();
        setJugadores(data.jugadores);
        setLastUpdate(new Date());
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [partidoId]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div
        className="mt-auto w-full rounded-t-2xl flex flex-col"
        style={{ background: "#0d1f35", border: "1px solid #c8a951", maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <p className="font-bold" style={{ color: "#c8a951" }}>Puntajes en vivo</p>
            {lastUpdate && (
              <p className="text-xs" style={{ color: "rgba(245,240,224,0.4)" }}>
                Actualizado a las{" "}
                {lastUpdate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ color: "rgba(245,240,224,0.5)", fontSize: "1.25rem" }}>
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-6">
          {loading ? (
            <p className="text-center py-6 text-sm" style={{ color: "rgba(245,240,224,0.4)" }}>
              Cargando...
            </p>
          ) : jugadores.length === 0 ? (
            <p className="text-center py-6 text-sm" style={{ color: "rgba(245,240,224,0.4)" }}>
              Sin convocados aún
            </p>
          ) : (
            jugadores.map((j, idx) => (
              <div
                key={j.jfId}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 mb-1.5"
                style={{ background: "#1a3a6b", border: "1px solid rgba(200,169,81,0.25)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold w-5 text-right" style={{ color: "rgba(245,240,224,0.4)" }}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#f5f0e0" }}>
                      {j.apodo ?? `${j.apellido}, ${j.nombre}`}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(245,240,224,0.45)" }}>
                      {labelPosicion[j.posicion] ?? j.posicion}
                    </p>
                  </div>
                </div>
                <span className="font-bold" style={{ color: j.puntaje >= 0 ? "#c8a951" : "#f87171" }}>
                  {j.puntaje} pts
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
