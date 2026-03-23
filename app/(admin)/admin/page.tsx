import { prisma } from '@/lib/prisma';
import { EstadoFecha } from '@prisma/client';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminRootPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  const temporadaActiva = await prisma.temporada.findFirst({ where: { activa: true } });
  const fechas = temporadaActiva
    ? await prisma.fecha.findMany({
        where: { temporadaId: temporadaActiva.id },
        orderBy: { nro: 'asc' }
      })
    : [];

  const target =
    fechas.find((f) => f.estado === EstadoFecha.PREVIA) || (fechas.length ? fechas[fechas.length - 1] : null);

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      {!temporadaActiva && (
        <p className="text-sm text-gray-700">
          No hay temporada activa. Creá una para comenzar desde{' '}
          <Link href="/admin/temporadas" className="text-blue-600 underline">
            Gestión de temporadas
          </Link>
          .
        </p>
      )}
      <div className="space-y-3">
        <Link
          href={target ? `/admin/fecha/${target.id}` : '#'}
          className={`block w-full text-center rounded bg-blue-600 text-white px-4 py-3 text-base ${
            target ? 'hover:bg-blue-700' : 'opacity-50 pointer-events-none'
          }`}
        >
          Ir a última fecha
        </Link>
        <Link
          href="/admin/fechas"
          className="block w-full text-center rounded border px-4 py-3 text-base bg-white hover:bg-gray-50"
        >
          Gestión de fechas
        </Link>
        <Link
          href="/admin/jugadores"
          className="block w-full text-center rounded border px-4 py-3 text-base bg-white hover:bg-gray-50"
        >
          Gestión de jugadores
        </Link>
        <Link
          href="/admin/temporadas"
          className="block w-full text-center rounded border px-4 py-3 text-base bg-white hover:bg-gray-50"
        >
          Gestión de temporadas
        </Link>
        <Link
          href="/admin/usuarios"
          className="block w-full text-center rounded border px-4 py-3 text-base bg-white hover:bg-gray-50"
        >
          Gestión de usuarios
        </Link>
      </div>
    </main>
  );
}
