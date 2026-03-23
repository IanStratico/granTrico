'use client';

import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import { signOut } from 'next-auth/react';

interface Props {
  isAdmin: boolean;
  children: React.ReactNode;
}

export default function AppShell({ isAdmin, children }: Props) {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Topbar global (mobile y desktop) */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded border bg-white shadow-sm text-sm"
            onClick={() => setOpen(true)}
            aria-label="Menu"
          >
            ☰
          </button>
          <div className="text-base font-semibold">Trico Fantasy</div>
          <div className="relative" ref={userRef}>
            <button
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border bg-white shadow-sm"
              onClick={() => setUserOpen((v) => !v)}
              aria-label="Usuario"
            >
              👤
            </button>
            {userOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded border bg-white shadow-lg text-sm z-50">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block pt-14">
        <Sidebar isAdmin={isAdmin} />
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-4/5 max-w-xs bg-white shadow-lg">
            <Sidebar isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setOpen(false)} />
        </div>
      )}

      <main className="flex-1 w-full pt-14 md:pt-0 px-3 md:px-6">{children}</main>
    </div>
  );
}
