'use client';

import { useState } from 'react';
import Link from 'next/link';
import RankingLayout from '@/components/RankingLayout';

interface Props {
  fechaId: number;
  fechaNro: number;
  prevId: number | null;
  nextId: number | null;
  estado: string;
  userEmail: string;
  userRole: 'admin' | 'user';
  isAdmin: boolean;
}

export default function AdminFechaClient({
  fechaId,
  fechaNro,
  prevId,
  nextId,
  estado,
  userEmail,
  userRole,
  isAdmin
}: Props) {
  const [changing, setChanging] = useState(false);
  const [currentEstado, setCurrentEstado] = useState(estado);
  const [error, setError] = useState<string | null>(null);

  const nextEstado =
    currentEstado === 'PREVIA' ? 'CERRADA' : currentEstado === 'CERRADA' ? 'PUNTUADA' : null;

  const estadoLabel = currentEstado;

  const changeEstado = async () => {
    if (!nextEstado) return;
    const confirmMsg =
      nextEstado === 'CERRADA'
        ? '¿Seguro que querés cerrar la fecha?'
        : '¿Seguro que querés marcar la fecha como puntuada?';
    if (!window.confirm(confirmMsg)) return;
    setChanging(true);
    setError(null);
    const res = await fetch('/api/admin/fecha/estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaId, estado: nextEstado })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || 'Error al actualizar');
      setChanging(false);
      return;
    }
    setCurrentEstado(nextEstado);
    setChanging(false);
  };

  return (
    <RankingLayout
      isAdmin={isAdmin}
      userEmail={userEmail}
      userRole={userRole}
      headerLeft={
        prevId ? (
          <Link
            href={`/admin/fecha/${prevId}`}
            className="inline-flex items-center justify-center w-9 h-9 rounded border bg-white shadow-sm text-sm"
          >
            ←
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center w-9 h-9 rounded border bg-gray-100 text-gray-400 text-sm">
            ←
          </span>
        )
      }
      headerCenter={`Admin – Fecha ${fechaNro}`}
      headerRight={
        nextId ? (
          <Link
            href={`/admin/fecha/${nextId}`}
            className="inline-flex items-center justify-center w-9 h-9 rounded border bg-white shadow-sm text-sm"
          >
            →
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center w-9 h-9 rounded border bg-gray-100 text-gray-400 text-sm">
            →
          </span>
        )
      }
    >
      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Estado de la fecha</h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded border bg-white shadow-sm">Estado: {estadoLabel}</span>
            {nextEstado && (
              <button
                className="rounded bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-50"
                disabled={changing}
                onClick={changeEstado}
              >
                {changing ? 'Actualizando...' : nextEstado === 'CERRADA' ? 'Cerrar fecha' : 'Marcar puntuada'}
              </button>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Convocados</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href={`/api/admin/convocados/export?fechaId=${fechaId}`}
              className="rounded border px-3 py-2 bg-white hover:bg-gray-50"
            >
              Exportar convocados
            </Link>
            <form
              action={`/api/admin/convocados/import`}
              method="post"
              encType="multipart/form-data"
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="fechaId" value={fechaId} />
              <input type="file" name="file" accept=".csv" required className="text-sm" />
              <button className="rounded bg-blue-600 text-white px-3 py-2">Importar convocados</button>
            </form>
          </div>
          <p className="text-xs text-gray-500">Lee columnas: id, plantel (ignora el resto)</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Puntajes</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href={`/api/admin/puntajes/export?fechaId=${fechaId}`}
              className="rounded border px-3 py-2 bg-white hover:bg-gray-50"
            >
              Exportar puntajes
            </Link>
            <form
              action={`/api/admin/puntajes/import`}
              method="post"
              encType="multipart/form-data"
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="fechaId" value={fechaId} />
              <input type="file" name="file" accept=".csv" required className="text-sm" />
              <button className="rounded bg-blue-600 text-white px-3 py-2">Importar puntajes</button>
            </form>
          </div>
          <p className="text-xs text-gray-500">
            Lee columnas: id, tries, tackles, knock_ons, penales, amarillas, rojas (ignora el resto)
          </p>
        </section>
      </div>
    </RankingLayout>
  );
}
