'use client';

import { useState } from 'react';

interface Props {
  userId: number;
  isAdmin: boolean;
}

export default function RoleButton({ userId, isAdmin }: Props) {
  const [loading, setLoading] = useState(false);

  const updateRole = async (role: 'ADMIN' | 'USER') => {
    setLoading(true);
    await fetch('/api/admin/usuarios/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role })
    });
    setLoading(false);
    window.location.reload();
  };

  if (isAdmin) {
    return (
      <button
        disabled={loading}
        onClick={() => updateRole('USER')}
        className="rounded bg-[#0d1f35] border border-[#c8a951] text-[#f5f0e0] px-3 py-1 text-xs disabled:opacity-50"
      >
        Quitar admin
      </button>
    );
  }

  return (
    <button
      disabled={loading}
      onClick={() => updateRole('ADMIN')}
      className="rounded bg-[#1a6b3a] border border-[#c8a951] text-[#f5f0e0] px-3 py-1 text-xs disabled:opacity-50"
    >
      Hacer admin
    </button>
  );
}
