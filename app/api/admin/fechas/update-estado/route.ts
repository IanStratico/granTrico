import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EstadoFecha } from '@prisma/client';

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const fechaId = Number(body?.fechaId);
  const estado = body?.estado as EstadoFecha | undefined;

  if (!fechaId || !estado) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  try {
    await prisma.fecha.update({
      where: { id: fechaId },
      data: { estado }
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 });
  }
};
