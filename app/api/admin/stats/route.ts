import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recalculateFechaScores } from '@/lib/scoring';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { fechaId, rows } = body as {
    fechaId: number;
    rows: Array<{
      jfId: number;
      tries: number;
      tackles: number;
      knockOns: number;
      penales: number;
      amarillas: number;
      rojas: number;
      puntajeOverride: number | null;
    }>;
  };

  if (!fechaId || !Array.isArray(rows)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  for (const row of rows) {
    await prisma.jugadorFecha.update({
      where: { id: row.jfId },
      data: {
        tries: row.tries,
        tackles: row.tackles,
        knockOns: row.knockOns,
        penales: row.penales,
        amarillas: row.amarillas,
        rojas: row.rojas,
        puntajeOverride: row.puntajeOverride
      }
    });
  }

  await recalculateFechaScores(fechaId);

  return NextResponse.json({ ok: true });
}
