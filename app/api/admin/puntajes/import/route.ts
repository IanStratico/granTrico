import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseCsv } from '@/lib/csv';
import { recalculateFechaScores } from '@/lib/scoring';

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
    if (!id || Number.isNaN(id)) {
      errores++;
      continue;
    }
    const jf = await prisma.jugadorFecha.findUnique({
      where: { fechaId_jugadorId: { fechaId, jugadorId: id } }
    });
    if (!jf) {
      errores++;
      continue;
    }
    const data: any = {};
    const fieldMap: Record<string, string> = {
      tries: 'tries',
      tackles: 'tackles',
      knock_ons: 'knockOns',
      penales: 'penales',
      amarillas: 'amarillas',
      rojas: 'rojas',
      conversiones_metidas: 'conversionesMetidas',
      conversiones_erradas: 'conversionesErradas',
      penales_metidos: 'penalesMetidos',
      penales_errados: 'penalesErrados',
    };
    Object.entries(fieldMap).forEach(([csv, prisma]) => {
      if (row[csv] !== undefined) data[prisma] = Number(row[csv] ?? 0);
    });
    try {
      await prisma.jugadorFecha.update({
        where: { id: jf.id },
        data
      });
      procesados++;
    } catch {
      errores++;
    }
  }

  await recalculateFechaScores(fechaId);

  return NextResponse.json({ procesados, errores });
};
