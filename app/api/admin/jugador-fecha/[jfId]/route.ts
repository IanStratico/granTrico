import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  if (plantel !== undefined) {
    await prisma.jugadorFecha.update({ where: { id: jfId }, data: { plantel } });
  }

  const jugadorData: Record<string, unknown> = {};
  if (posicion !== undefined) jugadorData.posicion = posicion;
  if (nombre !== undefined) jugadorData.nombre = nombre;
  if (apellido !== undefined) jugadorData.apellido = apellido;
  if (apodo !== undefined) jugadorData.apodo = apodo || null;
  if (camada !== undefined) jugadorData.camada = camada ? Number(camada) : null;

  if (Object.keys(jugadorData).length > 0) {
    await prisma.jugador.update({ where: { id: jf.jugadorId }, data: jugadorData });
  }

  return NextResponse.json({ ok: true });
}
