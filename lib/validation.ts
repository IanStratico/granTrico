import { JugadorFecha, Posicion, Plantel } from '@prisma/client';

export type RosterValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateRoster(
  jugadores: { jugadorId: number; posicion: Posicion; plantel: Plantel }[],
  capitanId: number | null
): RosterValidationResult {
  const total = jugadores.length;
  if (total !== 15) return { ok: false, message: 'Debes elegir exactamente 15 jugadores' };

  const forwards = jugadores.filter((j) => j.posicion === 'FORWARD').length;
  const backs = jugadores.filter((j) => j.posicion === 'BACK').length;
  if (forwards > 8) return { ok: false, message: 'Máximo 8 forwards' };
  if (backs > 7) return { ok: false, message: 'Máximo 7 backs' };

  const porPlantel: Record<string, number> = {};
  for (const j of jugadores) {
    porPlantel[j.plantel] = (porPlantel[j.plantel] || 0) + 1;
    if (porPlantel[j.plantel] > 4) return { ok: false, message: 'Máximo 4 jugadores por plantel' };
  }

  if (!capitanId) return { ok: false, message: 'Debes elegir un capitán' };
  if (!jugadores.some((j) => j.jugadorId === capitanId)) return { ok: false, message: 'El capitán debe estar entre los 15 elegidos' };

  return { ok: true };
}

export function playerScoreFromStats(stats: Pick<JugadorFecha, 'tries' | 'tackles' | 'knockOns' | 'penales' | 'amarillas' | 'rojas'>): number {
  return (
    stats.tries * 10 +
    stats.tackles -
    stats.knockOns * 2 -
    stats.penales * 2 -
    stats.amarillas * 5 -
    stats.rojas * 10
  );
}
