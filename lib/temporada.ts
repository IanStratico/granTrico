import { prisma } from './prisma';

export async function getTemporadaActiva() {
  return prisma.temporada.findFirst({ where: { activa: true } });
}
