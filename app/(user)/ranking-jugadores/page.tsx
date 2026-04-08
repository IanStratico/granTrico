import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getTemporadaActiva } from '@/lib/temporada';

export default async function RankingJugadoresIndex() {
  const activa = await getTemporadaActiva();
  if (!activa) {
    return (
      <main className="space-y-2">
        <h1 className="text-2xl font-semibold" style={{ color: '#c8a951' }}>Ranking de jugadores</h1>
        <p className="text-sm" style={{ color: '#f5f0e0' }}>No hay temporada activa.</p>
      </main>
    );
  }

  const fechas = await prisma.fecha.findMany({
    where: { temporadaId: activa.id },
    orderBy: { nro: 'asc' },
  });

  if (!fechas.length) {
    return (
      <main className="space-y-2">
        <h1 className="text-2xl font-semibold" style={{ color: '#c8a951' }}>Ranking de jugadores</h1>
        <p className="text-sm" style={{ color: '#f5f0e0' }}>No hay fechas disponibles.</p>
      </main>
    );
  }

  const puntuada = fechas.find((f) => f.estado === 'PUNTUADA');
  const target = puntuada ?? fechas[0];

  redirect(`/ranking-jugadores/${target.id}`);
}
