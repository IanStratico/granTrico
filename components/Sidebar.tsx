"use client";

import Link from "next/link";

interface SidebarProps {
  isAdmin: boolean;
  onNavigate?: () => void;
}

const userLinks = [
  { href: "/home", label: "Inicio" },
  { href: "/equipo", label: "Mi equipo" },
  { href: "/ranking-fecha", label: "Ranking de la fecha" },
  { href: "/ranking-jugadores", label: "Ranking de jugadores" },
  { href: "/tabla-general", label: "Ranking de temporada" },
  { href: "/como-jugar", label: "¿Cómo jugar?" },
];

const adminLinks = [{ href: "/admin", label: "Admin" }];

export default function Sidebar({ isAdmin, onNavigate }: SidebarProps) {
  return (
    <aside
      className="w-80 min-h-screen sticky top-0"
      style={{ background: "#1a3a6b", borderRight: "1px solid #c8a951" }}
    >
      <div className="p-4" style={{ borderBottom: "1px solid #c8a951" }}>
        <h1 className="text-lg font-bold" style={{ color: "#c8a951" }}>
          Trico Fantasy
        </h1>
      </div>
      <nav className="p-4 space-y-6 text-sm">
        <div className="space-y-2">
          <p
            className="text-xs uppercase"
            style={{ color: "#c8a951", opacity: 0.7 }}
          >
            Jugador
          </p>
          {userLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded px-3 py-2 text-white transition-colors"
              style={{}}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#1a6b3a";
                (e.currentTarget as HTMLElement).style.color = "#c8a951";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "";
                (e.currentTarget as HTMLElement).style.color = "white";
              }}
              onClick={onNavigate}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {isAdmin && (
          <div className="space-y-2">
            <p
              className="text-xs uppercase"
              style={{ color: "#c8a951", opacity: 0.7 }}
            >
              Admin
            </p>
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded px-3 py-2 text-white transition-colors"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#1a6b3a";
                  (e.currentTarget as HTMLElement).style.color = "#c8a951";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "";
                  (e.currentTarget as HTMLElement).style.color = "white";
                }}
                onClick={onNavigate}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
