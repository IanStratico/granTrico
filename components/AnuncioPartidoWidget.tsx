'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'grantrico_anuncio_partido_cruzado_dismissed';

export default function AnuncioPartidoWidget({ rival }: { rival?: string | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <div
      className="rounded-lg px-4 py-3 flex items-start gap-3"
      style={{ background: '#1a3a6b', border: '1px solid #c8a951' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#c8a951' }}>
          🏉 Fecha especial: Pre C y Pre D{rival ? ` — vs ${rival}` : ''}
        </p>
        <p className="text-xs mt-1" style={{ color: '#f5f0e0' }}>
          Esta fecha Pre C y Pre D juegan contra el rival en el mismo torneo. ¡Vení a verlos!
        </p>
        <p className="text-xs mt-1 font-semibold" style={{ color: '#c8a951' }}>
          Sábado 6/6 · 12 hs · Cancha 1
        </p>
        <p className="text-xs mt-1.5" style={{ color: 'rgba(245,240,224,0.7)' }}>
          Recordá: esta fecha tenés que elegir <span style={{ color: '#f5f0e0', fontWeight: 600 }}>4 jugadores de Pre C y 4 de Pre D</span> obligatoriamente.
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Cerrar"
        className="flex-shrink-0 text-lg leading-none mt-0.5"
        style={{ color: 'rgba(245,240,224,0.5)' }}
      >
        ×
      </button>
    </div>
  );
}
