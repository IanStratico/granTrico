import { prisma } from '@/lib/prisma';
import RankingLayout from '@/components/RankingLayout';
import { auth } from '@/lib/auth';
import TablaGeneralClient from './TablaGeneralClient';

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
      equipoId: eq.id,
      equipoNombre: eq.nombre,
      usuarioNombre: eq.usuario.nombre,
      total: acumulado.find((a) => a.equipoId === eq.id)?._sum.puntajeTotal ?? 0
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <RankingLayout
      title="Ranking Temporada"
      isAdmin={!!session?.user?.isAdmin}
      userEmail={session?.user?.email ?? ''}
      userRole={session?.user?.isAdmin ? 'admin' : 'user'}
    >
      <TablaGeneralClient rows={rows} />
    </RankingLayout>
  );
}
