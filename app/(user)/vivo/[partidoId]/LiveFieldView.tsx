"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PlayerCard from "@/components/PlayerCard";
import { labelPlantel } from "@/lib/constants";

interface JugadorLive {
  jfId: number;
  nombre: string;
  apellido: string;
  apodo: string | null;
  posicion: string;
  puntaje: number;
}

interface Props {
  partidoId: number;
  plantel: string;
  fechaNro: number;
  rival: string;
  estado: string;
  jugadoresInit: JugadorLive[];
}

function byPos(jugadores: JugadorLive[], ...posiciones: string[]) {
  return jugadores.filter((j) => posiciones.includes(j.posicion));
}

function toCard(j: JugadorLive) {
  return {
    name: `${j.apellido}, ${j.nombre}`,
    apodo: j.apodo ?? undefined,
    posicion: j.posicion,
    score: j.puntaje,
  };
}

export default function LiveFieldView({ partidoId, plantel, fechaNro, rival, estado: initialEstado, jugadoresInit }: Props) {
  const [jugadores, setJugadores] = useState<JugadorLive[]>(jugadoresInit);
  const [estado, setEstado] = useState(initialEstado);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const poll = async () => {
      const res = await fetch(`/api/vivo/${partidoId}`);
      if (res.ok) {
        const data = await res.json();
        setJugadores(data.jugadores);
        setEstado(data.partido.estado);
        setLastUpdate(new Date());
      }
    };
    const interval = setInterval(poll, 8000);
    return () => clearInterval(interval);
  }, [partidoId]);

  const frontRow = [
    ...byPos(jugadores, 'PILAR').slice(0, 1),
    ...byPos(jugadores, 'HOOKER').slice(0, 1),
    ...byPos(jugadores, 'PILAR').slice(1, 2),
  ];
  const segundas = byPos(jugadores, 'SEGUNDA_LINEA').slice(0, 2);
  const terceras = byPos(jugadores, 'TERCERA_LINEA').slice(0, 3);
  const medios = [
    ...byPos(jugadores, 'MEDIO_SCRUM').slice(0, 1),
    ...byPos(jugadores, 'APERTURA').slice(0, 1),
  ];
  const centros = byPos(jugadores, 'CENTRO').slice(0, 2);
  const wings = byPos(jugadores, 'WING');
  const fullbacks = byPos(jugadores, 'FULLBACK');
  const backThree = [
    wings[0],
    fullbacks[0],
    wings[1],
  ].filter(Boolean) as JugadorLive[];
  const suplentes = byPos(jugadores, 'FORWARD', 'BACK');

  const rows = [backThree, centros, medios, terceras, segundas, frontRow];
  const titulo = `${labelPlantel[plantel] ?? plantel} vs ${rival}`;

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {/* Header compacto */}
      <div className="flex items-center justify-between px-3 py-2">
        <div>
          <Link href="/home" className="text-xs" style={{ color: "rgba(245,240,224,0.5)" }}>← Inicio</Link>
          <p className="text-sm font-bold" style={{ color: "#c8a951" }}>
            Fecha {fechaNro} · {titulo}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {estado === 'EN_CURSO' && (
            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#4ade80" }}>
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              EN VIVO
            </span>
          )}
          {lastUpdate && (
            <span className="text-[10px]" style={{ color: "rgba(245,240,224,0.35)" }}>
              {lastUpdate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* Campo */}
      <div
        className="mx-2 rounded-xl overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(to bottom, #14532d, #166534, #15803d, #166534, #14532d)",
          flex: 1,
          gap: 0,
          padding: "6px 4px",
          minHeight: 0,
        }}
      >
        {/* Línea central */}
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex justify-center items-center"
            style={{ flex: 1, gap: 6, position: 'relative' }}
          >
            {rowIdx === 2 && (
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.15)', transform: 'translateY(-50%)' }} />
            )}
            {row.map((j, idx) => (
              <div key={j.jfId ?? idx} style={{ flexShrink: 0 }}>
                <PlayerCard
                  name={`${j.apellido}, ${j.nombre}`}
                  apodo={j.apodo ?? undefined}
                  posicion={j.posicion}
                  score={j.puntaje}
                  readonly
                />
              </div>
            ))}
            {row.length === 0 && (
              <div style={{ width: 78, height: 96, opacity: 0 }} />
            )}
          </div>
        ))}
      </div>

      {/* Suplentes / sin posición */}
      {suplentes.length > 0 && (
        <div className="px-3 pt-2">
          <p className="text-[10px] mb-1 font-semibold uppercase tracking-wider" style={{ color: "rgba(245,240,224,0.4)" }}>
            Suplentes / sin posición
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suplentes.map((j) => (
              <div key={j.jfId} style={{ flexShrink: 0 }}>
                <PlayerCard
                  name={`${j.apellido}, ${j.nombre}`}
                  apodo={j.apodo ?? undefined}
                  posicion={j.posicion}
                  score={j.puntaje}
                  readonly
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
