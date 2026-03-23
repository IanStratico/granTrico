import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ImportJugadoresForm from '@/components/ImportJugadoresForm';

export default async function AdminJugadoresPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect('/login');
  }

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Jugadores</h1>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Importar</h2>
        <ImportJugadoresForm />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Exportar</h2>
        <Link
          href="/api/admin/jugadores/export"
          className="rounded border px-4 py-2 text-base bg-white hover:bg-gray-50 inline-block"
        >
          Exportar jugadores
        </Link>
      </section>
    </main>
  );
}
