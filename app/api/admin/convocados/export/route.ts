import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const fechaId = Number(searchParams.get('fechaId'));
  if (!fechaId) {
    return NextResponse.json({ error: 'fechaId requerido' }, { status: 400 });
  }

  // Traer todos los jugadores y mapear plantel si existe jugador_fecha
  const jugadores = await prisma.jugador.findMany({ orderBy: { id: 'asc' } });
  const jfMap = new Map<number, string>();
  const jf = await prisma.jugadorFecha.findMany({ where: { fechaId } });
  jf.forEach((row) => jfMap.set(row.jugadorId, row.plantel));

  const header = 'id,nombre,apellido,apodo,camada,posicion,plantel';
  const lines = jugadores.map((j) => {
    const plantel = jfMap.get(j.id) ?? '';
    const vals = [
      j.id,
      j.nombre,
      j.apellido,
      j.apodo ?? '',
      j.camada ?? '',
      j.posicion,
      plantel
    ];
    return vals.join(',');
  });
  const csv = [header, ...lines].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="convocados-fecha-${fechaId}.csv"`
    }
  });
};
