import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RankingLayout from "@/components/RankingLayout";
import Link from "next/link";
import { auth } from "@/lib/auth";
import RankingFechaClient, { RankingTeamVM } from "../RankingFechaClient";
import { getTemporadaActiva } from "@/lib/temporada";

interface Props {
  params: { fechaId: string };
}

const medal = ["🥇", "🥈", "🥉"];

export default async function RankingFechaPage({ params }: Props) {
  const session = await auth();
  const fechaId = Number(params.fechaId);
  const activa = await getTemporadaActiva();
  if (!activa) notFound();
  const fecha = await prisma.fecha.findFirst({
    where: { id: fechaId, temporadaId: activa.id },
    include: { temporada: true },
  });
  if (!fecha) notFound();

  const fechas = await prisma.fecha.findMany({
    where: { temporadaId: fecha.temporadaId },
    orderBy: { nro: "asc" },
  });
  const index = fechas.findIndex((f) => f.id === fecha.id);
  const prev = index > 0 ? fechas[index - 1] : null;
  const next =
    index >= 0 && index < fechas.length - 1 ? fechas[index + 1] : null;

  const equipos = await prisma.equipoFecha.findMany({
    where: { fechaId },
    orderBy: { puntajeTotal: "desc" },
    include: {
      equipo: { include: { usuario: true } },
      jugadores: { include: { jugador: true } },
    },
  });

  const jugadorFechas = await prisma.jugadorFecha.findMany({
    where: { fechaId },
    select: {
      jugadorId: true,
      puntajeCalculado: true,
      puntajeOverride: true,
      plantel: true,
    },
  });

  const scoreMap = Object.fromEntries(
    jugadorFechas.map((jf) => [
      jf.jugadorId,
      jf.puntajeOverride ?? jf.puntajeCalculado,
    ]),
  );

  const plantelMap = Object.fromEntries(
    jugadorFechas.map((jf) => [jf.jugadorId, jf.plantel]),
  );

  const teams: RankingTeamVM[] = equipos.map((ef) => {
    const jugadoresOrdenados = [...ef.jugadores]
      .sort((a, b) => a.id - b.id)
      .map((j) => ({
        jugadorId: j.jugadorId,
        nombre: `${j.jugador.apellido}, ${j.jugador.nombre}`,
        posicion: j.jugador.posicion,
        score: scoreMap[j.jugadorId] ?? null,
        apodo: j.jugador.apodo ?? null,
        plantel: plantelMap[j.jugadorId] ?? null,
        camada: j.jugador.camada != null ? String(j.jugador.camada) : null,
      }));

    return {
      equipoFechaId: ef.id,
      equipoNombre: ef.equipo.nombre,
      usuarioNombre: ef.equipo.usuario.nombre,
      puntajeTotal: ef.puntajeTotal,
      capitanId: ef.capitanJugadorId,
      jugadores: jugadoresOrdenados,
    };
  });

  return (
    <RankingFechaClient
      title={`Ranking Fecha ${fecha.nro} - ${fecha.rival}`}
      teams={teams}
      prevId={prev?.id ?? null}
      nextId={next?.id ?? null}
      userEmail={session?.user?.email ?? ""}
      userRole={session?.user?.isAdmin ? "admin" : "user"}
      isAdmin={!!session?.user?.isAdmin}
      estado={fecha.estado}
    />
  );
}
