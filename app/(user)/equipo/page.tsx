import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EstadoFecha } from "@prisma/client";
import EquipoClient from "./EquipoClient";

interface Props {
  searchParams?: { fecha?: string };
}

export default async function EquipoPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Obtener todas las fechas de la temporada activa (o la primera si no hay activa)
  const temporadaActiva = await prisma.temporada.findFirst({
    where: { activa: true },
  });
  if (!temporadaActiva) {
    return (
      <main className="space-y-2">
        <h1 className="text-2xl font-semibold">Mi equipo</h1>
        <p className="text-gray-600">No hay temporada activa.</p>
      </main>
    );
  }

  const fechas = await prisma.fecha.findMany({
    where: { temporadaId: temporadaActiva.id },
    orderBy: { nro: "asc" },
  });
  if (!fechas.length) {
    return (
      <main className="space-y-2">
        <h1 className="text-2xl font-semibold">Mi equipo</h1>
        <p className="text-gray-600">No hay fechas cargadas.</p>
      </main>
    );
  }

  const requestedFechaId = searchParams?.fecha
    ? Number(searchParams.fecha)
    : null;
  const fecha =
    fechas.find((f) => f.id === requestedFechaId) ||
    fechas.find((f) => f.estado === EstadoFecha.PREVIA) ||
    fechas[0];

  const index = fechas.findIndex((f) => f.id === fecha.id);
  const prev = index > 0 ? fechas[index - 1] : null;
  const next =
    index >= 0 && index < fechas.length - 1 ? fechas[index + 1] : null;

  const convocados = await prisma.jugadorFecha.findMany({
    where: { fechaId: fecha.id },
    include: { jugador: true },
    orderBy: { jugadorId: "asc" },
  });

  const userEquipo = await prisma.equipo.findUnique({
    where: {
      temporadaId_usuarioId: {
        temporadaId: fecha.temporadaId,
        usuarioId: Number(session.user.id),
      },
    },
  });

  const equipoFecha =
    userEquipo &&
    (await prisma.equipoFecha.findUnique({
      where: {
        equipoId_fechaId: { equipoId: userEquipo.id, fechaId: fecha.id },
      },
      include: { jugadores: true },
    }));

  const initialSelected = equipoFecha?.jugadores.map((j) => j.jugadorId) ?? [];
  const initialCapitan = equipoFecha?.capitanJugadorId ?? null;
  const totalEquipo = equipoFecha?.puntajeTotal ?? null;

  const puntajes = await prisma.jugadorFecha.findMany({
    where: { fechaId: fecha.id },
    select: {
      jugadorId: true,
      puntajeCalculado: true,
      puntajeOverride: true,
    },
  });
  const playerScores: Record<number, number> = {};
  puntajes.forEach((p) => {
    playerScores[p.jugadorId] = p.puntajeOverride ?? p.puntajeCalculado;
  });

  return (
    <EquipoClient
      key={fecha.id}
      fechaId={fecha.id}
      fechaNro={fecha.nro}
      prevId={prev?.id ?? null}
      nextId={next?.id ?? null}
      fechaEstado={fecha.estado}
      fechaRival={fecha.rival}
      totalEquipo={totalEquipo}
      playerScores={playerScores}
      convocados={convocados.map((c) => ({
        jugadorId: c.jugadorId,
        nombre: c.jugador.nombre,
        apellido: c.jugador.apellido,
        apodo: c.jugador.apodo,
        camada: c.jugador.camada,
        posicion: c.jugador.posicion,
        plantel: c.plantel,
      }))}
      initialSelected={initialSelected}
      initialCapitan={initialCapitan}
      isAdmin={!!session.user.isAdmin}
      userEmail={session.user.email ?? ""}
      userRole={session.user.isAdmin ? "admin" : "user"}
    />
  );
}
