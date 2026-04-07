import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ComoJugarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">¿Cómo jugar?</h1>

      <section className="rounded-lg border bg-white p-5 space-y-3">
        <h2 className="text-base font-semibold">Cómo armar tu equipo</h2>
        <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
          <li>
            Seleccioná exactamente <strong>15 jugadores</strong> del plantel
            convocado.
          </li>
          <li>
            Máximo <strong>8 forwards</strong> y máximo <strong>7 backs</strong>
            .
          </li>
          <li>
            Máximo <strong>4 jugadores del mismo plantel</strong> (Primera,
            Inter, Pre-A, Pre-B, Pre-C, Pre-D).
          </li>
          <li>
            Elegí <strong>1 capitán</strong> obligatorio entre los 15
            seleccionados. Su puntaje cuenta doble.
          </li>
        </ul>
      </section>

      <section className="rounded-lg border bg-white p-5 space-y-3">
        <h2 className="text-base font-semibold">Etapas de una fecha</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
            <div>
              <p className="font-medium text-gray-900">PREVIA</p>
              <p>Podés armar y editar tu equipo libremente.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
            <div>
              <p className="font-medium text-gray-900">CERRADA</p>
              <p>Ya no se puede editar el equipo. El partido está en juego.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-green-400 flex-shrink-0 mt-1.5" />
            <div>
              <p className="font-medium text-gray-900">PUNTUADA</p>
              <p>
                Se publican los puntajes de cada jugador y el ranking de la
                fecha.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 space-y-3">
        <h2 className="text-base font-semibold">Cómo se calculan los puntos</h2>
        <div className="rounded bg-gray-50 border px-4 py-3 text-sm font-mono text-gray-800">
          tries×10 + tackles − knockOns×2 − penales×2 − amarillas×5 − rojas×10
        </div>
        <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
          <li>
            El <strong>capitán</strong> suma su puntaje dos veces.
          </li>
        </ul>
      </section>
    </main>
  );
}
