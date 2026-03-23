import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function RankingFechaIndex() {
  const fecha = await prisma.fecha.findFirst({
    orderBy: { nro: 'asc' }
  });

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
