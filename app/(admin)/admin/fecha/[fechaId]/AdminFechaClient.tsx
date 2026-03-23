"use client";

import { useState } from "react";
import Link from "next/link";
import RankingLayout from "@/components/RankingLayout";
import FechaSwitcher from "@/components/FechaSwitcher";
import ImportButton from "@/components/ImportButton";

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
}

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
}: Props) {
  const [changing, setChanging] = useState(false);
  const [currentEstado, setCurrentEstado] = useState(estado);
  const [error, setError] = useState<string | null>(null);

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
        <div className="text-xl font-semibold">Admin</div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Estado de la fecha</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded border bg-white shadow-sm">
              Estado: {estadoLabel}
            </span>
            {(["PREVIA", "CERRADA", "PUNTUADA"] as const).map((estadoBtn) => (
              <button
                key={estadoBtn}
                className={`rounded px-3 py-2 text-sm border ${
                  estadoBtn === currentEstado
                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white"
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
          <h2 className="text-lg font-semibold">Convocados</h2>
          <div className="flex flex-wrap gap-3 text-sm items-start">
            <Link
              href={`/api/admin/convocados/export?fechaId=${fechaId}`}
              className="rounded border px-3 py-2 bg-white hover:bg-gray-50"
            >
              Exportar convocados
            </Link>
            <ImportButton
              label="Importar convocados"
              endpoint="/api/admin/convocados/import"
              extraFields={{ fechaId }}
            />
          </div>
          <p className="text-xs text-gray-500">
            Lee columnas: id, plantel (ignora el resto)
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Puntajes</h2>
          <div className="flex flex-wrap gap-3 text-sm items-start">
            <Link
              href={`/api/admin/puntajes/export?fechaId=${fechaId}`}
              className="rounded border px-3 py-2 bg-white hover:bg-gray-50"
            >
              Exportar puntajes
            </Link>
            <ImportButton
              label="Importar puntajes"
              endpoint="/api/admin/puntajes/import"
              extraFields={{ fechaId }}
            />
          </div>
          <p className="text-xs text-gray-500">
            Lee columnas: id, tries, tackles, knock_ons, penales, amarillas,
            rojas (ignora el resto)
          </p>
        </section>
      </div>
    </RankingLayout>
  );
}
