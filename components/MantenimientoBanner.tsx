export default function MantenimientoBanner() {
  return (
    <div
      className="rounded-lg px-4 py-4"
      style={{ background: '#1a3a6b', border: '2px solid #c8a951' }}
    >
      <p className="text-sm font-bold" style={{ color: '#c8a951' }}>
        🔧 Fantasy en mantenimiento
      </p>
      <p className="text-sm mt-1.5" style={{ color: '#f5f0e0' }}>
        Fantasy del trico va a entrar en modo mantenimiento y retorna para la segunda vuelta.
        ¡Muchas gracias por jugar este tiempo!
      </p>
    </div>
  );
}
