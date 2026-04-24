import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ComoJugarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold" style={{ color: "#c8a951" }}>
        ¿Cómo jugar?
      </h1>

      <section
        className="rounded-lg p-5 space-y-3"
        style={{ background: "#1a3a6b", border: "1px solid #c8a951" }}
      >
        <h2 className="text-base font-semibold" style={{ color: "#c8a951" }}>
          Cómo armar tu equipo
        </h2>
        <ul
          className="space-y-2 text-sm list-disc list-inside"
          style={{ color: "#f5f0e0" }}
        >
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
          <li>
            Elegí <strong>1 pateador</strong> obligatorio entre los 15
            seleccionados. Solo sus patadas a los palos suman o restan puntos al
            equipo.
          </li>
        </ul>
      </section>

      <section
        className="rounded-lg p-5 space-y-3"
        style={{ background: "#1a3a6b", border: "1px solid #c8a951" }}
      >
        <h2 className="text-base font-semibold" style={{ color: "#c8a951" }}>
          Etapas de una fecha
        </h2>
        <div className="space-y-3 text-sm" style={{ color: "#f5f0e0" }}>
          <div className="flex gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
            <div>
              <p className="font-medium" style={{ color: "#f5f0e0" }}>
                PREVIA
              </p>
              <p>Podés armar y editar tu equipo libremente.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
            <div>
              <p className="font-medium" style={{ color: "#f5f0e0" }}>
                CERRADA
              </p>
              <p>Ya no se puede editar el equipo. El partido está en juego.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-green-400 flex-shrink-0 mt-1.5" />
            <div>
              <p className="font-medium" style={{ color: "#f5f0e0" }}>
                PUNTUADA
              </p>
              <p>
                Se publican los puntajes de cada jugador y el ranking de la
                fecha.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="rounded-lg p-5 space-y-3"
        style={{ background: "#1a3a6b", border: "1px solid #c8a951" }}
      >
        <h2 className="text-base font-semibold" style={{ color: "#c8a951" }}>
          Cómo se calculan los puntos
        </h2>
        <div
          className="rounded px-4 py-3 text-sm font-mono"
          style={{
            background: "#0d1f35",
            border: "1px solid #c8a951",
            color: "#f5f0e0",
          }}
        >
          tries×10 + tackles − knockOns×2 − penales×2 − amarillas×5 − rojas×10
        </div>
        <ul
          className="space-y-1 text-sm list-disc list-inside"
          style={{ color: "#f5f0e0" }}
        >
          <li>
            El <strong>capitán</strong> suma su puntaje dos veces.
          </li>
          <li>
            El <strong>pateador</strong> suma o resta puntos adicionales según
            sus patadas a los palos:{" "}
            <span style={{ color: "#c8a951" }}>
              conversión metida +1 · conversión errada −1 · penal metido +2 · penal errado −2
            </span>
            . Estos puntos solo cuentan si elegiste a ese jugador como pateador.
          </li>
        </ul>
      </section>
    </main>
  );
}
