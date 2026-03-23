import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CreateTemporadaForm from '@/components/CreateTemporadaForm';
import ActivateTemporadaButton from '@/components/ActivateTemporadaButton';

export default async function AdminTemporadasPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect('/login');

  const temporadas = await prisma.temporada.findMany({ orderBy: { id: 'desc' } });

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Temporadas</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Crear temporada</h2>
        <CreateTemporadaForm />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Listado</h2>
        <div className="space-y-2">
          {temporadas.map((t) => (
            <div key={t.id} className="rounded border bg-white px-3 py-2 text-sm flex items-center justify-between">
              <div>
                <p className="font-semibold">{t.nombre}</p>
                <p className="text-xs text-gray-600">{t.activa ? 'Activa' : 'Inactiva'}</p>
              </div>
              {!t.activa && <ActivateTemporadaButton temporadaId={t.id} />}
              {t.activa && <span className="text-xs font-semibold text-green-700 px-2 py-1">Activa</span>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
