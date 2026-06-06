import { AccionTipo } from '@prisma/client';
import { prisma } from './prisma';
import { playerScoreFromStats } from './validation';
export { ACCION_LABEL } from './constants';

export const ACCION_TO_FIELD: Record<AccionTipo, string> = {
  TRY: 'tries',
  TACKLE: 'tackles',
  KNOCK_ON: 'knockOns',
  PENAL: 'penales',
  AMARILLA: 'amarillas',
  ROJA: 'rojas',
  CONVERSION_METIDA: 'conversionesMetidas',
  CONVERSION_ERRADA: 'conversionesErradas',
  PENAL_METIDO: 'penalesMetidos',
  PENAL_ERRADO: 'penalesErrados',
};

export async function applyAnotacion({
  partidoId,
  jugadorFechaId,
  accion,
  anotadorId,
}: {
  partidoId: number;
  jugadorFechaId: number;
  accion: AccionTipo;
  anotadorId: number;
}) {
  const field = ACCION_TO_FIELD[accion];

  const anotacion = await prisma.anotacion.create({
    data: { partidoId, jugadorFechaId, accion, anotadorId },
  });

  await prisma.jugadorFecha.update({
    where: { id: jugadorFechaId },
    data: { [field]: { increment: 1 } },
  });

  const jf = await prisma.jugadorFecha.findUnique({
    where: { id: jugadorFechaId },
    include: { jugador: true },
  });

  const puntajeCalculado = playerScoreFromStats(jf!);
  await prisma.jugadorFecha.update({
    where: { id: jugadorFechaId },
    data: { puntajeCalculado },
  });

  return { anotacion, jugadorFecha: { ...jf!, puntajeCalculado } };
}

export async function revertLastAnotacion(partidoId: number) {
  const anotacion = await prisma.anotacion.findFirst({
    where: { partidoId, revertida: false },
    orderBy: { createdAt: 'desc' },
    include: { jugadorFecha: { include: { jugador: true } } },
  });

  if (!anotacion) return null;

  const field = ACCION_TO_FIELD[anotacion.accion];
  const currentVal = (anotacion.jugadorFecha as Record<string, unknown>)[field] as number;

  await prisma.anotacion.update({
    where: { id: anotacion.id },
    data: { revertida: true, revertidaAt: new Date() },
  });

  if (currentVal > 0) {
    await prisma.jugadorFecha.update({
      where: { id: anotacion.jugadorFechaId },
      data: { [field]: { decrement: 1 } },
    });
  }

  const jf = await prisma.jugadorFecha.findUnique({
    where: { id: anotacion.jugadorFechaId },
    include: { jugador: true },
  });

  const puntajeCalculado = playerScoreFromStats(jf!);
  await prisma.jugadorFecha.update({
    where: { id: anotacion.jugadorFechaId },
    data: { puntajeCalculado },
  });

  return { anotacion, jugadorFecha: { ...jf!, puntajeCalculado } };
}
