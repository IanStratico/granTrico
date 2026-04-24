import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const userId = body?.userId ? Number(body.userId) : NaN;

  if (!userId || Number.isNaN(userId)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  try {
    await prisma.usuario.update({
      where: { id: userId },
      data: { passwordHash }
    });
    return NextResponse.json({ tempPassword });
  } catch {
    return NextResponse.json({ error: 'No se pudo resetear la contraseña' }, { status: 500 });
  }
};
