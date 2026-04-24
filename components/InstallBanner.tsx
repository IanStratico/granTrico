'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'grantrico_install_dismissed';

type Platform = 'android' | 'iphone' | null;

const steps: Record<'android' | 'iphone', { title: string; items: string[] }> = {
  android: {
    title: 'Instalar en Android',
    items: [
      'Abrí Chrome',
      'Tocá el menú ⋮ (tres puntos arriba a la derecha)',
      'Seleccioná "Agregar a pantalla de inicio"',
      'Confirmá tocando "Agregar"',
    ],
  },
  iphone: {
    title: 'Instalar en iPhone',
    items: [
      'Abrí Safari',
      'Tocá el botón compartir (cuadrado con flecha ↑ abajo)',
      'Deslizá y seleccioná "Agregar a pantalla de inicio"',
      'Tocá "Agregar"',
    ],
  },
};

export default function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <div
        className="rounded-lg px-4 py-3 flex items-start gap-3"
        style={{ background: '#1a3a6b', border: '1px solid #c8a951' }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#c8a951' }}>
            Instalá GranTrico en tu inicio
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,224,0.65)' }}>
            Accedé más rápido sin abrir el navegador
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setPlatform('android')}
              className="text-xs px-3 py-1.5 rounded"
              style={{ background: '#0d1f35', border: '1px solid #c8a951', color: '#f5f0e0' }}
            >
              Android
            </button>
            <button
              onClick={() => setPlatform('iphone')}
              className="text-xs px-3 py-1.5 rounded"
              style={{ background: '#0d1f35', border: '1px solid #c8a951', color: '#f5f0e0' }}
            >
              iPhone
            </button>
          </div>
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

      {platform && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setPlatform(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl p-5 space-y-4"
            style={{ background: '#0d1f35', border: '1px solid #c8a951' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-base" style={{ color: '#c8a951' }}>
                {steps[platform].title}
              </p>
              <button
                onClick={() => setPlatform(null)}
                className="text-xl leading-none"
                style={{ color: 'rgba(245,240,224,0.5)' }}
              >
                ×
              </button>
            </div>
            <ol className="space-y-3">
              {steps[platform].items.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: '#f5f0e0' }}>
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#c8a951' }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <button
              onClick={() => setPlatform(null)}
              className="w-full py-2.5 rounded text-sm font-semibold"
              style={{ background: '#1a6b3a', border: '1px solid #c8a951', color: '#f5f0e0' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
