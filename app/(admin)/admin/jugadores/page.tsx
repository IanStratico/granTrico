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
      <h1 className="text-2xl font-semibold text-[#c8a951]">Jugadores</h1>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-[#c8a951]">Importar</h2>
        <ImportJugadoresForm />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-[#c8a951]">Exportar</h2>
        <Link
          href="/api/admin/jugadores/export"
          className="rounded border border-[#c8a951] px-4 py-2 text-base bg-[#1a3a6b] text-[#f5f0e0] hover:bg-[#1a6b3a] inline-block"
        >
          Exportar jugadores
        </Link>
      </section>
    </main>
  );
}
