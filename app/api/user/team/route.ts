import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRoster } from '@/lib/validation';
import { EstadoFecha } from '@prisma/client';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { fechaId, asignaciones, capitanId, pateadorId } = body as {
    fechaId: number;
    asignaciones: { slot: number; jugadorId: number }[];
    capitanId: number | null;
    pateadorId: number | null;
  };

  const jugadorIds = asignaciones.map((a) => a.jugadorId);

  const fecha = await prisma.fecha.findUnique({ where: { id: fechaId }, include: { temporada: true } });
  if (!fecha) return NextResponse.json({ error: 'Fecha no encontrada' }, { status: 404 });
  if (fecha.estado !== EstadoFecha.PREVIA) {
    return NextResponse.json({ error: 'La fecha no admite edición' }, { status: 400 });
  }

  const convocados = await prisma.jugadorFecha.findMany({
    where: { fechaId, jugadorId: { in: jugadorIds } },
    include: { jugador: true }
  });

  const convocadoMap = Object.fromEntries(convocados.map((c) => [c.jugadorId, c]));

  const validation = validateRoster(
    asignaciones.map((a) => {
      const c = convocadoMap[a.jugadorId];
      return {
        jugadorId: a.jugadorId,
        slot: a.slot,
        posicion: c.jugador.posicion,
        plantel: c.plantel,
      };
    }),
    capitanId,
    pateadorId
  );
  if (!validation.ok) return NextResponse.json({ error: validation.message }, { status: 400 });

  const userId = Number(session.user.id);

  // ensure equipo for temporada
  const equipo = await prisma.equipo.upsert({
    where: { temporadaId_usuarioId: { temporadaId: fecha.temporadaId, usuarioId: userId } },
    update: {},
    create: {
      temporadaId: fecha.temporadaId,
      usuarioId: userId,
      nombre: `${session.user.name ?? 'Equipo'}`
    }
  });

  const equipoFecha = await prisma.equipoFecha.upsert({
    where: { equipoId_fechaId: { equipoId: equipo.id, fechaId } },
    update: { capitanJugadorId: capitanId, pateadorJugadorId: pateadorId },
    create: { equipoId: equipo.id, fechaId, capitanJugadorId: capitanId, pateadorJugadorId: pateadorId }
  });

  // replace roster
  await prisma.equipoFechaJugador.deleteMany({ where: { equipoFechaId: equipoFecha.id } });
  await prisma.equipoFechaJugador.createMany({
    data: asignaciones.map((a) => ({ equipoFechaId: equipoFecha.id, jugadorId: a.jugadorId, slot: a.slot }))
  });

  return NextResponse.json({ ok: true });
}
