import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const nombre = body?.nombre as string | undefined;
  if (!nombre)
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  try {
    await prisma.temporada.create({
      data: {
        nombre,
        activa: false,
        fechaInicio: new Date(),
        fechaFin: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "No se pudo crear la temporada" },
      { status: 500 },
    );
  }
};
