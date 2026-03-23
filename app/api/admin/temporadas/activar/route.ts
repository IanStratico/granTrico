import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const temporadaId = body?.temporadaId ? Number(body.temporadaId) : NaN;
  if (!temporadaId || Number.isNaN(temporadaId)) {
    return NextResponse.json({ error: 'temporadaId requerido' }, { status: 400 });
  }

  try {
    await prisma.$transaction([
      prisma.temporada.updateMany({ data: { activa: false }, where: { activa: true } }),
      prisma.temporada.update({ where: { id: temporadaId }, data: { activa: true } })
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'No se pudo activar la temporada' }, { status: 500 });
  }
};
