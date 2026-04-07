"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface SidebarProps {
  isAdmin: boolean;
  onNavigate?: () => void;
}

const userLinks = [
  { href: "/equipo", label: "Mi equipo" },
  { href: "/ranking-fecha", label: "Ranking de la fecha" },
  { href: "/tabla-general", label: "Ranking de temporada" },
  { href: "/como-jugar", label: "¿Cómo jugar?" },
];

const adminLinks = [{ href: "/admin", label: "Admin" }];

export default function Sidebar({ isAdmin, onNavigate }: SidebarProps) {
  return (
    <aside className="w-60 bg-white border-r min-h-screen sticky top-0">
      <div className="p-4 border-b">
        <h1 className="text-lg font-semibold">Trico Fantasy</h1>
      </div>
      <nav className="p-4 space-y-6 text-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase text-gray-500">Jugador</p>
          {userLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded px-3 py-2 hover:bg-gray-100"
              onClick={onNavigate}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {isAdmin && (
          <div className="space-y-2">
            <p className="text-xs uppercase text-gray-500">Admin</p>
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded px-3 py-2 hover:bg-gray-100"
                onClick={onNavigate}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
      <div className="p-4 border-t">
        <LogoutButton />
      </div>
    </aside>
  );
}
