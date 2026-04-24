"use client";

import { useState } from "react";

export default function FechaInstructivoModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
        style={{ border: "1px solid #c8a951", color: "#c8a951", background: "transparent" }}
        title="Ver instructivo"
      >
        ?
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 py-8 overflow-y-auto">
          <div
            className="w-full max-w-lg rounded-xl p-6 space-y-5"
            style={{ background: "#0d1f35", border: "1px solid #c8a951" }}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-base" style={{ color: "#c8a951" }}>
                Instructivo — nueva fecha
              </p>
              <button
                onClick={() => setOpen(false)}
                className="text-sm px-2 py-1 rounded"
                style={{ color: "rgba(245,240,224,0.5)", background: "transparent" }}
              >
                ✕
              </button>
            </div>

            <ol className="space-y-4 text-sm" style={{ color: "#f5f0e0" }}>
              <li>
                <span className="font-semibold" style={{ color: "#c8a951" }}>1. Crear la fecha</span>
                <p className="mt-1 text-xs" style={{ color: "rgba(245,240,224,0.7)" }}>
                  Completar número y rival. La fecha arranca en estado PREVIA.
                </p>
              </li>

              <li>
                <span className="font-semibold" style={{ color: "#c8a951" }}>2. Procesar planilla de Marcelo</span>
                <p className="mt-1 text-xs" style={{ color: "rgba(245,240,224,0.7)" }}>
                  Correr el script Python con el .xlsx de Marcelo. Genera el CSV de convocados,
                  actualiza posiciones y crea jugadores nuevos en la DB.
                </p>
                <pre
                  className="mt-2 rounded px-3 py-2 text-[11px] overflow-x-auto"
                  style={{ background: "#1a3a6b", color: "#c8a951" }}
                >{`python3 docs/convocados/procesar_RIVAL.py
psql <DB_URL> < docs/convocados/RIVAL_nuevos.sql
psql <DB_URL> < docs/convocados/RIVAL_posiciones.sql`}</pre>
              </li>

              <li>
                <span className="font-semibold" style={{ color: "#c8a951" }}>3. Importar convocados</span>
                <p className="mt-1 text-xs" style={{ color: "rgba(245,240,224,0.7)" }}>
                  En la pantalla de la fecha, usar el botón <strong>Importar convocados</strong> con
                  el archivo <code>*_convocados.csv</code> generado por el script.
                </p>
              </li>

              <li>
                <span className="font-semibold" style={{ color: "#c8a951" }}>4. Revisar posiciones ("sin pos.")</span>
                <p className="mt-1 text-xs" style={{ color: "rgba(245,240,224,0.7)" }}>
                  En la lista de convocados, usar el filtro <strong>sin pos.</strong> para ver los
                  jugadores sin posición específica. Editarlos uno a uno. Las posiciones quedan
                  guardadas para todos los partidos futuros.
                </p>
                <div className="mt-2 overflow-hidden rounded" style={{ border: "1px solid #1a3a6b" }}>
                  <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#1a3a6b" }}>
                        <th className="px-2 py-1 text-left" style={{ color: "#c8a951" }}>Camiseta</th>
                        <th className="px-2 py-1 text-left" style={{ color: "#c8a951" }}>Posición</th>
                        <th className="px-2 py-1 text-left" style={{ color: "#c8a951" }}>Camiseta</th>
                        <th className="px-2 py-1 text-left" style={{ color: "#c8a951" }}>Posición</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: "rgba(245,240,224,0.8)" }}>
                      {[
                        ["1, 3", "Pilar", "9", "Medio scrum"],
                        ["2", "Hooker", "10", "Apertura"],
                        ["4, 5", "Segunda línea", "11, 14", "Wing"],
                        ["6, 7, 8", "Tercera línea", "12, 13", "Centro"],
                        ["", "", "15", "Fullback"],
                      ].map((row, i) => (
                        <tr key={i} style={{ borderTop: "1px solid #1a3a6b" }}>
                          {row.map((cell, j) => (
                            <td key={j} className="px-2 py-1">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </li>

              <li>
                <span className="font-semibold" style={{ color: "#c8a951" }}>5. PREVIA → usuarios arman su equipo</span>
                <p className="mt-1 text-xs" style={{ color: "rgba(245,240,224,0.7)" }}>
                  Los usuarios eligen 15 jugadores, capitán y pateador.
                </p>
              </li>

              <li>
                <span className="font-semibold" style={{ color: "#c8a951" }}>6. CERRADA → arranca el partido</span>
                <p className="mt-1 text-xs" style={{ color: "rgba(245,240,224,0.7)" }}>
                  Nadie puede editar su equipo.
                </p>
              </li>

              <li>
                <span className="font-semibold" style={{ color: "#c8a951" }}>7. Cargar puntajes</span>
                <p className="mt-1 text-xs" style={{ color: "rgba(245,240,224,0.7)" }}>
                  Exportar puntajes → completar tries, tackles, knock_ons, penales, amarillas, rojas,
                  conversiones y penales de patadas → importar. Verificar en /admin/estadísticas.
                </p>
              </li>

              <li>
                <span className="font-semibold" style={{ color: "#c8a951" }}>8. PUNTUADA → se publican resultados</span>
                <p className="mt-1 text-xs" style={{ color: "rgba(245,240,224,0.7)" }}>
                  Solo cuando todos los puntajes estén cargados y verificados.
                </p>
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
