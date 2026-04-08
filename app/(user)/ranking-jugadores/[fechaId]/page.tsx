import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTemporadaActiva } from '@/lib/temporada';
import RankingJugadoresClient from '../RankingJugadoresClient';

interface Props {
  params: { fechaId: string };
}

export default async function RankingJugadoresPage({ params }: Props) {
  const session = await auth();
  const fechaId = Number(params.fechaId);

  const activa = await getTemporadaActiva();
  if (!activa) notFound();

  const fecha = await prisma.fecha.findFirst({
    where: { id: fechaId, temporadaId: activa.id },
  });
  if (!fecha) notFound();

  const [fechas, jugadorFechasRaw] = await Promise.all([
    prisma.fecha.findMany({
      where: { temporadaId: activa.id },
      orderBy: { nro: 'asc' },
    }),
    prisma.jugadorFecha.findMany({
      where: { fechaId },
      include: { jugador: true },
    }),
  ]);

  const index = fechas.findIndex((f) => f.id === fecha.id);
  const prev = index > 0 ? fechas[index - 1] : null;
  const next = index >= 0 && index < fechas.length - 1 ? fechas[index + 1] : null;

  const jugadorFechas = jugadorFechasRaw.filter((jf) => jf.plantel !== null);

  const jugadores = jugadorFechas
    .map((jf) => ({
      jugadorId: jf.jugadorId,
      nombre: jf.jugador.nombre,
      apellido: jf.jugador.apellido,
      apodo: jf.jugador.apodo ?? undefined,
      posicion: jf.jugador.posicion,
      camada: jf.jugador.camada != null ? String(jf.jugador.camada) : undefined,
      plantel: jf.plantel ?? '',
      score: jf.puntajeOverride ?? jf.puntajeCalculado,
      tries: jf.tries,
      tackles: jf.tackles,
      knockOns: jf.knockOns,
      penales: jf.penales,
      amarillas: jf.amarillas,
      rojas: jf.rojas,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <RankingJugadoresClient
      title={`Fecha ${fecha.nro} - ${fecha.rival}`}
      estado={fecha.estado}
      prevId={prev?.id ?? null}
      nextId={next?.id ?? null}
      jugadores={jugadores}
    />
  );
}
