import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { partidoId: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const partidoId = Number(params.partidoId);
  const partido = await prisma.partido.findUnique({
    where: { id: partidoId },
    include: { fecha: true },
  });
  if (!partido) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const jugadorFechas = await prisma.jugadorFecha.findMany({
    where: { fechaId: partido.fechaId, plantel: partido.plantel },
    include: { jugador: true },
    orderBy: { puntajeCalculado: 'desc' },
  });

  return NextResponse.json({
    partido: {
      id: partido.id,
      plantel: partido.plantel,
      estado: partido.estado,
      fechaNro: partido.fecha.nro,
      rival: partido.fecha.rival,
    },
    jugadores: jugadorFechas.map((jf) => ({
      jfId: jf.id,
      nombre: jf.jugador.nombre,
      apellido: jf.jugador.apellido,
      apodo: jf.jugador.apodo,
      posicion: jf.jugador.posicion,
      puntaje: jf.puntajeOverride ?? jf.puntajeCalculado,
    })),
  });
}
