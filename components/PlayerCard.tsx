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
  apodo?: string;
  plantel?: string;
  camada?: string;
}

const SHIELD_CLIP = "polygon(0% 12%, 12% 0%, 42% 0%, 50% 9%, 58% 0%, 88% 0%, 100% 12%, 100% 83%, 50% 100%, 0% 83%)";

const initials = (text: string) =>
  text
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

const abrevPlantel: Record<string, string> = {
  PRIMERA: '1ra',
  INTER: 'INT',
  PRE_A: 'PA',
  PRE_B: 'PB',
  PRE_C: 'PC',
  PRE_D: 'PD',
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
  apodo,
  plantel,
  camada,
}: Props) {
  const displayName = apodo || name.split(',')[0]?.trim() || name;
  const posLabel = posicion === 'FORWARD' ? 'FWD' : 'BCK';
  const plantelLabel = plantel ? (abrevPlantel[plantel] ?? plantel) : null;

  return (
    <div style={{ width: 78, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* Shield card */}
      <div
        style={{
          clipPath: SHIELD_CLIP,
          background: 'linear-gradient(to right, #1a6b3a 33%, #f5f0e0 33% 66%, #1a3a6b 66%)',
          boxShadow: isCapitan ? '0 0 0 2px #f59e0b, 0 0 8px 2px #c8a95180' : '0 0 0 2px #c8a951',
          width: 78,
          height: 96,
          position: 'relative',
          cursor: onClick ? 'pointer' : 'default',
          flexShrink: 0,
        }}
        onClick={onClick}
      >
        {/* Slot number — top left over green */}
        {slot !== undefined && (
          <span style={{
            position: 'absolute', top: 8, left: 7,
            color: '#c8a951', fontSize: 11, fontWeight: 700, lineHeight: 1,
          }}>
            #{slot}
          </span>
        )}

        {/* Captain star — top right over blue */}
        {isCapitan && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            fontSize: 11, lineHeight: 1,
          }}>
            ⭐
          </span>
        )}

        {/* Avatar circle — high up */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 36, height: 36, borderRadius: '50%',
          background: '#fff', border: '2px solid #c8a951',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#1a3a6b',
          userSelect: 'none',
        }}>
          {initials(displayName)}
        </div>

        {/* Bottom info */}
        <div style={{
          position: 'absolute', bottom: 7, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        }}>
          {/* Name — full width gold background */}
          <span style={{
            fontSize: 9, fontWeight: 700, color: '#000',
            width: '100%', textAlign: 'center',
            background: '#c8a951',
            padding: '1px 0',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {displayName}
          </span>

          <div style={{ display: 'flex', gap: 2 }}>
            <span style={{
              background: '#c8a951', color: '#000', fontSize: 8, fontWeight: 700,
              borderRadius: 3, padding: '1px 3px', lineHeight: 1.4,
            }}>
              {posLabel}
            </span>
            {plantelLabel && (
              <span style={{
                background: '#c8a951', color: '#000', fontSize: 8, fontWeight: 700,
                borderRadius: 3, padding: '1px 3px', lineHeight: 1.4,
              }}>
                {plantelLabel}
              </span>
            )}
          </div>

          {typeof score === 'number' ? (
            <span style={{
              background: '#c8a951', color: '#000', fontSize: 8, fontWeight: 800,
              borderRadius: 3, padding: '1px 5px', lineHeight: 1.4,
            }}>
              {score} pts{isCapitan ? ' ×2' : ''}
            </span>
          ) : camada ? (
            <span style={{
              background: '#c8a951', color: '#000', fontSize: 8, fontWeight: 700,
              borderRadius: 3, padding: '1px 5px', lineHeight: 1.4,
            }}>
              {camada}
            </span>
          ) : null}
        </div>
      </div>

    </div>
  );
}
