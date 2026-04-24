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

  const data = await prisma.jugadorFecha.findMany({
    where: { fechaId },
    include: { jugador: true },
    orderBy: { jugadorId: 'asc' }
  });

  const header = 'id,nombre,apellido,apodo,camada,posicion,tries,tackles,knock_ons,penales,amarillas,rojas,conversiones_metidas,conversiones_erradas,penales_metidos,penales_errados';
  const lines = data.map((jf) =>
    [
      jf.jugadorId,
      jf.jugador.nombre,
      jf.jugador.apellido,
      jf.jugador.apodo ?? '',
      jf.jugador.camada ?? '',
      jf.jugador.posicion,
      jf.tries ?? 0,
      jf.tackles ?? 0,
      jf.knockOns ?? 0,
      jf.penales ?? 0,
      jf.amarillas ?? 0,
      jf.rojas ?? 0,
      jf.conversionesMetidas ?? 0,
      jf.conversionesErradas ?? 0,
      jf.penalesMetidos ?? 0,
      jf.penalesErrados ?? 0,
    ].join(',')
  );
  const csv = [header, ...lines].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="puntajes-fecha-${fechaId}.csv"`
    }
  });
};
