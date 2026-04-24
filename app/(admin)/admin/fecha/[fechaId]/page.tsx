import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminFechaClient from "./AdminFechaClient";
import { getTemporadaActiva } from "@/lib/temporada";

interface Props {
  params: { fechaId: string };
}

export default async function AdminFechaPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    notFound();
  }

  const fechaId = Number(params.fechaId);
  const activa = await getTemporadaActiva();
  if (!activa) notFound();
  const fecha = await prisma.fecha.findFirst({
    where: { id: fechaId, temporadaId: activa.id },
    include: { temporada: true },
  });
  if (!fecha) notFound();

  const fechas = await prisma.fecha.findMany({
    where: { temporadaId: fecha.temporadaId },
    orderBy: { nro: "asc" },
  });
  const index = fechas.findIndex((f) => f.id === fecha.id);
  const prev = index > 0 ? fechas[index - 1] : null;
  const next =
    index >= 0 && index < fechas.length - 1 ? fechas[index + 1] : null;

  const convocados = await prisma.jugadorFecha.findMany({
    where: { fechaId: fecha.id },
    include: { jugador: true },
    orderBy: { jugador: { apellido: 'asc' } },
  });

  return (
    <AdminFechaClient
      fechaId={fecha.id}
      fechaNro={fecha.nro}
      fechaRival={fecha.rival}
      prevId={prev?.id ?? null}
      nextId={next?.id ?? null}
      estado={fecha.estado}
      userEmail={session.user.email ?? ""}
      userRole="admin"
      isAdmin={true}
      convocados={convocados.map((c) => ({
        jfId: c.id,
        jugadorId: c.jugadorId,
        nombre: c.jugador.nombre,
        apellido: c.jugador.apellido,
        apodo: c.jugador.apodo ?? '',
        camada: c.jugador.camada ?? null,
        posicion: c.jugador.posicion,
        plantel: c.plantel,
      }))}
    />
  );
}
