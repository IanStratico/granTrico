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
        className="inline-flex items-center justify-center w-9 h-9 rounded border bg-white shadow-sm text-sm"
      >
        {symbol}
      </Link>
    ) : (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded border bg-gray-100 text-gray-400 text-sm">
        {symbol}
      </span>
    );

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-2">
        {btn(prevHref, '←')}
      </div>
      <div className="flex-1 text-center font-semibold truncate">{label}</div>
      <div className="flex items-center gap-2">
        {btn(nextHref, '→')}
      </div>
    </div>
  );
}
