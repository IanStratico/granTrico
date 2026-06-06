"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ActionGrid, { type AccionTipo } from "./ActionGrid";
import AnotadorPlayerPicker from "./AnotadorPlayerPicker";
import LiveScoresSheet from "./LiveScoresSheet";
import Toast, { type ToastItem } from "./Toast";
import { labelPlantel, ACCION_LABEL } from "@/lib/constants";

interface Convocado {
  jfId: number;
  jugadorId: number;
  nombre: string;
  apellido: string;
  apodo: string | null;
  posicion: string;
  puntajeCalculado: number;
}

interface Partido {
  id: number;
  fechaId: number;
  plantel: string;
  estado: string;
  iniciadoAt: string | null;
  finalizadoAt: string | null;
}

interface Props {
  partido: Partido;
  fecha: { nro: number; rival: string };
  convocados: Convocado[];
}

let toastId = 0;

export default function AnotadorClient({ partido, fecha, convocados: initialConvocados }: Props) {
  const router = useRouter();
  const [estado, setEstado] = useState(partido.estado);
  const [convocados, setConvocados] = useState<Convocado[]>(initialConvocados);
  const [accionPendiente, setAccionPendiente] = useState<AccionTipo | null>(null);
  const [liveOpen, setLiveOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmFinalizar, setConfirmFinalizar] = useState(false);

  const pushToast = useCallback((mensaje: string, tipo: ToastItem["tipo"]) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  const iniciarPartido = async () => {
    setPending(true);
    const res = await fetch(`/api/anotador/partidos/${partido.id}/iniciar`, { method: "POST" });
    if (res.ok) {
      setEstado("EN_CURSO");
    } else {
      const body = await res.json().catch(() => ({}));
      pushToast(body.error ?? "Error al iniciar", "error");
    }
    setPending(false);
  };

  const onAccionPick = (accion: AccionTipo) => {
    setAccionPendiente(accion);
  };

  const onJugadorSelect = async (jfId: number, convocado: Convocado) => {
    if (!accionPendiente || pending) return;
    setPending(true);
    setAccionPendiente(null);

    const res = await fetch(`/api/anotador/partidos/${partido.id}/anotaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jugadorFechaId: jfId, accion: accionPendiente }),
    });

    if (res.ok) {
      const data = await res.json();
      const accionLabel = ACCION_LABEL[accionPendiente as keyof typeof ACCION_LABEL] ?? accionPendiente;
      const nombre = convocado.apodo ?? `${convocado.apellido}`;
      pushToast(`✓ ${accionLabel} — ${nombre}`, "ok");
      navigator.vibrate?.(15);
      setConvocados((prev) =>
        prev.map((c) => (c.jfId === jfId ? { ...c, puntajeCalculado: data.puntajeCalculado } : c))
      );
    } else {
      const body = await res.json().catch(() => ({}));
      pushToast(body.error ?? "Error al anotar", "error");
    }
    setPending(false);
  };

  const deshacer = async () => {
    if (pending) return;
    setPending(true);
    const res = await fetch(`/api/anotador/partidos/${partido.id}/anotaciones/deshacer`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      pushToast(`↶ ${data.mensaje}`, "undo");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      pushToast(body.error ?? "Error al deshacer", "error");
    }
    setPending(false);
  };

  const finalizarPartido = async () => {
    setConfirmFinalizar(false);
    setMenuOpen(false);
    setPending(true);
    const res = await fetch(`/api/anotador/partidos/${partido.id}/finalizar`, { method: "POST" });
    if (res.ok) {
      setEstado("FINALIZADO");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      pushToast(body.error ?? "Error al finalizar", "error");
    }
    setPending(false);
  };

  const plantelLabel = labelPlantel[partido.plantel] ?? partido.plantel;
  const titulo = `Fecha ${fecha.nro} · ${plantelLabel} vs ${fecha.rival}`;

  if (estado === "NO_INICIADO") {
    return (
      <main className="py-4 px-3 space-y-4">
        <Link href="/home" className="text-sm" style={{ color: "rgba(245,240,224,0.5)" }}>
          ← Inicio
        </Link>
        <div
          className="rounded-xl p-5 space-y-4 text-center"
          style={{ background: "#1a3a6b", border: "1px solid #c8a951" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(245,240,224,0.5)" }}>
            Partido asignado
          </p>
          <h1 className="text-xl font-bold" style={{ color: "#c8a951" }}>
            {titulo}
          </h1>
          <p className="text-sm" style={{ color: "rgba(245,240,224,0.6)" }}>
            {convocados.length} jugadores convocados
          </p>
          <button
            onClick={iniciarPartido}
            disabled={pending}
            className="w-full rounded-xl py-5 text-xl font-bold disabled:opacity-50 active:scale-95 transition-transform"
            style={{ background: "#1a6b3a", border: "2px solid #4ade80", color: "#f5f0e0" }}
          >
            {pending ? "Iniciando..." : "Iniciar partido"}
          </button>
        </div>
      </main>
    );
  }

  if (estado === "FINALIZADO") {
    const sorted = [...convocados].sort((a, b) => b.puntajeCalculado - a.puntajeCalculado);
    return (
      <main className="py-4 px-3 space-y-4">
        <Link href="/home" className="text-sm" style={{ color: "rgba(245,240,224,0.5)" }}>
          ← Inicio
        </Link>
        <div
          className="rounded-xl p-4 space-y-1 text-center"
          style={{ background: "#1a3a6b", border: "1px solid #c8a951" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(245,240,224,0.5)" }}>
            Partido finalizado
          </p>
          <h1 className="text-base font-bold" style={{ color: "#c8a951" }}>
            {titulo}
          </h1>
        </div>
        <div className="space-y-1.5">
          {sorted.map((c, idx) => (
            <div
              key={c.jfId}
              className="flex items-center justify-between rounded-lg px-3 py-2.5"
              style={{ background: "#1a3a6b", border: "1px solid rgba(200,169,81,0.25)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs w-5 text-right" style={{ color: "rgba(245,240,224,0.4)" }}>
                  {idx + 1}
                </span>
                <p className="text-sm font-semibold" style={{ color: "#f5f0e0" }}>
                  {c.apodo ?? `${c.apellido}, ${c.nombre}`}
                </p>
              </div>
              <span className="font-bold text-sm" style={{ color: c.puntajeCalculado >= 0 ? "#c8a951" : "#f87171" }}>
                {c.puntajeCalculado} pts
              </span>
            </div>
          ))}
        </div>
      </main>
    );
  }

  // EN_CURSO
  return (
    <main className="py-2 px-3 pb-32 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/home" className="text-xs" style={{ color: "rgba(245,240,224,0.5)" }}>
            ← Inicio
          </Link>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#c8a951" }}>
            {titulo}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-lg"
            style={{ border: "1px solid rgba(200,169,81,0.3)", color: "#c8a951" }}
          >
            ⋮
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-10 rounded-lg shadow-xl z-30 overflow-hidden"
              style={{ background: "#1a3a6b", border: "1px solid #c8a951", minWidth: "10rem" }}
            >
              <button
                onClick={() => { setMenuOpen(false); setConfirmFinalizar(true); }}
                className="w-full text-left px-4 py-3 text-sm font-semibold"
                style={{ color: "#f5f0e0" }}
              >
                Finalizar partido
              </button>
            </div>
          )}
        </div>
      </div>

      <ActionGrid onPick={onAccionPick} disabled={pending} />

      <button
        onClick={deshacer}
        disabled={pending}
        className="w-full rounded-xl py-3 font-bold text-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
        style={{ background: "#5c1e1e", border: "2px solid #f87171", color: "#f5f0e0" }}
      >
        ↶ Deshacer última
      </button>

      {/* Botón live scores fijo */}
      <button
        onClick={() => setLiveOpen(true)}
        className="fixed bottom-16 left-0 right-0 mx-3 rounded-xl py-3.5 font-semibold text-sm z-20"
        style={{ background: "#0d1f35", border: "1px solid #c8a951", color: "#c8a951" }}
      >
        Ver puntajes en vivo
      </button>

      {accionPendiente && (
        <AnotadorPlayerPicker
          convocados={convocados}
          accionLabel={ACCION_LABEL[accionPendiente as keyof typeof ACCION_LABEL] ?? accionPendiente}
          onSelect={onJugadorSelect}
          onClose={() => setAccionPendiente(null)}
          disabled={pending}
        />
      )}

      {liveOpen && (
        <LiveScoresSheet partidoId={partido.id} onClose={() => setLiveOpen(false)} />
      )}

      {confirmFinalizar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div
            className="w-full max-w-sm rounded-xl p-5 space-y-4"
            style={{ background: "#0d1f35", border: "1px solid #c8a951" }}
          >
            <p className="font-bold text-base" style={{ color: "#c8a951" }}>¿Finalizar el partido?</p>
            <p className="text-sm" style={{ color: "rgba(245,240,224,0.7)" }}>
              Una vez finalizado, no podrás registrar más anotaciones. Solo el admin podrá hacer correcciones.
            </p>
            <div className="flex gap-3">
              <button
                onClick={finalizarPartido}
                disabled={pending}
                className="flex-1 rounded-lg py-3 font-semibold text-sm disabled:opacity-50"
                style={{ background: "#1a6b3a", border: "1px solid #4ade80", color: "#f5f0e0" }}
              >
                Finalizar
              </button>
              <button
                onClick={() => setConfirmFinalizar(false)}
                className="flex-1 rounded-lg py-3 text-sm"
                style={{ border: "1px solid rgba(245,240,224,0.3)", color: "#f5f0e0", background: "transparent" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
      )}

      <Toast toasts={toasts} />
    </main>
  );
}
