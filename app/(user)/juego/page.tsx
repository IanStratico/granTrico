import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import RugbyRunnerGame from '@/components/RugbyRunnerGame'
import Link from 'next/link'

const GOLD = '#c8a951'
const NAVY = '#1a3a6b'
const medals = ['🥇', '🥈', '🥉']

export default async function JuegoPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = Number(session.user.id)

  // leaderboard: max score per user, top 5
  const topRaw = await prisma.gameScore.groupBy({
    by: ['usuarioId'],
    _max: { score: true, tries: true },
    orderBy: { _max: { score: 'desc' } },
    take: 5,
  })

  const users = await prisma.usuario.findMany({
    where: { id: { in: topRaw.map((r) => r.usuarioId) } },
    select: { id: true, nombre: true },
  })
  const userMap = new Map(users.map((u) => [u.id, u.nombre]))

  const leaderboard = topRaw.map((r) => ({
    nombre: userMap.get(r.usuarioId) ?? '?',
    score: r._max.score ?? 0,
    tries: r._max.tries ?? 0,
    isMe: r.usuarioId === userId,
  }))

  const cardStyle = {
    background: NAVY,
    border: `1px solid ${GOLD}`,
    borderRadius: '0.5rem',
    padding: '1rem',
  }

  const labelStyle = {
    color: GOLD,
    opacity: 0.75,
    fontSize: '0.65rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '0.5rem',
  }

  return (
    <main className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: GOLD, fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace' }}>
            🏉 Corre Nete
          </h1>
        </div>
        <Link
          href="/home"
          style={{ color: 'rgba(245,240,224,0.5)', fontSize: '0.75rem', border: '1px solid rgba(200,169,81,0.3)', borderRadius: '0.375rem', padding: '0.25rem 0.75rem' }}
        >
          ← Volver
        </Link>
      </div>

      {/* Game */}
      <RugbyRunnerGame userId={userId} />

      {/* Leaderboard */}
      <section style={cardStyle}>
        <p style={labelStyle}>Hall of Fame 🏆</p>
        {leaderboard.length === 0 ? (
          <p style={{ color: 'rgba(245,240,224,0.4)', fontSize: '0.8rem' }}>
            Todavía nadie jugó. Sé el primero.
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{
                  background: entry.isMe ? 'rgba(200,169,81,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${entry.isMe ? 'rgba(200,169,81,0.5)' : 'rgba(200,169,81,0.2)'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: idx < 3 ? '1.1rem' : '0.85rem', minWidth: '1.5rem', color: GOLD }}>
                    {medals[idx] ?? `${idx + 1}.`}
                  </span>
                  <div>
                    <p style={{ color: entry.isMe ? GOLD : '#f5f0e0', fontSize: '0.85rem', fontWeight: entry.isMe ? 700 : 400 }}>
                      {entry.nombre} {entry.isMe ? '(vos)' : ''}
                    </p>
                    <p style={{ color: 'rgba(245,240,224,0.45)', fontSize: '0.65rem' }}>
                      {entry.tries} {entry.tries === 1 ? 'try' : 'tries'}
                    </p>
                  </div>
                </div>
                <span style={{ color: GOLD, fontWeight: 700, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {entry.score} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
