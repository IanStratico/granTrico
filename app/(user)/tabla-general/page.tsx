import { prisma } from '@/lib/prisma';
import RankingLayout from '@/components/RankingLayout';
import { auth } from '@/lib/auth';

export default async function TablaGeneralPage() {
  const session = await auth();
  const temporadaActiva = await prisma.temporada.findFirst({ where: { activa: true } });
  if (!temporadaActiva) {
    return (
      <RankingLayout
        title="Ranking Temporada"
        isAdmin={!!session?.user?.isAdmin}
        userEmail={session?.user?.email ?? ''}
        userRole={session?.user?.isAdmin ? 'admin' : 'user'}
      >
        <p className="text-gray-600 text-sm">No hay temporada activa.</p>
      </RankingLayout>
    );
  }

  const acumulado = await prisma.equipoFecha.groupBy({
    by: ['equipoId'],
    _sum: { puntajeTotal: true }
  });

  const equipos = await prisma.equipo.findMany({
    where: { temporadaId: temporadaActiva.id },
    include: { usuario: true }
  });

  const rows = equipos
    .map((eq) => ({
      equipo: eq,
      total: acumulado.find((a) => a.equipoId === eq.id)?._sum.puntajeTotal ?? 0
    }))
    .sort((a, b) => b.total - a.total);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const medal = ['🥇', '🥈', '🥉'];

  return (
    <RankingLayout
      title="Ranking Temporada"
      isAdmin={!!session?.user?.isAdmin}
      userEmail={session?.user?.email ?? ''}
      userRole={session?.user?.isAdmin ? 'admin' : 'user'}
    >
      <div className="space-y-2">
        {top3.map((row, idx) => (
          <div
            key={row.equipo.id}
            className="rounded-lg border bg-white shadow-sm p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{medal[idx]}</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{row.equipo.nombre}</p>
                <p className="text-xs text-gray-600">{row.equipo.usuario.nombre}</p>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-800">{row.total} pts</div>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {rest.map((row, idx) => (
          <div
            key={row.equipo.id}
            className="flex items-center justify-between rounded border bg-white px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-right text-gray-500">{idx + 4}.</span>
              <span className="font-medium">{row.equipo.nombre}</span>
            </div>
            <span className="font-semibold">{row.total} pts</span>
          </div>
        ))}
      </div>
    </RankingLayout>
  );
}
