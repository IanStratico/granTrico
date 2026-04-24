import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { score, tries } = await req.json()
  if (typeof score !== 'number' || typeof tries !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const saved = await prisma.gameScore.create({
    data: { usuarioId: Number(session.user.id), score, tries },
  })

  return NextResponse.json({ id: saved.id })
}
