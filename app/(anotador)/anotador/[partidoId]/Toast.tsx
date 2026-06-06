"use client";

export interface ToastItem {
  id: number;
  mensaje: string;
  tipo: "ok" | "undo" | "error";
}

interface Props {
  toasts: ToastItem[];
}

const BG: Record<ToastItem["tipo"], string> = {
  ok: "#1a6b3a",
  undo: "#1a3a6b",
  error: "#7c2d12",
};

export default function Toast({ toasts }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-20 right-3 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-lg px-4 py-2 text-sm font-semibold shadow-lg"
          style={{ background: BG[t.tipo], border: "1px solid rgba(245,240,224,0.2)", color: "#f5f0e0", maxWidth: "16rem" }}
        >
          {t.mensaje}
        </div>
      ))}
    </div>
  );
}
