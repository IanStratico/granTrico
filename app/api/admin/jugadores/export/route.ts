import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const jugadores = await prisma.jugador.findMany({
    orderBy: { id: 'asc' }
  });

  const header = 'id,nombre,apellido,apodo,camada,posicion';
  const lines = jugadores.map((j) => {
    const vals = [
      j.id,
      j.nombre,
      j.apellido,
      j.apodo ?? '',
      j.camada ?? '',
      j.posicion
    ];
    return vals.join(',');
  });

  const csv = [header, ...lines].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="jugadores.csv"'
    }
  });
};
