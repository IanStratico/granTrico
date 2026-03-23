import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTemporadaActiva } from '@/lib/temporada';

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  let nro: number | null = null;
  let rival: string | null = null;

  if (form) {
    nro = Number(form.get('nro'));
    rival = form.get('rival') as string | null;
  } else {
    const body = await req.json().catch(() => null);
    nro = body?.nro ? Number(body.nro) : null;
    rival = body?.rival ?? null;
  }

  if (!nro || !rival) {
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
