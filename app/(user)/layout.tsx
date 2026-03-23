import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-4">
      {/* <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Fantasy Rugby</h1>
        <span className="text-sm text-gray-500">Sesión: {session.user.email}</span>
      </header> */}
      {children}
    </div>
  );
}
