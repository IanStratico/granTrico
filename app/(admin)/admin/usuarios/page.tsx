import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UsuariosClient from "@/components/UsuariosClient";

export default async function AdminUsuariosPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/login");

  const usuarios = await prisma.usuario.findMany({ orderBy: { id: "asc" } });

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold text-[#c8a951]">Usuarios</h1>
      <UsuariosClient usuarios={usuarios.map((u) => ({ id: u.id, nombre: u.nombre, email: u.email, isAdmin: u.isAdmin }))} />
    </main>
  );
}
