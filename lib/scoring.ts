import { prisma } from './prisma';
import { playerScoreFromStats } from './validation';

export async function recalculateFechaScores(fechaId: number) {
  const jugadorFechas = await prisma.jugadorFecha.findMany({
    where: { fechaId },
    include: { jugador: true }
  });

  // Update puntaje_calculado
  for (const jf of jugadorFechas) {
    const calculado = playerScoreFromStats(jf);
    if (jf.puntajeOverride === null || jf.puntajeOverride === undefined) {
      await prisma.jugadorFecha.update({
        where: { id: jf.id },
        data: { puntajeCalculado: calculado }
      });
    } else {
      await prisma.jugadorFecha.update({
        where: { id: jf.id },
        data: { puntajeCalculado: calculado } // keep calculated stored even if override exists
      });
    }
  }

  // Team scores
  const equipoFechas = await prisma.equipoFecha.findMany({
    where: { fechaId },
    include: {
      jugadores: true,
      equipo: true
    }
  });

  for (const ef of equipoFechas) {
    const rosterScores = await prisma.jugadorFecha.findMany({
      where: { fechaId, jugadorId: { in: ef.jugadores.map((j) => j.jugadorId) } }
    });

    const totalSinCapitan = rosterScores.reduce((acc, jf) => {
      const base = jf.puntajeOverride ?? jf.puntajeCalculado;
      return acc + base;
    }, 0);

    let capitanScore = 0;
    if (ef.capitanJugadorId) {
      const cap = rosterScores.find((jf) => jf.jugadorId === ef.capitanJugadorId);
      if (cap) {
        capitanScore = cap.puntajeOverride ?? cap.puntajeCalculado;
      }
    }

    let pateadorKickingScore = 0;
    if (ef.pateadorJugadorId) {
      const pat = rosterScores.find((jf) => jf.jugadorId === ef.pateadorJugadorId);
      if (pat) {
        pateadorKickingScore =
          pat.conversionesMetidas * 1 -
          pat.conversionesErradas * 1 +
          pat.penalesMetidos * 2 -
          pat.penalesErrados * 2;
      }
    }

    const total = totalSinCapitan + (capitanScore || 0) + pateadorKickingScore;

    await prisma.equipoFecha.update({
      where: { id: ef.id },
      data: { puntajeTotal: total }
    });
  }
}
