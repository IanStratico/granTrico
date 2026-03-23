import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseCsv } from '@/lib/csv';
import { Plantel } from '@prisma/client';

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const fechaIdVal = form.get('fechaId');
  const fechaId = fechaIdVal ? Number(fechaIdVal) : NaN;
  if (!fechaId || Number.isNaN(fechaId)) {
    return NextResponse.json({ error: 'fechaId requerido' }, { status: 400 });
  }
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCsv(text);
  let procesados = 0;
  let errores = 0;

  for (const row of rows) {
    const id = row['id'] ? Number(row['id']) : NaN;
    const plantelRaw = row['plantel']?.trim() as Plantel | undefined;
    if (!id || Number.isNaN(id) || !plantelRaw) {
      errores++;
      continue;
    }
    const player = await prisma.jugador.findUnique({ where: { id } });
    if (!player) {
      errores++;
      continue;
    }
    try {
      await prisma.jugadorFecha.upsert({
        where: { fechaId_jugadorId: { fechaId, jugadorId: id } },
        update: { plantel: plantelRaw },
        create: { fechaId, jugadorId: id, plantel: plantelRaw }
      });
      procesados++;
    } catch {
      errores++;
    }
  }

  return NextResponse.json({ procesados, errores });
};
