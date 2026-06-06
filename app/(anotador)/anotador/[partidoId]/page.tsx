import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertAnotadorAutorizado } from "@/lib/anotador";
import AnotadorClient from "./AnotadorClient";

interface Props {
  params: { partidoId: string };
}

export default async function AnotadorPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) notFound();

  const partidoId = Number(params.partidoId);
  if (!partidoId) notFound();

  const ctx = await assertAnotadorAutorizado(partidoId, Number(session.user.id));
  if (!ctx) notFound();

  const { partido } = ctx;

  const convocados = await prisma.jugadorFecha.findMany({
    where: { fechaId: partido.fechaId, plantel: partido.plantel },
    include: { jugador: true },
    orderBy: { jugador: { apellido: "asc" } },
  });

  return (
    <AnotadorClient
      partido={{
        id: partido.id,
        fechaId: partido.fechaId,
        plantel: partido.plantel,
        estado: partido.estado,
        iniciadoAt: partido.iniciadoAt?.toISOString() ?? null,
        finalizadoAt: partido.finalizadoAt?.toISOString() ?? null,
      }}
      fecha={{
        nro: partido.fecha.nro,
        rival: partido.fecha.rival,
      }}
      convocados={convocados.map((jf) => ({
        jfId: jf.id,
        jugadorId: jf.jugador.id,
        nombre: jf.jugador.nombre,
        apellido: jf.jugador.apellido,
        apodo: jf.jugador.apodo ?? null,
        posicion: jf.jugador.posicion,
        puntajeCalculado: jf.puntajeCalculado,
      }))}
    />
  );
}
