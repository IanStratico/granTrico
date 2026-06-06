import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { assertAnotadorAutorizado } from '@/lib/anotador';
import { prisma } from '@/lib/prisma';
import { recalculateFechaScores } from '@/lib/scoring';

export async function POST(
  _req: NextRequest,
  { params }: { params: { partidoId: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const partidoId = Number(params.partidoId);
  const ctx = await assertAnotadorAutorizado(partidoId, Number(session.user.id));
  if (!ctx) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { partido } = ctx;

  if (partido.estado === 'FINALIZADO') {
    return NextResponse.json({ error: 'El partido ya está finalizado' }, { status: 409 });
  }
  if (partido.estado === 'NO_INICIADO') {
    return NextResponse.json({ error: 'El partido no fue iniciado' }, { status: 409 });
  }

  const actualizado = await prisma.partido.update({
    where: { id: partidoId },
    data: { estado: 'FINALIZADO', finalizadoAt: new Date() },
  });

  await recalculateFechaScores(partido.fechaId);

  return NextResponse.json({ partido: actualizado });
}
