import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user || !session.user.isAdmin) {
    redirect("/login");
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        {/* <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Panel Admin</h1>
          <a href="/admin" className="text-sm text-blue-700 underline">
            Admin
          </a>
        </div>
        <span className="text-sm text-gray-500">Sesión: {session.user.email}</span> */}
      </header>
      {children}
    </div>
  );
}
