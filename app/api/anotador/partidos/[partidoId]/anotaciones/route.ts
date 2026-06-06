import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { assertAnotadorAutorizado } from '@/lib/anotador';
import { applyAnotacion } from '@/lib/anotacionApply';
import { prisma } from '@/lib/prisma';
import { AccionTipo } from '@prisma/client';

const ACCIONES_VALIDAS = new Set<string>(Object.values(AccionTipo));

export async function POST(
  req: NextRequest,
  { params }: { params: { partidoId: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const partidoId = Number(params.partidoId);
  const ctx = await assertAnotadorAutorizado(partidoId, Number(session.user.id));
  if (!ctx) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { partido } = ctx;
  if (partido.estado !== 'EN_CURSO') {
    return NextResponse.json({ error: 'El partido no está en curso' }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const { jugadorFechaId, accion } = body ?? {};

  if (!jugadorFechaId || !accion || !ACCIONES_VALIDAS.has(accion)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const jf = await prisma.jugadorFecha.findFirst({
    where: { id: Number(jugadorFechaId), fechaId: partido.fechaId, plantel: partido.plantel },
    include: { jugador: true },
  });
  if (!jf) return NextResponse.json({ error: 'Jugador no pertenece a este partido' }, { status: 400 });

  const result = await applyAnotacion({
    partidoId,
    jugadorFechaId: Number(jugadorFechaId),
    accion: accion as AccionTipo,
    anotadorId: Number(session.user.id),
  });

  return NextResponse.json({
    anotacion: result.anotacion,
    jugador: {
      id: jf.jugador.id,
      nombre: jf.jugador.nombre,
      apellido: jf.jugador.apellido,
      apodo: jf.jugador.apodo,
    },
    puntajeCalculado: result.jugadorFecha.puntajeCalculado,
  });
}
