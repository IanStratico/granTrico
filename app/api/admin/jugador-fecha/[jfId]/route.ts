import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Posicion, Plantel } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: { jfId: string } }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const jfId = Number(params.jfId);
  if (!jfId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const jf = await prisma.jugadorFecha.findUnique({ where: { id: jfId } });
  if (!jf) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const body = await request.json();
  const { plantel, posicion, nombre, apellido, apodo, camada } = body;

  try {
    if (plantel !== undefined) {
      await prisma.jugadorFecha.update({ where: { id: jfId }, data: { plantel: plantel as Plantel } });
    }

    const hasJugadorUpdate = posicion !== undefined || nombre !== undefined || apellido !== undefined || apodo !== undefined || camada !== undefined;
    if (hasJugadorUpdate) {
      await prisma.jugador.update({
        where: { id: jf.jugadorId },
        data: {
          ...(posicion !== undefined && { posicion: posicion as Posicion }),
          ...(nombre !== undefined && { nombre: nombre as string }),
          ...(apellido !== undefined && { apellido: apellido as string }),
          ...(apodo !== undefined && { apodo: (apodo as string) || null }),
          ...(camada !== undefined && { camada: camada ? Number(camada) : null }),
        },
      });
    }
  } catch (e) {
    console.error('[PATCH jugador-fecha]', e);
    return NextResponse.json({ error: 'Error al guardar en la base de datos' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
