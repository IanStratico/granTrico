"use client";

import TeamBuilder, { ConvocadoVM } from "@/components/TeamBuilder";
import FechaSwitcher from "@/components/FechaSwitcher";

interface Props {
  fechaId: number;
  fechaNro: number;
  prevId: number | null;
  nextId: number | null;
  fechaEstado: string;
  fechaRival: string;
  totalEquipo: number | null;
  playerScores: Record<number, number>;
  convocados: ConvocadoVM[];
  initialSelected: number[];
  initialCapitan: number | null;
  isAdmin: boolean;
  userEmail: string;
  userRole: "admin" | "user";
}

export default function EquipoClient({
  fechaId,
  fechaNro,
  prevId,
  nextId,
  fechaEstado,
  fechaRival,
  totalEquipo,
  playerScores,
  convocados,
  initialSelected,
  initialCapitan,
  isAdmin,
  userEmail,
  userRole,
}: Props) {
  return (
    <div className="space-y-3">
      <FechaSwitcher
        prevHref={prevId ? `/equipo?fecha=${prevId}` : null}
        nextHref={nextId ? `/equipo?fecha=${nextId}` : null}
        label={`Fecha ${fechaNro} - ${fechaRival}`}
      />
      <div className="text-xl font-semibold">Mi equipo</div>
      <TeamBuilder
        fechaId={fechaId}
        fechaEstado={fechaEstado}
        totalEquipo={totalEquipo}
        playerScores={playerScores}
        convocados={convocados}
        initialSelected={initialSelected}
        initialCapitanId={initialCapitan}
      />
      <div className="mt-1 text-right text-xs">
        <a
          href={`/ranking-fecha/${fechaId}`}
          className="text-blue-600 underline"
        >
          Ver ranking de la fecha
        </a>
      </div>
    </div>
  );
}
