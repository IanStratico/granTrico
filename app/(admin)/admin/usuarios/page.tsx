import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import RoleButton from "@/components/RoleButton";
import ResetPasswordButton from "@/components/ResetPasswordButton";

export default async function AdminUsuariosPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/login");

  const usuarios = await prisma.usuario.findMany({ orderBy: { id: "asc" } });

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold text-[#c8a951]">Usuarios</h1>
      <div className="space-y-2">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="rounded border border-[#c8a951] bg-[#1a3a6b] px-3 py-2 text-sm flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-[#f5f0e0]">{u.nombre}</p>
              <p className="text-xs text-[#f5f0e0]">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded border border-[#c8a951] text-[#f5f0e0]">
                {u.isAdmin ? "ADMIN" : "USER"}
              </span>
              <ResetPasswordButton userId={u.id} nombre={u.nombre} />
              <RoleButton userId={u.id} isAdmin={u.isAdmin} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
