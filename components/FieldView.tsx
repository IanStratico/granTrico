'use client';

import PlayerCard from './PlayerCard';
import { Posicion } from '@prisma/client';

export interface FieldSlot {
  slot: number;
  player: {
    id: number;
    name: string;
    posicion: Posicion;
    isCapitan: boolean;
    score?: number | null;
    apodo?: string;
    plantel?: string;
    camada?: string;
  } | null;
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
                      apodo={p.apodo}
                      plantel={p.plantel}
                      camada={p.camada}
                    />
                  ) : (
                    <div
                      style={{
                        clipPath: "polygon(0% 12%, 12% 0%, 42% 0%, 50% 9%, 58% 0%, 88% 0%, 100% 12%, 100% 83%, 50% 100%, 0% 83%)",
                        width: 78,
                        height: 96,
                        background: 'rgba(255,255,255,0.5)',
                        border: '1px dashed #9ca3af',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 10,
                        color: '#9ca3af',
                        gap: 2,
                      }}
                      onClick={() => onSelectSlot(slot)}
                    >
                      <span>Vacío</span>
                      <span style={{ fontSize: 9 }}>#{slot}</span>
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
