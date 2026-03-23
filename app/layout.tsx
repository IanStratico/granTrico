import './globals.css';
import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import AppShell from '@/components/AppShell';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {session?.user ? (
          <AppShell isAdmin={session.user.isAdmin}>{children}</AppShell>
        ) : (
          <div className="min-h-screen">{children}</div>
        )}
      </body>
    </html>
  );
}
