"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import RankingLayout from "@/components/RankingLayout";
import FechaSwitcher from "@/components/FechaSwitcher";
import ImportButton from "@/components/ImportButton";
import { labelPosicion } from "@/lib/constants";

interface Convocado {
  jfId: number;
  jugadorId: number;
  nombre: string;
  apellido: string;
  apodo: string;
  camada: number | null;
  posicion: string;
  plantel: string;
}

interface Props {
  fechaId: number;
  fechaNro: number;
  fechaRival: string;
  prevId: number | null;
  nextId: number | null;
  estado: string;
  userEmail: string;
  userRole: "admin" | "user";
  isAdmin: boolean;
  convocados: Convocado[];
}

const PLANTELES = ['PRIMERA', 'INTER', 'PRE_A', 'PRE_B', 'PRE_C', 'PRE_D'];
const POSICIONES = ['FORWARD', 'BACK', 'PILAR', 'HOOKER', 'SEGUNDA_LINEA', 'TERCERA_LINEA', 'MEDIO_SCRUM', 'APERTURA', 'CENTRO', 'WING', 'FULLBACK'];

export default function AdminFechaClient({
  fechaId,
  fechaNro,
  fechaRival,
  prevId,
  nextId,
  estado,
  userEmail,
  userRole,
  isAdmin,
  convocados: initialConvocados,
}: Props) {
  const [changing, setChanging] = useState(false);
  const [currentEstado, setCurrentEstado] = useState(estado);
  const [error, setError] = useState<string | null>(null);

  const [convocados, setConvocados] = useState<Convocado[]>(initialConvocados);
  const [query, setQuery] = useState('');
  const [editTarget, setEditTarget] = useState<Convocado | null>(null);
  const [editForm, setEditForm] = useState<Partial<Convocado>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return convocados.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.apellido.toLowerCase().includes(q) ||
        c.apodo.toLowerCase().includes(q)
    );
  }, [convocados, query]);

  const openEdit = (c: Convocado) => {
    setEditTarget(c);
    setEditForm({ ...c });
    setSaveError(null);
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    setSaveError(null);
    const res = await fetch(`/api/admin/jugador-fecha/${editTarget.jfId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setSaveError(body.error || 'Error al guardar');
      setSaving(false);
      return;
    }
    setConvocados((prev) =>
      prev.map((c) => (c.jfId === editTarget.jfId ? { ...c, ...editForm } as Convocado : c))
    );
    setEditTarget(null);
    setSaving(false);
  };

  const estadoLabel = currentEstado;

  const changeEstado = async (target: "PREVIA" | "CERRADA" | "PUNTUADA") => {
    const confirmMsg = `¿Seguro que querés cambiar el estado de la fecha a ${target}?`;
    if (!window.confirm(confirmMsg)) return;
    setChanging(true);
    setError(null);
    const res = await fetch("/api/admin/fechas/update-estado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fechaId, estado: target }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Error al actualizar");
      setChanging(false);
      return;
    }
    setCurrentEstado(target);
    setChanging(false);
  };

  return (
    <RankingLayout isAdmin={isAdmin} userEmail={userEmail} userRole={userRole}>
      <div className="space-y-4">
        <FechaSwitcher
          prevHref={prevId ? `/admin/fecha/${prevId}` : null}
          nextHref={nextId ? `/admin/fecha/${nextId}` : null}
          label={`Fecha ${fechaNro} - ${fechaRival}`}
        />
        <div className="text-xl font-semibold text-[#c8a951]">Admin</div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-[#c8a951]">Estado de la fecha</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded border border-[#c8a951] bg-[#1a3a6b] text-[#f5f0e0] shadow-sm">
              Estado: {estadoLabel}
            </span>
            {(["PREVIA", "CERRADA", "PUNTUADA"] as const).map((estadoBtn) => (
              <button
                key={estadoBtn}
                className={`rounded px-3 py-2 text-sm border border-[#c8a951] ${
                  estadoBtn === currentEstado
                    ? "bg-[#0d1f35] text-[#f5f0e0]/40 cursor-not-allowed"
                    : "bg-[#1a6b3a] text-[#f5f0e0]"
                }`}
                disabled={estadoBtn === currentEstado || changing}
                onClick={() => changeEstado(estadoBtn)}
              >
                {estadoBtn}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-[#c8a951]">Convocados</h2>
          <div className="flex flex-wrap gap-3 text-sm items-start">
            <Link
              href={`/api/admin/convocados/export?fechaId=${fechaId}`}
              className="rounded border border-[#c8a951] px-3 py-2 bg-[#1a3a6b] text-[#f5f0e0] hover:bg-[#1a6b3a]"
            >
              Exportar convocados
            </Link>
            <ImportButton
              label="Importar convocados"
              endpoint="/api/admin/convocados/import"
              extraFields={{ fechaId }}
            />
          </div>
          <p className="text-xs text-[#f5f0e0]/60">
            Lee columnas: id, plantel (ignora el resto)
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-[#c8a951]">Puntajes</h2>
          <div className="flex flex-wrap gap-3 text-sm items-start">
            <Link
              href={`/api/admin/puntajes/export?fechaId=${fechaId}`}
              className="rounded border border-[#c8a951] px-3 py-2 bg-[#1a3a6b] text-[#f5f0e0] hover:bg-[#1a6b3a]"
            >
              Exportar puntajes
            </Link>
            <ImportButton
              label="Importar puntajes"
              endpoint="/api/admin/puntajes/import"
              extraFields={{ fechaId }}
            />
          </div>
          <p className="text-xs text-[#f5f0e0]/60">
            Lee columnas: id, tries, tackles, knock_ons, penales, amarillas,
            rojas, conversiones_metidas, conversiones_erradas, penales_metidos,
            penales_errados (ignora el resto)
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-[#c8a951]">
            Jugadores convocados ({convocados.length})
          </h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o apodo..."
            className="w-full rounded px-3 py-2 text-sm outline-none"
            style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}
          />
          <div className="space-y-1">
            {filtered.map((c) => (
              <div
                key={c.jfId}
                className="flex items-center justify-between rounded px-3 py-2 text-sm"
                style={{ background: '#0d1f35', border: '1px solid #1a3a6b' }}
              >
                <div>
                  <span className="font-medium" style={{ color: '#f5f0e0' }}>
                    {c.apellido}, {c.nombre}
                    {c.apodo ? <span style={{ color: 'rgba(245,240,224,0.5)' }}> · {c.apodo}</span> : null}
                  </span>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[11px] px-1.5 rounded" style={{ background: '#1a3a6b', color: '#c8a951' }}>
                      {c.plantel}
                    </span>
                    <span className="text-[11px]" style={{ color: 'rgba(245,240,224,0.5)' }}>
                      {labelPosicion[c.posicion] ?? c.posicion}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(c)}
                  className="text-xs px-2 py-1 rounded"
                  style={{ border: '1px solid #c8a951', color: '#c8a951', background: 'transparent' }}
                >
                  Editar
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-center py-3" style={{ color: 'rgba(245,240,224,0.4)' }}>
                No se encontraron jugadores
              </p>
            )}
          </div>
        </section>
      </div>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div
            className="w-full max-w-sm rounded-xl p-5 space-y-4"
            style={{ background: '#0d1f35', border: '1px solid #c8a951' }}
          >
            <p className="font-semibold" style={{ color: '#c8a951' }}>
              Editar — {editTarget.apellido}, {editTarget.nombre}
            </p>

            <div className="space-y-3">
              {([['nombre', 'Nombre'], ['apellido', 'Apellido'], ['apodo', 'Apodo']] as const).map(([field, label]) => (
                <div key={field}>
                  <label className="text-xs block mb-1" style={{ color: 'rgba(245,240,224,0.6)' }}>{label}</label>
                  <input
                    value={(editForm[field] as string) ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full rounded px-3 py-1.5 text-sm outline-none"
                    style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}
                  />
                </div>
              ))}

              <div>
                <label className="text-xs block mb-1" style={{ color: 'rgba(245,240,224,0.6)' }}>Camada</label>
                <input
                  type="number"
                  value={editForm.camada ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, camada: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full rounded px-3 py-1.5 text-sm outline-none"
                  style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}
                />
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: 'rgba(245,240,224,0.6)' }}>Posición</label>
                <select
                  value={editForm.posicion ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, posicion: e.target.value }))}
                  className="w-full rounded px-3 py-1.5 text-sm outline-none"
                  style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}
                >
                  {POSICIONES.map((p) => (
                    <option key={p} value={p}>{labelPosicion[p] ?? p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: 'rgba(245,240,224,0.6)' }}>Plantel (esta fecha)</label>
                <select
                  value={editForm.plantel ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, plantel: e.target.value }))}
                  className="w-full rounded px-3 py-1.5 text-sm outline-none"
                  style={{ background: '#1a3a6b', border: '1px solid #c8a951', color: '#f5f0e0' }}
                >
                  {PLANTELES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {saveError && (
              <p className="text-xs" style={{ color: '#f87171' }}>{saveError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 rounded py-2 text-sm font-semibold disabled:opacity-50"
                style={{ background: '#1a6b3a', border: '1px solid #c8a951', color: '#f5f0e0' }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setEditTarget(null)}
                className="flex-1 rounded py-2 text-sm"
                style={{ border: '1px solid #c8a951', color: '#f5f0e0', background: 'transparent' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </RankingLayout>
  );
}
