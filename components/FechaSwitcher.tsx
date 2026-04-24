'use client';

import Link from 'next/link';

const estadoBadge: Record<string, { label: string; color: string }> = {
  PREVIA:    { label: 'Previa',    color: '#c8a951' },
  CERRADA:   { label: 'Cerrada',   color: 'rgba(245,240,224,0.5)' },
  PUNTUADA:  { label: 'Puntuada',  color: '#4ade80' },
};

interface Props {
  prevHref: string | null;
  nextHref: string | null;
  label: string;
  estado?: string;
}

export default function FechaSwitcher({ prevHref, nextHref, label, estado }: Props) {
  const btn = (href: string | null, symbol: string) =>
    href ? (
      <Link
        href={href}
        className="inline-flex items-center justify-center w-9 h-9 rounded text-sm"
        style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}
      >
        {symbol}
      </Link>
    ) : (
      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded text-sm"
        style={{ background: '#0d1f35', border: '1px solid #1a3a6b', color: 'rgba(245,240,224,0.4)' }}
      >
        {symbol}
      </span>
    );

  const badge = estado ? estadoBadge[estado] : null;

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-2">
        {btn(prevHref, '←')}
      </div>
      <div className="flex-1 text-center">
        <div className="font-semibold truncate" style={{ color: '#c8a951' }}>{label}</div>
        {badge && (
          <span className="text-xs" style={{ color: badge.color }}>{badge.label}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {btn(nextHref, '→')}
      </div>
    </div>
  );
}
