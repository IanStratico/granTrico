'use client';

import { useState, useMemo } from 'react';
import RoleButton from './RoleButton';
import ResetPasswordButton from './ResetPasswordButton';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  isAdmin: boolean;
}

export default function UsuariosClient({ usuarios }: { usuarios: Usuario[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [usuarios, query]);

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o email..."
        className="w-full rounded px-3 py-2 text-sm outline-none"
        style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}
      />
      <div className="space-y-2">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="rounded border border-[#c8a951] bg-[#1a3a6b] px-3 py-2 text-sm space-y-2"
          >
            <div>
              <p className="font-semibold text-[#f5f0e0]">{u.nombre}</p>
              <p className="text-xs text-[#f5f0e0]/70">{u.email}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 rounded border border-[#c8a951] text-[#f5f0e0]">
                {u.isAdmin ? 'ADMIN' : 'USER'}
              </span>
              <ResetPasswordButton userId={u.id} nombre={u.nombre} />
              <RoleButton userId={u.id} isAdmin={u.isAdmin} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-center py-4 text-[#f5f0e0]/40">
            No se encontraron usuarios
          </p>
        )}
      </div>
    </div>
  );
}
