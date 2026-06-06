"use client";

import { useEffect, useRef, useState } from "react";

const PLANTELES = ["PRIMERA", "INTER", "PRE_A", "PRE_B", "PRE_C", "PRE_D"] as const;
const LABEL_PLANTEL: Record<string, string> = {
  PRIMERA: "Primera",
  INTER: "Intermedia",
  PRE_A: "Pre A",
  PRE_B: "Pre B",
  PRE_C: "Pre C",
  PRE_D: "Pre D",
};
const LABEL_ESTADO: Record<string, string> = {
  NO_INICIADO: "Sin iniciar",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
};
const COLOR_ESTADO: Record<string, string> = {
  NO_INICIADO: "rgba(245,240,224,0.4)",
  EN_CURSO: "#4ade80",
  FINALIZADO: "#c8a951",
};

interface Asignacion {
  id: number;
  fechaId: number;
  usuarioId: number;
  plantel: string;
  usuario: { id: number; nombre: string; email: string };
}

interface Partido {
  id: number;
  fechaId: number;
  plantel: string;
  estado: string;
}

interface UsuarioResult {
  id: number;
  nombre: string;
  email: string;
}

interface Props {
  fechaId: number;
  asignaciones: Asignacion[];
  partidos: Partido[];
}

export default function AnotadoresSection({ fechaId, asignaciones: initialAsig, partidos: initialPartidos }: Props) {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>(initialAsig);
  const [partidos, setPartidos] = useState<Partido[]>(initialPartidos);
  const [expandedPlantel, setExpandedPlantel] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UsuarioResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/usuarios/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setResults(await res.json());
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const openPlantel = (plantel: string) => {
    setExpandedPlantel(plantel);
    setQuery("");
    setResults([]);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const assignUser = async (usuario: UsuarioResult) => {
    if (!expandedPlantel || saving) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/anotadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fechaId, plantel: expandedPlantel, usuarioId: usuario.id }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Error al asignar");
      setSaving(false);
      return;
    }
    const data = await res.json();
    setAsignaciones((prev) => {
      const filtered = prev.filter((a) => a.plantel !== expandedPlantel);
      return [...filtered, data.asignacion];
    });
    setPartidos((prev) => {
      const exists = prev.some((p) => p.plantel === expandedPlantel);
      if (exists) return prev;
      return [...prev, data.partido];
    });
    setExpandedPlantel(null);
    setQuery("");
    setResults([]);
    setSaving(false);
  };

  const removeAsignacion = async (asig: Asignacion) => {
    const partido = partidos.find((p) => p.plantel === asig.plantel);
    const enCurso = partido?.estado === "EN_CURSO";
    if (enCurso) {
      if (!window.confirm("El partido está en curso. ¿Quitar el anotador de todas formas?")) return;
    }
    const url = `/api/admin/anotadores/${asig.id}${enCurso ? "?force=true" : ""}`;
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.error || "Error al quitar");
      return;
    }
    setAsignaciones((prev) => prev.filter((a) => a.id !== asig.id));
  };

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold" style={{ color: "#c8a951" }}>
        Anotadores en vivo
      </h2>
      <div className="space-y-1">
        {PLANTELES.map((plantel) => {
          const asig = asignaciones.find((a) => a.plantel === plantel);
          const partido = partidos.find((p) => p.plantel === plantel);
          const isExpanded = expandedPlantel === plantel;

          return (
            <div
              key={plantel}
              className="rounded-lg px-3 py-2 space-y-2"
              style={{ background: "#0d1f35", border: "1px solid #1a3a6b" }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "#1a3a6b", color: "#c8a951" }}>
                    {LABEL_PLANTEL[plantel]}
                  </span>
                  {partido && (
                    <span className="text-xs" style={{ color: COLOR_ESTADO[partido.estado] ?? "rgba(245,240,224,0.4)" }}>
                      {LABEL_ESTADO[partido.estado] ?? partido.estado}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {asig ? (
                    <>
                      <span className="text-xs" style={{ color: "#f5f0e0" }}>
                        {asig.usuario.nombre}
                      </span>
                      <button
                        onClick={() => openPlantel(plantel)}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ border: "1px solid #c8a951", color: "#c8a951", background: "transparent" }}
                      >
                        Cambiar
                      </button>
                      <button
                        onClick={() => removeAsignacion(asig)}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ border: "1px solid #ef4444", color: "#ef4444", background: "transparent" }}
                      >
                        Quitar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openPlantel(plantel)}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ border: "1px solid #c8a951", color: "#c8a951", background: "transparent" }}
                    >
                      Asignar
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="space-y-1">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar usuario por nombre o email..."
                    className="w-full rounded px-3 py-1.5 text-sm outline-none"
                    style={{ background: "#1a3a6b", border: "1px solid #c8a951", color: "#f5f0e0" }}
                    disabled={saving}
                  />
                  {loading && (
                    <p className="text-xs" style={{ color: "rgba(245,240,224,0.4)" }}>Buscando...</p>
                  )}
                  {results.length > 0 && (
                    <div className="rounded border overflow-hidden" style={{ border: "1px solid #1a3a6b" }}>
                      {results.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => assignUser(u)}
                          disabled={saving}
                          className="w-full text-left px-3 py-2 text-sm disabled:opacity-50"
                          style={{ background: "#0d1f35", color: "#f5f0e0", borderBottom: "1px solid #1a3a6b" }}
                        >
                          <span className="font-medium">{u.nombre}</span>{" "}
                          <span style={{ color: "rgba(245,240,224,0.5)" }}>{u.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {query && !loading && results.length === 0 && (
                    <p className="text-xs" style={{ color: "rgba(245,240,224,0.4)" }}>Sin resultados</p>
                  )}
                  {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}
                  <button
                    onClick={() => { setExpandedPlantel(null); setQuery(""); setResults([]); }}
                    className="text-xs"
                    style={{ color: "rgba(245,240,224,0.4)" }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
