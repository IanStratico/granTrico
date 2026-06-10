import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const confirm = process.argv.includes('--confirm');

async function main() {
  const temporada = await prisma.temporada.findFirst({ where: { activa: true } });
  if (!temporada) {
    console.error('No hay temporada activa.');
    process.exit(1);
  }

  const fecha = await prisma.fecha.findFirst({
    where: { temporadaId: temporada.id, rival: 'San Patricio' },
    orderBy: { nro: 'desc' },
  });

  if (!fecha) {
    console.error(`No se encontró ninguna fecha vs 'San Patricio' en la temporada activa (${temporada.nombre}).`);
    process.exit(1);
  }

  const [anotaciones, partidos, jugadoresConPuntaje, equiposConPuntaje, asignaciones] = await Promise.all([
    prisma.anotacion.count({ where: { partido: { fechaId: fecha.id } } }),
    prisma.partido.count({ where: { fechaId: fecha.id } }),
    prisma.jugadorFecha.count({ where: { fechaId: fecha.id, puntajeCalculado: { gt: 0 } } }),
    prisma.equipoFecha.count({ where: { fechaId: fecha.id, puntajeTotal: { gt: 0 } } }),
    prisma.anotadorAsignacion.count({ where: { fechaId: fecha.id } }),
  ]);

  console.log('\n=== DRY RUN — Fecha a limpiar ===');
  console.log(`  ID:       ${fecha.id}`);
  console.log(`  Nro:      #${fecha.nro}`);
  console.log(`  Rival:    ${fecha.rival}`);
  console.log(`  Estado:   ${fecha.estado}`);
  console.log(`  Temporada: ${temporada.nombre}`);
  console.log('\n  Registros que se van a borrar / resetear:');
  console.log(`  - Anotaciones:              ${anotaciones} (DELETE)`);
  console.log(`  - Partidos:                 ${partidos} (DELETE)`);
  console.log(`  - AnotadorAsignaciones:     ${asignaciones} (DELETE)`);
  console.log(`  - JugadorFecha con pts > 0: ${jugadoresConPuntaje} (reset a 0)`);
  console.log(`  - EquipoFecha con pts > 0:  ${equiposConPuntaje} (reset a 0)`);
  console.log(`\n  Estado final de la Fecha: CERRADA`);

  if (!confirm) {
    console.log('\n⚠️  Modo dry-run. Agregá --confirm para ejecutar.\n');
    await prisma.$disconnect();
    return;
  }

  console.log('\n⚡ Ejecutando...');

  await prisma.$transaction([
    prisma.anotacion.deleteMany({ where: { partido: { fechaId: fecha.id } } }),
    prisma.partido.deleteMany({ where: { fechaId: fecha.id } }),
    prisma.anotadorAsignacion.deleteMany({ where: { fechaId: fecha.id } }),
    prisma.jugadorFecha.updateMany({
      where: { fechaId: fecha.id },
      data: {
        tries: 0,
        tackles: 0,
        knockOns: 0,
        penales: 0,
        amarillas: 0,
        rojas: 0,
        conversionesMetidas: 0,
        conversionesErradas: 0,
        penalesMetidos: 0,
        penalesErrados: 0,
        puntajeCalculado: 0,
        puntajeOverride: null,
      },
    }),
    prisma.equipoFecha.updateMany({
      where: { fechaId: fecha.id },
      data: { puntajeTotal: 0 },
    }),
    prisma.fecha.update({
      where: { id: fecha.id },
      data: { estado: 'CERRADA' },
    }),
  ]);

  console.log('✅ Listo. Fecha limpiada y dejada en estado CERRADA.\n');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
