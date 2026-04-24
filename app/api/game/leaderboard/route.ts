import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const top = await prisma.gameScore.groupBy({
    by: ['usuarioId'],
    _max: { score: true, tries: true },
    orderBy: { _max: { score: 'desc' } },
    take: 3,
  })

  const users = await prisma.usuario.findMany({
    where: { id: { in: top.map((r) => r.usuarioId) } },
    select: { id: true, nombre: true },
  })

  const userMap = new Map(users.map((u) => [u.id, u.nombre]))

  const leaderboard = top.map((r) => ({
    nombre: userMap.get(r.usuarioId) ?? 'Jugador',
    score: r._max.score ?? 0,
    tries: r._max.tries ?? 0,
  }))

  return NextResponse.json(leaderboard)
}
