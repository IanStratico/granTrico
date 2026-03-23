import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTemporadaActiva } from '@/lib/temporada';

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const nro = body?.nro !== undefined ? Number(body.nro) : NaN;
  const rival = body?.rival as string | undefined;

  if (isNaN(nro) || !rival) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  try {
    const temporada = await getTemporadaActiva();
    if (!temporada) return NextResponse.json({ error: 'No hay temporada activa' }, { status: 400 });

    const created = await prisma.fecha.create({
      data: {
        nro,
        rival,
        temporadaId: temporada.id
      }
    });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (e) {
    return NextResponse.json({ error: 'No se pudo crear la fecha' }, { status: 500 });
  }
};
