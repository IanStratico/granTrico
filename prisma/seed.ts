import { PrismaClient, Plantel, EstadoFecha } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Reset tables (simple for dev; assumes Postgres with cascades)
  await prisma.equipoFechaJugador.deleteMany();
  await prisma.equipoFecha.deleteMany();
  await prisma.equipo.deleteMany();
  await prisma.jugadorFecha.deleteMany();
  await prisma.fecha.deleteMany();
  await prisma.jugador.deleteMany();
  await prisma.temporada.deleteMany();
  await prisma.usuario.deleteMany();

  const password = await bcrypt.hash('password', 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Admin',
      email: 'admin@example.com',
      passwordHash: password,
      isAdmin: true
    }
  });

  const user = await prisma.usuario.create({
    data: {
      nombre: 'Usuario',
      email: 'user@example.com',
      passwordHash: password,
      isAdmin: false
    }
  });

  const temporada = await prisma.temporada.create({
    data: {
      nombre: 'Temporada 2024',
      activa: true,
      fechaInicio: new Date('2024-03-01'),
      fechaFin: new Date('2024-09-30')
    }
  });

  const fechas = await prisma.fecha.createMany({
    data: [
      { temporadaId: temporada.id, nro: 1, rival: 'Rival 1', estado: EstadoFecha.PREVIA },
      { temporadaId: temporada.id, nro: 2, rival: 'Rival 2', estado: EstadoFecha.PREVIA }
    ]
  });

  const posiciones = [
    'PILAR', 'PILAR', 'PILAR',
    'HOOKER', 'HOOKER',
    'SEGUNDA_LINEA', 'SEGUNDA_LINEA',
    'TERCERA_LINEA', 'TERCERA_LINEA', 'TERCERA_LINEA',
    'MEDIO_SCRUM', 'MEDIO_SCRUM',
    'APERTURA', 'APERTURA',
    'CENTRO', 'CENTRO',
    'WING', 'WING',
    'FULLBACK', 'FULLBACK',
  ] as const;

  const jugadores = await prisma.jugador.createMany({
    data: posiciones.map((posicion, i) => ({
      nombre: `Jugador${i + 1}`,
      apellido: `Apellido${i + 1}`,
      apodo: `J${i + 1}`,
      camada: 2010 + (i % 10),
      posicion,
      activo: true
    }))
  });

  const fecha1 = await prisma.fecha.findFirstOrThrow({ where: { temporadaId: temporada.id, nro: 1 } });

  const jugadoresCreados = await prisma.jugador.findMany();

  await prisma.jugadorFecha.createMany({
    data: jugadoresCreados.slice(0, 18).map((j, idx) => ({
      jugadorId: j.id,
      fechaId: fecha1.id,
      plantel: idx % 3 === 0 ? Plantel.PRIMERA : Plantel.PRE_A
    }))
  });

  // Equipo y equipo_fecha del usuario para probar ranking
  const equipo = await prisma.equipo.create({
    data: {
      usuarioId: user.id,
      temporadaId: temporada.id,
      nombre: 'Equipo Usuario'
    }
  });

  const equipoFecha = await prisma.equipoFecha.create({
    data: {
      equipoId: equipo.id,
      fechaId: fecha1.id,
      capitanJugadorId: jugadoresCreados[0].id,
      puntajeTotal: 0
    }
  });

  await prisma.equipoFechaJugador.createMany({
    data: jugadoresCreados.slice(0, 15).map((j) => ({
      equipoFechaId: equipoFecha.id,
      jugadorId: j.id
    }))
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
