import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { assertAnotadorAutorizado } from '@/lib/anotador';
import { prisma } from '@/lib/prisma';

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
  if (partido.estado === 'EN_CURSO') {
    return NextResponse.json({ partido });
  }

  const convocados = await prisma.jugadorFecha.count({
    where: { fechaId: partido.fechaId, plantel: partido.plantel },
  });
  if (convocados === 0) {
    return NextResponse.json(
      { error: 'Cargá convocados del plantel antes de iniciar el partido' },
      { status: 409 }
    );
  }

  const actualizado = await prisma.partido.update({
    where: { id: partidoId },
    data: { estado: 'EN_CURSO', iniciadoAt: new Date() },
  });

  return NextResponse.json({ partido: actualizado });
}
