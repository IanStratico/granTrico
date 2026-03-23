import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CreateFechaForm from '@/components/CreateFechaForm';
import { getTemporadaActiva } from '@/lib/temporada';

export default async function AdminFechasPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  const temporada = await getTemporadaActiva();
  const fechas = temporada
    ? await prisma.fecha.findMany({ where: { temporadaId: temporada.id }, orderBy: { nro: 'asc' } })
    : [];

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Fechas</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Crear fecha</h2>
        <CreateFechaForm />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Listado</h2>
        <div className="space-y-2">
          {fechas.map((f) => (
            <div key={f.id} className="rounded border bg-white px-3 py-2 text-sm flex justify-between">
              <div>
                <p className="font-semibold">Fecha {f.nro} vs {f.rival}</p>
                <p className="text-xs text-gray-600">Estado: {f.estado}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
