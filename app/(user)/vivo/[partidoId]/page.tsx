import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LiveFieldView from "./LiveFieldView";

interface Props {
  params: { partidoId: string };
}

export default async function VivoPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) notFound();

  const partidoId = Number(params.partidoId);
  if (!partidoId) notFound();

  const partido = await prisma.partido.findUnique({
    where: { id: partidoId },
    include: { fecha: true },
  });
  if (!partido) notFound();

  const jugadorFechas = await prisma.jugadorFecha.findMany({
    where: { fechaId: partido.fechaId, plantel: partido.plantel },
    include: { jugador: true },
    orderBy: { puntajeCalculado: 'desc' },
  });

  return (
    <LiveFieldView
      partidoId={partido.id}
      plantel={partido.plantel}
      fechaNro={partido.fecha.nro}
      rival={partido.fecha.rival}
      estado={partido.estado}
      jugadoresInit={jugadorFechas.map((jf) => ({
        jfId: jf.id,
        nombre: jf.jugador.nombre,
        apellido: jf.jugador.apellido,
        apodo: jf.jugador.apodo ?? null,
        posicion: jf.jugador.posicion,
        puntaje: jf.puntajeOverride ?? jf.puntajeCalculado,
      }))}
    />
  );
}
