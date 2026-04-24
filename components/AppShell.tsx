'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { signOut } from 'next-auth/react';

interface Props {
  isAdmin: boolean;
  children: React.ReactNode;
}

const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <polyline points="9 21 9 12 15 12 15 21"/>
  </svg>
);

const IconEquipo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 3c2.5 2 4 5 4 9s-1.5 7-4 9"/>
    <path d="M12 3c-2.5 2-4 5-4 9s1.5 7 4 9"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
  </svg>
);

const IconRanking = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21V10M12 21V3M16 21v-7"/>
  </svg>
);

const IconTemporada = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const tabLinks = [
  { href: '/home',          label: 'Inicio',    Icon: IconHome },
  { href: '/equipo',        label: 'Mi equipo', Icon: IconEquipo },
  { href: '/ranking-fecha', label: 'Rankings',  Icon: IconRanking },
  { href: '/tabla-general', label: 'Temporada', Icon: IconTemporada },
];

export default function AppShell({ isAdmin, children }: Props) {
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

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
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 z-30 border-b" style={{ background: 'linear-gradient(to right, #1a6b3a, #1a3a6b)', borderBottomColor: '#c8a951', paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="w-9" />
          <div className="text-base font-semibold" style={{ color: '#c8a951' }}>Trico Fantasy</div>
          <div className="relative" ref={userRef}>
            <button
              className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white"
              style={{ border: '1px solid #c8a951', background: 'transparent' }}
              onClick={() => setUserOpen((v) => !v)}
              aria-label="Usuario"
            >
              👤
            </button>
            {userOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded shadow-lg text-sm z-50" style={{ background: '#1a3a6b', border: '1px solid #c8a951' }}>
                <button
                  className="w-full text-left px-3 py-2 text-white transition-colors"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1a6b3a'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
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

      {/* Mobile tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden flex" style={{ background: '#1a3a6b', borderTop: '2px solid #c8a951' }}>
        {tabLinks.map((tab) => {
          const active = pathname === tab.href || (tab.href !== '/home' && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center py-2 text-xs transition-transform active:scale-95"
              style={{ color: active ? '#c8a951' : 'rgba(255,255,255,0.55)' }}
            >
              <tab.Icon />
              <span className="mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 w-full pt-14 pb-16 md:pb-0 px-3 md:px-6">{children}</main>
    </div>
  );
}
