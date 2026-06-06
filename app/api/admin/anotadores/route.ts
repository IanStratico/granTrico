import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const fechaId = Number(req.nextUrl.searchParams.get('fechaId'));
  if (!fechaId) return NextResponse.json({ error: 'Falta fechaId' }, { status: 400 });

  const [asignaciones, partidos] = await Promise.all([
    prisma.anotadorAsignacion.findMany({
      where: { fechaId },
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
    }),
    prisma.partido.findMany({ where: { fechaId } }),
  ]);

  return NextResponse.json({ asignaciones, partidos });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { fechaId, plantel, usuarioId } = body ?? {};

  if (!fechaId || !plantel || !usuarioId) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }

  const fecha = await prisma.fecha.findUnique({ where: { id: Number(fechaId) } });
  if (!fecha) return NextResponse.json({ error: 'Fecha no encontrada' }, { status: 404 });
  if (fecha.estado === 'PUNTUADA') {
    return NextResponse.json({ error: 'No se puede asignar anotadores a una fecha puntuada' }, { status: 409 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } });
  if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  const partido = await prisma.partido.upsert({
    where: { fechaId_plantel: { fechaId: Number(fechaId), plantel } },
    create: { fechaId: Number(fechaId), plantel, estado: 'NO_INICIADO' },
    update: {},
  });

  const asignacion = await prisma.anotadorAsignacion.upsert({
    where: { fechaId_plantel: { fechaId: Number(fechaId), plantel } },
    create: { fechaId: Number(fechaId), plantel, usuarioId: Number(usuarioId) },
    update: { usuarioId: Number(usuarioId) },
    include: { usuario: { select: { id: true, nombre: true, email: true } } },
  });

  return NextResponse.json({ asignacion, partido });
}
