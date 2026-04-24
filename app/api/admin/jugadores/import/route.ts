import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseCsv } from '@/lib/csv';

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
  }
  const text = await file.text();
  const rows = parseCsv(text);

  let procesados = 0;
  const errores: { fila: number; error: string }[] = [];

  let fila = 2;
  for (const row of rows) {
    console.log(row);
    let nombre: any;
    let apellido: any;
    let apodo: any;
    let camada: any;
    let posicion: any;

    if (Array.isArray(row)) {
      [nombre, apellido, apodo, camada, posicion] = row;
    } else {
      nombre = row['nombre'] ?? row['Nombre'];
      apellido = row['apellido'] ?? row['Apellido'];
      apodo = row['apodo'] ?? row['Apodo'];
      camada = row['camada'] ?? row['Camada'];
      posicion = row['posicion'] ?? row['Posicion'];
    }

    nombre = nombre?.toString().trim();
    apellido = apellido?.toString().trim();
    apodo = apodo ? apodo.toString().trim() : null;
    posicion = posicion?.toString().trim().toUpperCase() as string | undefined;
    const camadaNum = camada !== undefined && camada !== null && camada !== '' ? Number(camada) : null;

    if (!nombre || !apellido || !camadaNum || !posicion) {
      errores.push({ fila, error: 'Datos incompletos' });
      fila++;
      continue;
    }
    try {
      await prisma.jugador.create({
        data: {
          nombre,
          apellido,
          apodo,
          camada: camadaNum,
          posicion
        }
      });
      procesados++;
    } catch (error: any) {
      console.error(error);
      errores.push({ fila, error: error?.message || 'Error desconocido' });
    }
    fila++;
  }

  return NextResponse.json({ procesados, errores });
};
