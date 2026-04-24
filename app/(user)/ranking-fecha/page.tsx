import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getTemporadaActiva } from '@/lib/temporada';

export default async function RankingFechaIndex() {
  const activa = await getTemporadaActiva();

  if (!activa) {
    return (
      <main className="space-y-2">
        <h1 className="text-2xl font-semibold">Ranking de la fecha</h1>
        <p className="text-sm text-gray-600">No hay temporada activa.</p>
      </main>
    );
  }

  // Preferir la última fecha PUNTUADA, si no la primera disponible
  const fecha =
    (await prisma.fecha.findFirst({
      where: { temporadaId: activa.id, estado: 'PUNTUADA' },
      orderBy: { nro: 'desc' },
    })) ??
    (await prisma.fecha.findFirst({
      where: { temporadaId: activa.id },
      orderBy: { nro: 'asc' },
    }));

  if (!fecha) {
    return (
      <main className="space-y-2">
        <h1 className="text-2xl font-semibold">Ranking de la fecha</h1>
        <p className="text-sm text-gray-600">No hay fechas cargadas.</p>
      </main>
    );
  }

  redirect(`/ranking-fecha/${fecha.id}`);
}
