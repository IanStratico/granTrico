import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import InstallBanner from "@/components/InstallBanner";

const abrevPlantel: Record<string, string> = {
  PRIMERA: "Primera",
  INTER: "Intermedia",
  PRE_A: "Pre A",
  PRE_B: "Pre B",
  PRE_C: "Pre C",
  PRE_D: "Pre D",
};

function effectiveScore(jf: { puntajeCalculado: number; puntajeOverride: number | null }) {
  return jf.puntajeOverride ?? jf.puntajeCalculado;
}

function jugadorNombre(j: { apodo: string | null; nombre: string; apellido: string }) {
  return j.apodo ?? `${j.apellido}, ${j.nombre}`;
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = Number(session.user.id);

  const temporada = await prisma.temporada.findFirst({ where: { activa: true } });

  if (!temporada) {
    return (
      <main className="py-6 space-y-4">
        <p className="text-sm" style={{ color: "rgba(245,240,224,0.5)" }}>
          No hay temporada activa.
        </p>
      </main>
    );
  }

  const [ultimaFecha, proximaFecha] = await Promise.all([
    prisma.fecha.findFirst({
      where: { temporadaId: temporada.id, estado: "PUNTUADA" },
      orderBy: { nro: "desc" },
    }),
    prisma.fecha.findFirst({
      where: { temporadaId: temporada.id, estado: "PREVIA" },
      orderBy: { nro: "asc" },
    }),
  ]);

  let jugadorFechas: Awaited<ReturnType<typeof prisma.jugadorFecha.findMany<{ include: { jugador: true } }>>> = [];
  let equipoFechas: Awaited<ReturnType<typeof prisma.equipoFecha.findMany<{ include: { equipo: { include: { usuario: true } } } }>>> = [];
  let userEquipo: Awaited<ReturnType<typeof prisma.equipo.findFirst>> = null;
  let userEquipoFecha: Awaited<ReturnType<typeof prisma.equipoFecha.findFirst>> = null;
  let masSeleccionados: { jugador: { id: number; nombre: string; apellido: string; apodo: string | null }; count: number }[] = [];

  if (ultimaFecha) {
    const todasFechas = await prisma.fecha.findMany({
      where: { temporadaId: temporada.id },
      select: { id: true },
    });
    const fechaIds = todasFechas.map((f) => f.id);

    [jugadorFechas, equipoFechas, userEquipo] = await Promise.all([
      prisma.jugadorFecha.findMany({
        where: { fechaId: ultimaFecha.id },
        include: { jugador: true },
      }),
      prisma.equipoFecha.findMany({
        where: { fechaId: ultimaFecha.id },
        orderBy: { puntajeTotal: "desc" },
        include: { equipo: { include: { usuario: true } } },
      }),
      prisma.equipo.findFirst({
        where: { temporadaId: temporada.id, usuarioId: userId },
      }),
    ]);

    const masSelRaw = await prisma.equipoFechaJugador.groupBy({
      by: ["jugadorId"],
      where: { equipoFecha: { fechaId: { in: fechaIds } } },
      _count: { jugadorId: true },
      orderBy: { _count: { jugadorId: "desc" } },
      take: 5,
    });

    const [masSelJugadores, ef] = await Promise.all([
      prisma.jugador.findMany({
        where: { id: { in: masSelRaw.map((r) => r.jugadorId) } },
        select: { id: true, nombre: true, apellido: true, apodo: true },
      }),
      userEquipo
        ? prisma.equipoFecha.findFirst({
            where: { equipoId: userEquipo.id, fechaId: ultimaFecha.id },
          })
        : Promise.resolve(null),
    ]);

    userEquipoFecha = ef;

    const masSelMap = new Map(masSelJugadores.map((j) => [j.id, j]));
    masSeleccionados = masSelRaw
      .map((r) => ({ jugador: masSelMap.get(r.jugadorId)!, count: r._count.jugadorId }))
      .filter((r) => r.jugador);
  }

  const sorted = [...jugadorFechas].sort(
    (a, b) => effectiveScore(b) - effectiveScore(a)
  );
  const mvp = sorted[0] ?? null;
  const top5 = sorted.slice(0, 5);
  const bottom3 = sorted.length >= 2 ? sorted.slice(-3).reverse() : [];
  const top3Equipos = equipoFechas.slice(0, 3);
  const userRankIdx = userEquipo
    ? equipoFechas.findIndex((ef) => ef.equipoId === userEquipo!.id)
    : -1;
  const userPos = userRankIdx === -1 ? null : userRankIdx + 1;

  const cardStyle = {
    background: "#1a3a6b",
    border: "1px solid #c8a951",
    borderRadius: "0.5rem",
    padding: "1rem",
  } as const;

  const labelStyle = {
    color: "#c8a951",
    opacity: 0.75,
    fontSize: "0.65rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "0.5rem",
  };

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <main className="py-4 space-y-4">
      <InstallBanner />
      {/* Header fecha */}
      {ultimaFecha ? (
        <section style={cardStyle} className="flex items-center justify-between">
          <div>
            <p style={labelStyle}>Última fecha puntuada</p>
            <h2 className="text-base font-bold" style={{ color: "#c8a951" }}>
              Fecha #{ultimaFecha.nro} — vs {ultimaFecha.rival}
            </h2>
          </div>
          <span
            className="text-xs font-semibold px-2 py-1 rounded"
            style={{ background: "#1a6b3a", color: "#4ade80", border: "1px solid #4ade80" }}
          >
            Puntuada
          </span>
        </section>
      ) : (
        <section style={{ ...cardStyle, opacity: 0.7 }}>
          <p className="text-sm" style={{ color: "rgba(245,240,224,0.5)" }}>
            Todavía no hay fechas puntuadas.
          </p>
        </section>
      )}

      {ultimaFecha && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Columna izquierda */}
          <div className="space-y-4">
            {/* Tu resultado */}
            <section style={cardStyle}>
              <p style={labelStyle}>Tu resultado</p>
              {userEquipoFecha ? (
                <>
                  <p className="text-3xl font-bold" style={{ color: "#c8a951" }}>
                    {userEquipoFecha.puntajeTotal} pts
                  </p>
                  <p className="text-sm mt-1" style={{ color: "rgba(245,240,224,0.6)" }}>
                    Posición #{userPos} de {equipoFechas.length} equipos
                  </p>
                </>
              ) : (
                <p className="text-sm" style={{ color: "rgba(245,240,224,0.45)" }}>
                  No armaste equipo en esta fecha.
                </p>
              )}
            </section>

            {/* MVP */}
            {mvp && (
              <section style={cardStyle}>
                <p style={labelStyle}>MVP de la fecha</p>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <p className="font-semibold" style={{ color: "#f5f0e0" }}>
                      {jugadorNombre(mvp.jugador)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,224,0.55)" }}>
                      {abrevPlantel[mvp.plantel] ?? mvp.plantel}
                    </p>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: "#c8a951" }}>
                    {effectiveScore(mvp)} pts
                  </p>
                </div>
              </section>
            )}

            {/* Top 3 equipos */}
            <section style={cardStyle}>
              <p style={labelStyle}>Top 3 equipos — Fecha #{ultimaFecha.nro}</p>
              {top3Equipos.length === 0 ? (
                <p className="text-sm" style={{ color: "rgba(245,240,224,0.45)" }}>
                  Sin datos de equipos.
                </p>
              ) : (
                <div className="space-y-2">
                  {top3Equipos.map((ef, idx) => (
                    <div
                      key={ef.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(200,169,81,0.3)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{medals[idx]}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#f5f0e0" }}>
                            {ef.equipo.nombre}
                          </p>
                          <p className="text-xs" style={{ color: "rgba(245,240,224,0.55)" }}>
                            {ef.equipo.usuario.nombre}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-sm" style={{ color: "#c8a951" }}>
                        {ef.puntajeTotal} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            {/* Top 5 jugadores */}
            <section style={cardStyle}>
              <p style={labelStyle}>Top 5 jugadores de la fecha</p>
              {top5.length === 0 ? (
                <p className="text-sm" style={{ color: "rgba(245,240,224,0.45)" }}>
                  Sin datos de jugadores.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {top5.map((jf, idx) => (
                    <div
                      key={jf.jugadorId}
                      className="flex items-center justify-between rounded px-3 py-1.5 text-sm"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(200,169,81,0.2)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ color: "#c8a951", minWidth: "1.5rem" }}>
                          {medals[idx] ?? `${idx + 1}.`}
                        </span>
                        <div>
                          <p className="font-medium" style={{ color: "#f5f0e0" }}>
                            {jugadorNombre(jf.jugador)}
                          </p>
                          <p className="text-xs" style={{ color: "rgba(245,240,224,0.5)" }}>
                            {abrevPlantel[jf.plantel] ?? jf.plantel}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold" style={{ color: "#c8a951" }}>
                        {effectiveScore(jf)} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Los 3 peores */}
            {bottom3.length > 0 && (
              <section style={cardStyle}>
                <p style={labelStyle}>Los tres más flojardos de la fecha</p>
                <div className="space-y-1.5">
                  {bottom3.map((jf, idx) => (
                    <div
                      key={jf.jugadorId}
                      className="flex items-center justify-between rounded px-3 py-1.5 text-sm"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,169,81,0.15)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ minWidth: "1.5rem", color: "#e55" }}>
                          {idx === 0 ? "💩" : `${idx + 1}.`}
                        </span>
                        <div>
                          <p className="font-medium" style={{ color: "#f5f0e0" }}>
                            {jugadorNombre(jf.jugador)}
                          </p>
                          <p className="text-xs" style={{ color: "rgba(245,240,224,0.5)" }}>
                            {abrevPlantel[jf.plantel] ?? jf.plantel}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold" style={{ color: "#e55" }}>
                        {effectiveScore(jf)} pts
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Más seleccionados de la temporada */}
            {masSeleccionados.length > 0 && (
              <section style={cardStyle}>
                <p style={labelStyle}>Más seleccionados de la temporada</p>
                <div className="space-y-1.5">
                  {masSeleccionados.map((item, idx) => (
                    <div
                      key={item.jugador.id}
                      className="flex items-center justify-between rounded px-3 py-1.5 text-sm"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,169,81,0.15)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ color: "#c8a951", minWidth: "1.5rem" }}>{idx + 1}.</span>
                        <p style={{ color: "#f5f0e0" }}>{jugadorNombre(item.jugador)}</p>
                      </div>
                      <span className="text-xs" style={{ color: "rgba(245,240,224,0.55)" }}>
                        {item.count} {item.count === 1 ? "equipo" : "equipos"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* Próxima fecha */}
      {proximaFecha && (
        <section style={cardStyle} className="flex items-center justify-between">
          <div>
            <p style={labelStyle}>Próxima fecha</p>
            <h3 className="text-sm font-semibold" style={{ color: "#f5f0e0" }}>
              Fecha #{proximaFecha.nro} — vs {proximaFecha.rival}
            </h3>
            {proximaFecha.cierraEdicionAt && (
              <p className="text-xs mt-0.5" style={{ color: "rgba(245,240,224,0.55)" }}>
                Cierra:{" "}
                {new Intl.DateTimeFormat("es-AR", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(proximaFecha.cierraEdicionAt)}
              </p>
            )}
          </div>
          <Link
            href="/equipo"
            className="text-sm px-4 py-1.5 rounded whitespace-nowrap"
            style={{ background: "#1a6b3a", border: "1px solid #c8a951", color: "#f5f0e0" }}
          >
            Armar equipo
          </Link>
        </section>
      )}

      {/* ¿Cómo jugar? */}
      <Link
        href="/como-jugar"
        className="block text-center text-sm py-2.5 rounded transition-opacity hover:opacity-80"
        style={{ border: "1px solid #c8a951", color: "#c8a951" }}
      >
        ¿Cómo jugar? →
      </Link>
    </main>
  );
}
