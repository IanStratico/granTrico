import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const POST = async (req: Request) => {
  const body = await req.json().catch(() => null);
  const nombre = body?.nombre?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  if (!nombre || !email || !password) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  try {
    const exists = await prisma.usuario.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 });
    const hash = await bcrypt.hash(password, 10);
    await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash: hash,
        isAdmin: false
      }
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'No se pudo registrar' }, { status: 500 });
  }
};
