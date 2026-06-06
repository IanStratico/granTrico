import { prisma } from './prisma';
import { getTemporadaActiva } from './temporada';

export async function getAsignacionesActivasDeUsuario(userId: number) {
  const temporada = await getTemporadaActiva();
  if (!temporada) return [];

  const asignaciones = await prisma.anotadorAsignacion.findMany({
    where: {
      usuarioId: userId,
      fecha: {
        temporadaId: temporada.id,
        estado: { not: 'PUNTUADA' },
      },
    },
    include: { fecha: true },
  });

  if (asignaciones.length === 0) return [];

  const partidos = await prisma.partido.findMany({
    where: {
      OR: asignaciones.map((a) => ({ fechaId: a.fechaId, plantel: a.plantel })),
    },
  });

  const partidoMap = new Map(partidos.map((p) => [`${p.fechaId}-${p.plantel}`, p]));

  return asignaciones.map((a) => ({
    ...a,
    partido: partidoMap.get(`${a.fechaId}-${a.plantel}`) ?? null,
  }));
}

export async function assertAnotadorAutorizado(partidoId: number, userId: number) {
  const partido = await prisma.partido.findUnique({
    where: { id: partidoId },
    include: { fecha: true },
  });
  if (!partido) return null;

  const asignacion = await prisma.anotadorAsignacion.findFirst({
    where: { fechaId: partido.fechaId, plantel: partido.plantel, usuarioId: userId },
  });
  if (!asignacion) return null;

  return { partido, asignacion };
}
