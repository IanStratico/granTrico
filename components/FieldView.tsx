'use client';

import PlayerCard from './PlayerCard';
import { Posicion } from '@prisma/client';

export interface FieldSlot {
  slot: number;
  player: { id: number; name: string; posicion: Posicion; isCapitan: boolean; score?: number | null } | null;
}

interface Props {
  slots: FieldSlot[];
  onSelectSlot: (slot: number) => void;
  onSetCapitan: (playerId: number) => void;
  readonly?: boolean;
}

const rows = [
  [1, 2, 3],
  [4, 5],
  [6, 8, 7],
  [9, 10],
  [12, 13],
  [11, 15, 14]
];

export default function FieldView({
  slots,
  onSelectSlot,
  onSetCapitan,
  readonly,
}: Props) {
  const bySlot = Object.fromEntries(slots.map((s) => [s.slot, s.player]));

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-b from-green-50 to-green-100 rounded-lg p-3 border">
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.join('-')} className="flex justify-center gap-2">
            {row.map((slot) => {
              const p = bySlot[slot];
              return (
                <div key={slot} className="w-[78px]">
                  {p ? (
                    <PlayerCard
                      name={p.name}
                      posicion={p.posicion}
                      isCapitan={p.isCapitan}
                      slot={slot}
                      onClick={() => onSelectSlot(slot)}
                      onSetCapitan={readonly ? undefined : () => onSetCapitan(p.id)}
                      score={p.score ?? null}
                      readonly={readonly}
                    />
                  ) : (
                    <div
                      className="h-[70px] rounded border border-dashed flex flex-col items-center justify-center text-[11px] text-gray-400 bg-white/60 cursor-pointer hover:border-blue-300"
                      onClick={() => onSelectSlot(slot)}
                    >
                      Vacío
                      <div className="text-[10px] text-gray-400">#{slot}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
