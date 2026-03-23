'use client';

import { Posicion } from '@prisma/client';

interface Props {
  name: string;
  posicion: Posicion;
  isCapitan?: boolean;
  slot?: number;
  onClick?: () => void;
  onSetCapitan?: () => void;
  score?: number | null;
  readonly?: boolean;
}

const compactName = (name: string) => {
  if (name.length <= 18) return name;
  return name.slice(0, 16) + '…';
};

export default function PlayerCard({
  name,
  posicion,
  isCapitan,
  slot,
  onClick,
  onSetCapitan,
  score,
  readonly,
}: Props) {
  const displayName = compactName(name);

  return (
    <div
      className={`rounded border px-2 py-1.5 bg-white text-center text-xs leading-snug space-y-1 shadow-sm ${
        isCapitan ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
      } ${onClick ? 'cursor-pointer hover:border-blue-300 transition-all duration-200' : ''}`}
      onClick={() => {
        onClick?.();
      }}
    >
      <div className="flex items-center justify-center gap-1 font-semibold">
        {slot && <span className="text-[10px] text-gray-500">#{slot}</span>}
        <span className="truncate">{displayName}</span>
        {isCapitan && <span className="text-amber-500" aria-label="Capitán">⭐</span>}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-gray-500">
        {posicion === 'FORWARD' ? 'FW' : 'BK'}
      </div>
      {typeof score === 'number' && (
        <div className="text-[11px] font-semibold text-gray-800">
          {score} pts {isCapitan && <span className="text-amber-600">(x2)</span>}
        </div>
      )}
      {onSetCapitan && (
        <button
          type="button"
          className="text-[10px] text-amber-600 underline"
          onClick={(e) => {
            e.stopPropagation();
            onSetCapitan();
          }}
        >
          Hacer capitán
        </button>
      )}
    </div>
  );
}
