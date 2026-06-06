import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { assertAnotadorAutorizado } from '@/lib/anotador';
import { revertLastAnotacion, ACCION_LABEL } from '@/lib/anotacionApply';

export async function POST(
  _req: NextRequest,
  { params }: { params: { partidoId: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const partidoId = Number(params.partidoId);
  const ctx = await assertAnotadorAutorizado(partidoId, Number(session.user.id));
  if (!ctx) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  if (ctx.partido.estado !== 'EN_CURSO') {
    return NextResponse.json({ error: 'El partido no está en curso' }, { status: 409 });
  }

  const result = await revertLastAnotacion(partidoId);
  if (!result) {
    return NextResponse.json({ error: 'No hay anotaciones para deshacer' }, { status: 404 });
  }

  const { jugadorFecha } = result;
  const accionLabel = ACCION_LABEL[result.anotacion.accion];
  const nombreJugador = jugadorFecha.jugador.apodo ?? `${jugadorFecha.jugador.apellido}, ${jugadorFecha.jugador.nombre}`;

  return NextResponse.json({
    anotacion: result.anotacion,
    mensaje: `${accionLabel} de ${nombreJugador}`,
    puntajeCalculado: jugadorFecha.puntajeCalculado,
  });
}
