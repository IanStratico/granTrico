import Link from "next/link";

const LABEL_PLANTEL: Record<string, string> = {
  PRIMERA: "Primera",
  INTER: "Intermedia",
  PRE_A: "Pre A",
  PRE_B: "Pre B",
  PRE_C: "Pre C",
  PRE_D: "Pre D",
};

const LABEL_ESTADO: Record<string, string> = {
  NO_INICIADO: "Sin iniciar",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
};

const COLOR_ESTADO: Record<string, string> = {
  NO_INICIADO: "rgba(245,240,224,0.5)",
  EN_CURSO: "#4ade80",
  FINALIZADO: "#c8a951",
};

interface Asignacion {
  fechaNro: number;
  rival: string;
  plantel: string;
  partidoId: number;
  estadoPartido: string;
}

interface Props {
  asignaciones: Asignacion[];
}

export default function AnotadorHomeCard({ asignaciones }: Props) {
  if (asignaciones.length === 0) return null;

  return (
    <section
      className="rounded-xl p-4 space-y-3"
      style={{ background: "#1a3a6b", border: "2px solid #c8a951" }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "#c8a951", opacity: 0.8 }}
      >
        Anotador asignado
      </p>
      {asignaciones.map((a) => (
        <div key={a.partidoId} className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold" style={{ color: "#f5f0e0" }}>
              Fecha {a.fechaNro} · {LABEL_PLANTEL[a.plantel] ?? a.plantel} vs {a.rival}
            </p>
            <p className="text-xs mt-0.5" style={{ color: COLOR_ESTADO[a.estadoPartido] ?? "rgba(245,240,224,0.5)" }}>
              {LABEL_ESTADO[a.estadoPartido] ?? a.estadoPartido}
            </p>
          </div>
          <Link
            href={`/anotador/${a.partidoId}`}
            className="rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap"
            style={{ background: "#1a6b3a", border: "1px solid #4ade80", color: "#f5f0e0" }}
          >
            {a.estadoPartido === "EN_CURSO" ? "Continuar" : a.estadoPartido === "FINALIZADO" ? "Ver resumen" : "Ir a anotar"}
          </Link>
        </div>
      ))}
    </section>
  );
}
