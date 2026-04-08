'use client';

import Link from 'next/link';

interface Props {
  prevHref: string | null;
  nextHref: string | null;
  label: string;
}

export default function FechaSwitcher({ prevHref, nextHref, label }: Props) {
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

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-2">
        {btn(prevHref, '←')}
      </div>
      <div className="flex-1 text-center font-semibold truncate" style={{ color: '#c8a951' }}>{label}</div>
      <div className="flex items-center gap-2">
        {btn(nextHref, '→')}
      </div>
    </div>
  );
}
