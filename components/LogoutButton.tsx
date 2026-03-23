'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full text-left rounded px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm"
    >
      Cerrar sesión
    </button>
  );
}
