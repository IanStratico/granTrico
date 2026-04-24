import { JugadorFecha, Posicion, Plantel } from '@prisma/client';
import { SLOT_POSITION_MAP, FORWARD_POSITIONS, BACK_POSITIONS, labelPosicion } from './constants';

export type RosterValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateRoster(
  jugadores: { jugadorId: number; slot: number; posicion: Posicion; plantel: Plantel }[],
  capitanId: number | null,
  pateadorId: number | null
): RosterValidationResult {
  const total = jugadores.length;
  if (total !== 15) return { ok: false, message: 'Debes elegir exactamente 15 jugadores' };

  for (const j of jugadores) {
    const expected = SLOT_POSITION_MAP[j.slot];
    if (!expected) continue;
    if (j.posicion === 'FORWARD') {
      if (!FORWARD_POSITIONS.includes(expected)) {
        return { ok: false, message: `El slot #${j.slot} es para backs` };
      }
    } else if (j.posicion === 'BACK') {
      if (!BACK_POSITIONS.includes(expected)) {
        return { ok: false, message: `El slot #${j.slot} es para forwards` };
      }
    } else if (j.posicion !== expected) {
      return {
        ok: false,
        message: `El slot #${j.slot} requiere un ${labelPosicion[expected] ?? expected}`,
      };
    }
  }

  const porPlantel: Record<string, number> = {};
  for (const j of jugadores) {
    porPlantel[j.plantel] = (porPlantel[j.plantel] || 0) + 1;
    if (porPlantel[j.plantel] > 4) return { ok: false, message: 'Máximo 4 jugadores por plantel' };
  }

  if (!capitanId) return { ok: false, message: 'Debes elegir un capitán' };
  if (!jugadores.some((j) => j.jugadorId === capitanId)) return { ok: false, message: 'El capitán debe estar entre los 15 elegidos' };

  if (!pateadorId) return { ok: false, message: 'Debes elegir un pateador' };
  if (!jugadores.some((j) => j.jugadorId === pateadorId)) return { ok: false, message: 'El pateador debe estar entre los 15 elegidos' };

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
