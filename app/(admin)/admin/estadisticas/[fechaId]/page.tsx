interface Props {
  params: { fechaId: string };
}

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import StatsTableClient, { StatsRow } from '@/components/StatsTableClient';

interface Props {
  params: { fechaId: string };
}

export default async function AdminEstadisticasPage({ params }: Props) {
  const fechaId = Number(params.fechaId);
  const fecha = await prisma.fecha.findUnique({ where: { id: fechaId } });
  if (!fecha) notFound();

  const convocados = await prisma.jugadorFecha.findMany({
    where: { fechaId },
    include: { jugador: true },
    orderBy: { jugadorId: 'asc' }
  });

  const rows: StatsRow[] = convocados.map((c) => ({
    jfId: c.id,
    jugador: `${c.jugador.apellido}, ${c.jugador.nombre}`,
    tries: c.tries,
    tackles: c.tackles,
    knockOns: c.knockOns,
    penales: c.penales,
    amarillas: c.amarillas,
    rojas: c.rojas,
    puntajeOverride: c.puntajeOverride
  }));

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Estadísticas fecha {fecha.nro}</h1>
        <p className="text-sm text-gray-600">Carga manual y cálculo de puntajes.</p>
      </div>

      <StatsTableClient fechaId={fechaId} rows={rows} />
    </main>
  );
}
