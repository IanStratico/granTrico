import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number(params.id);
  const asignacion = await prisma.anotadorAsignacion.findUnique({ where: { id } });
  if (!asignacion) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const force = req.nextUrl.searchParams.get('force') === 'true';
  const partido = await prisma.partido.findFirst({
    where: { fechaId: asignacion.fechaId, plantel: asignacion.plantel },
  });

  if (partido?.estado === 'EN_CURSO' && !force) {
    return NextResponse.json(
      { error: 'El partido está en curso. Pasá ?force=true para confirmar.' },
      { status: 409 }
    );
  }

  await prisma.anotadorAsignacion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
