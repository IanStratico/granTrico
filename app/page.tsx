import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect('/mi-equipo');
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-emerald-900/70 to-black/50" />
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 space-y-4">
        <img src="/logo.png" alt="Trico" className="h-20 w-auto" />
        <h1 className="text-4xl font-bold text-white">Trico Fantasy</h1>
        <p className="text-base text-white/80">Elegí. Sumá puntos. Ganá.</p>

        <div className="mt-10 w-4/5 max-w-sm flex flex-col gap-3">
          <a
            href="/login"
            className="w-full py-3 rounded-xl bg-[#2f6df6] text-white font-semibold shadow-lg text-center"
          >
            Iniciar sesión
          </a>
          <a
            href="/register"
            className="w-full py-3 rounded-xl bg-white text-black font-semibold shadow text-center"
          >
            Registrarse
          </a>
        </div>

        <p className="mt-6 text-xs text-white/70">Jugá con tu club</p>
      </div>
    </div>
  );
}
