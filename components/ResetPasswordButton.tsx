'use client';

import { useState } from 'react';

interface Props {
  userId: number;
  nombre: string;
}

export default function ResetPasswordButton({ userId, nombre }: Props) {
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resetPassword = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/usuarios/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    setLoading(false);
    if (data.tempPassword) {
      setTempPassword(data.tempPassword);
    }
  };

  const copy = () => {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (tempPassword) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs bg-[#0d1f35] border border-[#c8a951] text-[#c8a951] px-2 py-1 rounded">
          {tempPassword}
        </span>
        <button
          onClick={copy}
          className="rounded border border-[#c8a951] text-[#f5f0e0] px-2 py-1 text-xs"
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    );
  }

  return (
    <button
      disabled={loading}
      onClick={resetPassword}
      className="rounded bg-[#0d1f35] border border-[#c8a951] text-[#f5f0e0] px-3 py-1 text-xs disabled:opacity-50"
    >
      {loading ? '...' : 'Reset pass'}
    </button>
  );
}
