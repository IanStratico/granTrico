import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { assertAnotadorAutorizado } from '@/lib/anotador';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { partidoId: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const partidoId = Number(params.partidoId);
  const ctx = await assertAnotadorAutorizado(partidoId, Number(session.user.id));
  if (!ctx) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { partido } = ctx;

  const jugadorFechas = await prisma.jugadorFecha.findMany({
    where: { fechaId: partido.fechaId, plantel: partido.plantel },
    include: { jugador: true },
    orderBy: { puntajeCalculado: 'desc' },
  });

  const jugadores = jugadorFechas.map((jf) => ({
    jfId: jf.id,
    jugadorId: jf.jugador.id,
    nombre: jf.jugador.nombre,
    apellido: jf.jugador.apellido,
    apodo: jf.jugador.apodo,
    posicion: jf.jugador.posicion,
    puntaje: jf.puntajeOverride ?? jf.puntajeCalculado,
  }));

  return NextResponse.json({ jugadores, partido: { id: partido.id, estado: partido.estado } });
}
