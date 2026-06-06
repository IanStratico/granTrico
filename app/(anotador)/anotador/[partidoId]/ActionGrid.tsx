"use client";

type AccionTipo =
  | "TRY"
  | "TACKLE"
  | "KNOCK_ON"
  | "PENAL"
  | "AMARILLA"
  | "ROJA"
  | "CONVERSION_METIDA"
  | "CONVERSION_ERRADA"
  | "PENAL_METIDO"
  | "PENAL_ERRADO";

const ACCIONES: { accion: AccionTipo; label: string; sub: string; bg: string; border: string }[] = [
  { accion: "TRY", label: "Try", sub: "+10 pts", bg: "#1a6b3a", border: "#4ade80" },
  { accion: "TACKLE", label: "Tackle", sub: "+1 pt", bg: "#1a3a6b", border: "#60a5fa" },
  { accion: "CONVERSION_METIDA", label: "Conv. ✓", sub: "kicks", bg: "#78450a", border: "#c8a951" },
  { accion: "PENAL_METIDO", label: "Penal ✓", sub: "kicks", bg: "#78450a", border: "#c8a951" },
  { accion: "KNOCK_ON", label: "Knock-on", sub: "−2 pts", bg: "#5c1e1e", border: "#f87171" },
  { accion: "PENAL", label: "Penal com.", sub: "−2 pts", bg: "#5c1e1e", border: "#f87171" },
  { accion: "AMARILLA", label: "Amarilla", sub: "−5 pts", bg: "#78350f", border: "#fbbf24" },
  { accion: "ROJA", label: "Roja", sub: "−10 pts", bg: "#7c2d12", border: "#ef4444" },
  { accion: "CONVERSION_ERRADA", label: "Conv. ✗", sub: "kicks", bg: "#1f2937", border: "#6b7280" },
  { accion: "PENAL_ERRADO", label: "Penal ✗", sub: "kicks", bg: "#1f2937", border: "#6b7280" },
];

interface Props {
  onPick: (accion: AccionTipo) => void;
  disabled?: boolean;
}

export default function ActionGrid({ onPick, disabled }: Props) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {ACCIONES.map(({ accion, label, sub, bg, border }) => (
        <button
          key={accion}
          onClick={() => onPick(accion)}
          disabled={disabled}
          className="flex flex-col items-center justify-center rounded-xl py-2.5 font-bold text-base disabled:opacity-40 active:scale-95 transition-transform"
          style={{ background: bg, border: `2px solid ${border}`, color: "#f5f0e0" }}
        >
          <span>{label}</span>
          <span className="text-[11px] font-normal" style={{ color: `${border}cc` }}>
            {sub}
          </span>
        </button>
      ))}
    </div>
  );
}

export type { AccionTipo };
