import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import RoleButton from "@/components/RoleButton";

export default async function AdminUsuariosPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/login");

  const usuarios = await prisma.usuario.findMany({ orderBy: { id: "asc" } });

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <div className="space-y-2">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="rounded border bg-white px-3 py-2 text-sm flex items-center justify-between"
          >
            <div>
              <p className="font-semibold">{u.nombre}</p>
              <p className="text-xs text-gray-600">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded border">
                {u.isAdmin ? "ADMIN" : "USER"}
              </span>
              <RoleButton userId={u.id} isAdmin={u.isAdmin} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
