import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  console.log('update-role body', body);
  const userId = body?.userId ? Number(body.userId) : NaN;
  const role = body?.role as 'ADMIN' | 'USER' | undefined;

  if (!userId || Number.isNaN(userId) || (role !== 'ADMIN' && role !== 'USER')) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  try {
    await prisma.usuario.update({
      where: { id: userId },
      data: { isAdmin: role === 'ADMIN' }
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 });
  }
};
