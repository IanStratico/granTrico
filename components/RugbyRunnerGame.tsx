'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── canvas constants ──────────────────────────────────────────────────────────
const CH = 290          // canvas height
const GY = 228          // ground Y (where feet touch)
const PX = 80           // player fixed screen X

// player dimensions
const PW = 26
const PH = 50
const PDW = 42          // duck width
const PDH = 28          // duck height

// physics
const JUMP_V = -13
const GRAVITY = 0.58
const INIT_SPEED = 4.5
const TRY_DIST = 1500   // world units between try lines

// colors
const NAVY = '#1a3a6b'
const GOLD = '#c8a951'
const SKIN = '#f4b97e'

// ─── types ─────────────────────────────────────────────────────────────────────
type ObType = 'tackler' | 'arbitro' | 'caramanola' | 'pelotazo'

interface Obs {
  x: number
  type: ObType
  w: number
  h: number
  yt: number    // top Y on canvas
}

interface TryLine { x: number }

interface FX {
  text: string
  x: number
  y: number
  alpha: number
  vy: number
  color: string
}

interface GS {           // mutable game state in ref
  rafId: number
  py: number             // player top Y
  pvy: number            // player Y velocity
  ducking: boolean
  onGround: boolean
  speed: number
  worldX: number
  tries: number
  nextTryAt: number
  tryLinePending: boolean
  obstacles: Obs[]
  nextObsIn: number
  tryLines: TryLine[]
  fx: FX[]
  alive: boolean
  frame: number
  // touch
  touchT: number         // timestamp of touchstart (0 = none)
  duckHeld: boolean
}

// ─── draw helpers ──────────────────────────────────────────────────────────────
function drawBg(ctx: CanvasRenderingContext2D, cw: number, worldX: number) {
  // ── tribuna (grandstand) ──
  const tribunaTop = 26   // below HUD
  const tribunaBot = GY - 14

  // concrete back wall
  ctx.fillStyle = '#2a2d35'
  ctx.fillRect(0, tribunaTop, cw, tribunaBot - tribunaTop)

  // roof overhang
  ctx.fillStyle = '#1a1c22'
  ctx.fillRect(0, tribunaTop, cw, 16)
  // roof highlight
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fillRect(0, tribunaTop + 14, cw, 2)

  // seat rows — alternating dark/lighter blue
  const rowH = 14
  const seatColors = ['#1c3a6e', '#1a3460', '#17305a']
  const rowCount = Math.floor((tribunaBot - tribunaTop - 16) / rowH)
  for (let r = 0; r < rowCount; r++) {
    const ry = tribunaTop + 16 + r * rowH
    ctx.fillStyle = seatColors[r % seatColors.length]
    ctx.fillRect(0, ry, cw, rowH - 1)
    // row ledge shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(0, ry + rowH - 1, cw, 1)

    // crowd heads — staggered per row
    const headR = 4.5
    const spacing = 18
    const offset = (r % 2) * 9
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    for (let hx = offset + 8; hx < cw; hx += spacing) {
      ctx.beginPath()
      ctx.arc(hx, ry + 5, headR, 0, Math.PI * 2)
      ctx.fill()
    }
    // occasional colored shirt among the crowd
    ctx.fillStyle = 'rgba(200,169,81,0.35)'
    for (let hx = offset + 8 + spacing * 2; hx < cw; hx += spacing * 5) {
      ctx.beginPath()
      ctx.arc(hx, ry + 5, headR, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // vertical aisle dividers
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  const aisles = Math.ceil(cw / 80)
  for (let a = 1; a < aisles; a++) {
    const ax = (cw / aisles) * a
    ctx.beginPath()
    ctx.moveTo(ax, tribunaTop + 16)
    ctx.lineTo(ax, tribunaBot)
    ctx.stroke()
  }

  // ── field ──
  ctx.fillStyle = '#1a5218'
  ctx.fillRect(0, GY - 14, cw, CH - (GY - 14))

  // grass band at top of field
  ctx.fillStyle = '#226620'
  ctx.fillRect(0, GY - 14, cw, 10)

  // field line markings (scrolling)
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 2
  ctx.setLineDash([24, 18])
  const spacing2 = 220
  const off = worldX % spacing2
  for (let x = -off; x < cw + spacing2; x += spacing2) {
    ctx.beginPath()
    ctx.moveTo(x, GY - 4)
    ctx.lineTo(x, CH)
    ctx.stroke()
  }
  ctx.setLineDash([])
}

function drawTryLines(ctx: CanvasRenderingContext2D, tryLines: TryLine[]) {
  for (const tl of tryLines) {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(tl.x, 28)
    ctx.lineTo(tl.x, CH)
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 9px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('IN', tl.x, 40)
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  py: number,
  ducking: boolean,
  frame: number,
) {
  const bob = ducking ? 0 : Math.sin(frame * 0.32) * 2
  const legSwing = Math.sin(frame * 0.38) * 7

  // Club jersey: verde | blanco | azul (horizontal stripes)
  const J_GREEN = '#267326'
  const J_WHITE = '#f0f0f0'
  const J_BLUE  = '#1a4fa0'

  if (ducking) {
    const top = py + bob
    const jH = PDH - 10
    // jersey — 3 equal horizontal stripes
    const sH = Math.floor(jH / 3)
    ctx.fillStyle = J_GREEN; ctx.fillRect(PX - 4, top, PDW, sH)
    ctx.fillStyle = J_WHITE; ctx.fillRect(PX - 4, top + sH, PDW, sH)
    ctx.fillStyle = J_BLUE;  ctx.fillRect(PX - 4, top + sH * 2, PDW, jH - sH * 2)
    // shorts
    ctx.fillStyle = NAVY
    ctx.fillRect(PX - 2, top + PDH - 12, PDW - 4, 10)
    // head low-forward
    ctx.fillStyle = SKIN
    ctx.beginPath()
    ctx.arc(PX + PDW / 2 + 4, top - 1, 10, 0, Math.PI * 2)
    ctx.fill()
    // scrum cap
    ctx.fillStyle = J_GREEN
    ctx.fillRect(PX + PDW / 2 - 5, top - 9, 18, 7)
  } else {
    const top = py + bob
    // legs
    ctx.fillStyle = SKIN
    ctx.fillRect(PX + 3, top + PH - 14, 8, 14 + legSwing * 0.3)
    ctx.fillRect(PX + PW - 11, top + PH - 14, 8, 14 - legSwing * 0.3)
    // jersey — 3 horizontal stripes over the jersey area (top+14 to top+34, h=20)
    ctx.fillStyle = J_GREEN; ctx.fillRect(PX, top + 14, PW, 7)
    ctx.fillStyle = J_WHITE; ctx.fillRect(PX, top + 21, PW, 7)
    ctx.fillStyle = J_BLUE;  ctx.fillRect(PX, top + 28, PW, 6)
    // shorts
    ctx.fillStyle = NAVY
    ctx.fillRect(PX + 2, top + PH - 18, PW - 4, 12)
    // head
    ctx.fillStyle = SKIN
    ctx.beginPath()
    ctx.arc(PX + PW / 2, top + 8, 10, 0, Math.PI * 2)
    ctx.fill()
    // scrum cap (verde, como el club)
    ctx.fillStyle = J_GREEN
    ctx.fillRect(PX + PW / 2 - 9, top, 18, 7)
    // arm sleeve (green, matching top stripe)
    ctx.fillStyle = J_GREEN
    ctx.fillRect(PX + PW, top + 16, 9, 7)
    // ball
    ctx.fillStyle = '#7B3F00'
    ctx.beginPath()
    ctx.ellipse(PX + PW + 13, top + 18, 7, 5, -0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(PX + PW + 7, top + 18)
    ctx.lineTo(PX + PW + 19, top + 18)
    ctx.stroke()
  }
}

function drawObs(ctx: CanvasRenderingContext2D, obs: Obs, frame: number) {
  const { x, type, w, h, yt } = obs
  switch (type) {
    case 'tackler': {
      // San Cirano: verde y negro a rayas verticales
      const SC_GREEN = '#1a6b1a'
      const SC_BLACK = '#0d0d0d'
      const bob = Math.sin(frame * 0.3 + x * 0.01) * 1.5
      const jerseyTop = yt + 13 + bob
      const jerseyH = h - 28

      // clip to jersey rect and draw vertical stripes
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, jerseyTop, w, jerseyH)
      ctx.clip()
      const stripeW = 5
      for (let sx = x; sx < x + w; sx += stripeW) {
        const idx = Math.floor((sx - x) / stripeW)
        ctx.fillStyle = idx % 2 === 0 ? SC_GREEN : SC_BLACK
        ctx.fillRect(sx, jerseyTop, stripeW, jerseyH)
      }
      ctx.restore()

      // shorts
      ctx.fillStyle = '#111'
      ctx.fillRect(x + 2, yt + h - 17 + bob, w - 4, 11)
      // head
      ctx.fillStyle = SKIN
      ctx.beginPath()
      ctx.arc(x + w / 2, yt + 8 + bob, 9, 0, Math.PI * 2)
      ctx.fill()
      // arms open wide to tackle
      ctx.fillStyle = SC_GREEN
      ctx.fillRect(x - 10, yt + 17 + bob, 12, 7)
      ctx.fillRect(x + w - 2, yt + 17 + bob, 12, 7)
      // hands
      ctx.fillStyle = SKIN
      ctx.beginPath()
      ctx.arc(x - 4, yt + 20 + bob, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + w + 6, yt + 20 + bob, 4, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'arbitro': {
      // black/white stripes
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(x, yt + 11, w, h - 24)
      ctx.fillStyle = '#eeeeee'
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(x, yt + 13 + i * 8, w, 4)
      }
      // shorts
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(x + 2, yt + h - 14, w - 4, 10)
      // head
      ctx.fillStyle = SKIN
      ctx.beginPath()
      ctx.arc(x + w / 2, yt + 6, 8, 0, Math.PI * 2)
      ctx.fill()
      // whistle
      ctx.fillStyle = GOLD
      ctx.fillRect(x + w / 2 + 3, yt + 11, 7, 4)
      break
    }
    case 'caramanola': {
      // bottle body
      ctx.fillStyle = '#1a88cc'
      if (ctx.roundRect) {
        ctx.beginPath()
        ctx.roundRect(x + 5, yt, w - 10, h, 5)
        ctx.fill()
      } else {
        ctx.fillRect(x + 5, yt, w - 10, h)
      }
      // cap
      ctx.fillStyle = '#dd3300'
      ctx.fillRect(x + w / 2 - 6, yt - 5, 12, 7)
      // label
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.fillRect(x + 8, yt + 4, w - 16, 7)
      // TRICO text on label
      ctx.fillStyle = NAVY
      ctx.font = 'bold 5px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('TRICO', x + w / 2, yt + 10)
      break
    }
    case 'pelotazo': {
      // flying rugby ball
      ctx.fillStyle = '#7B3F00'
      ctx.beginPath()
      ctx.ellipse(x + w / 2, yt + h / 2, w / 2, h / 2, -0.25, 0, Math.PI * 2)
      ctx.fill()
      // seam lines
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(x + 5, yt + h / 2)
      ctx.lineTo(x + w - 5, yt + h / 2)
      ctx.stroke()
      ctx.lineWidth = 0.7
      ctx.beginPath()
      ctx.moveTo(x + w / 2, yt + 3)
      ctx.lineTo(x + w / 2, yt + h - 3)
      ctx.stroke()
      // speed lines
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 1
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(x - 6 - i * 4, yt + 4 + i * 5)
        ctx.lineTo(x - 18 - i * 4, yt + 4 + i * 5)
        ctx.stroke()
      }
      break
    }
  }
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  cw: number,
  tries: number,
  worldX: number,
  speed: number,
) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(0, 0, cw, 26)

  ctx.fillStyle = GOLD
  ctx.font = 'bold 12px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`🏉 Tries: ${tries}`, 8, 17)

  const meters = Math.floor(worldX / 10)
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText(`${meters}m`, cw - 8, 17)
}

function drawFX(ctx: CanvasRenderingContext2D, fxItems: FX[]) {
  for (const fx of fxItems) {
    ctx.globalAlpha = fx.alpha
    ctx.font = 'bold 17px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = fx.color
    ctx.fillText(fx.text, fx.x, fx.y)
  }
  ctx.globalAlpha = 1
}

// ─── collision ─────────────────────────────────────────────────────────────────
function hits(
  px: number, py: number, pw: number, ph: number,
  ox: number, oy: number, ow: number, oh: number,
): boolean {
  const i = 5
  return (
    px + i < ox + ow - i &&
    px + pw - i > ox + i &&
    py + i < oy + oh - i &&
    py + ph - i > oy + i
  )
}

// ─── obstacle spawn ────────────────────────────────────────────────────────────
const OBS_DEFS: Record<ObType, { w: number; h: number; aerial?: boolean }> = {
  tackler:    { w: 26, h: 60 },
  arbitro:    { w: 24, h: 45 },
  caramanola: { w: 38, h: 22 },
  pelotazo:   { w: 32, h: 20, aerial: true },
}

function spawnObs(cw: number): Obs {
  const r = Math.random()
  let type: ObType
  if (r < 0.30) type = 'tackler'
  else if (r < 0.55) type = 'caramanola'
  else if (r < 0.75) type = 'arbitro'
  else type = 'pelotazo'

  const def = OBS_DEFS[type]
  // pelotazo: flies at head height (player must duck)
  // normal player top = GY - PH = 178 → pelotazo yt=180, h=20 → ybot=200
  // duck player top  = GY - PDH = 200 → 200 > 200 → just clears (with inset=5: 205 > 195 ✓)
  const yt = def.aerial ? GY - PH - 2 : GY - def.h
  return { x: cw + 20, type, w: def.w, h: def.h, yt }
}

// ─── component ─────────────────────────────────────────────────────────────────
export default function RugbyRunnerGame({ userId }: { userId: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gsRef = useRef<GS | null>(null)
  const [phase, setPhase] = useState<'idle' | 'playing' | 'dead'>('idle')
  const [result, setResult] = useState({ tries: 0, score: 0 })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const getCanvas = () => canvasRef.current
  const getCtx = () => canvasRef.current?.getContext('2d') ?? null

  const stopLoop = useCallback(() => {
    if (gsRef.current?.rafId) cancelAnimationFrame(gsRef.current.rafId)
  }, [])

  const initGS = useCallback((): GS => ({
    rafId: 0,
    py: GY - PH,
    pvy: 0,
    ducking: false,
    onGround: true,
    speed: INIT_SPEED,
    worldX: 0,
    tries: 0,
    nextTryAt: TRY_DIST,
    tryLinePending: false,
    obstacles: [],
    nextObsIn: 90,
    tryLines: [],
    fx: [],
    alive: true,
    frame: 0,
    touchT: 0,
    duckHeld: false,
  }), [])

  const loop = useCallback(() => {
    const gs = gsRef.current
    const canvas = getCanvas()
    const ctx = getCtx()
    if (!gs || !canvas || !ctx || !gs.alive) return

    const cw = canvas.width
    gs.frame++

    // ── speed ──
    gs.speed = Math.min(INIT_SPEED + gs.frame * 0.001, 14)
    gs.worldX += gs.speed

    // ── player physics ──
    if (!gs.onGround) {
      gs.pvy += GRAVITY
      gs.py += gs.pvy
      if (gs.py >= GY - PH) {
        gs.py = GY - PH
        gs.pvy = 0
        gs.onGround = true
      }
    }

    // ducking: snap Y
    if (gs.ducking && gs.onGround) {
      gs.py = GY - PDH
    } else if (!gs.ducking && gs.onGround) {
      gs.py = GY - PH
    }

    // ── obstacles ──
    gs.nextObsIn--
    if (gs.nextObsIn <= 0) {
      gs.obstacles.push(spawnObs(cw))
      const baseGap = Math.max(55, 100 - gs.speed * 3)
      gs.nextObsIn = baseGap + Math.random() * 40
    }
    for (const obs of gs.obstacles) obs.x -= gs.speed
    gs.obstacles = gs.obstacles.filter((o) => o.x > -60)

    // ── try lines ──
    if (!gs.tryLinePending && gs.worldX >= gs.nextTryAt - (cw - PX)) {
      gs.tryLines.push({ x: cw + 10 })
      gs.tryLinePending = true
    }
    for (const tl of gs.tryLines) tl.x -= gs.speed
    const scoredIdx = gs.tryLines.findIndex((tl) => tl.x <= PX)
    if (scoredIdx >= 0) {
      gs.tries++
      gs.tryLines.splice(scoredIdx, 1)
      gs.nextTryAt += TRY_DIST
      gs.tryLinePending = false
      // speed bump per try
      gs.speed = Math.min(gs.speed + 0.6, 14)
      gs.fx.push({ text: '🏉 TRY!', x: PX + 80, y: GY - 70, alpha: 1, vy: -0.6, color: GOLD })
    }

    // ── FX update ──
    for (const fx of gs.fx) {
      fx.y += fx.vy
      fx.alpha -= 0.018
    }
    gs.fx = gs.fx.filter((fx) => fx.alpha > 0)

    // ── collision ──
    const [px, py, pw, ph] = gs.ducking
      ? [PX - 4, gs.py, PDW, PDH]
      : [PX, gs.py, PW, PH]

    for (const obs of gs.obstacles) {
      if (hits(px, py, pw, ph, obs.x, obs.yt, obs.w, obs.h)) {
        gs.alive = false
        const finalScore = gs.tries * 100 + Math.floor(gs.worldX / 10)
        setResult({ tries: gs.tries, score: finalScore })
        setPhase('dead')
        break
      }
    }

    // ── draw ──
    ctx.clearRect(0, 0, cw, CH)
    drawBg(ctx, cw, gs.worldX)
    drawTryLines(ctx, gs.tryLines)
    for (const obs of gs.obstacles) drawObs(ctx, obs, gs.frame)
    drawPlayer(ctx, gs.py, gs.ducking, gs.frame)
    drawFX(ctx, gs.fx)
    drawHUD(ctx, cw, gs.tries, gs.worldX, gs.speed)

    if (gs.alive) {
      gs.rafId = requestAnimationFrame(loop)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startGame = useCallback(() => {
    stopLoop()
    setSaved(false)
    const canvas = getCanvas()
    if (canvas) canvas.width = canvas.offsetWidth
    gsRef.current = initGS()
    setPhase('playing')

    const gs = gsRef.current
    gs.rafId = requestAnimationFrame(loop)
  }, [stopLoop, initGS, loop])

  // ── resize ──
  useEffect(() => {
    const canvas = getCanvas()
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.offsetWidth
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── touch controls ──
  useEffect(() => {
    const canvas = getCanvas()
    if (!canvas) return

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const gs = gsRef.current
      if (!gs || phase !== 'playing') return
      gs.touchT = Date.now()
    }

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      const gs = gsRef.current
      if (!gs || phase !== 'playing') return
      const held = Date.now() - gs.touchT
      if (held < 180) {
        // tap → jump
        if (gs.onGround && !gs.ducking) {
          gs.pvy = JUMP_V
          gs.onGround = false
        }
      }
      gs.duckHeld = false
      gs.ducking = false
    }

    // check for hold → duck
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const gs = gsRef.current
      if (!gs || phase !== 'playing') return
      const held = Date.now() - gs.touchT
      if (held >= 180 && gs.onGround) {
        gs.duckHeld = true
        gs.ducking = true
      }
    }

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('touchmove', onTouchMove)
    }
  }, [phase])

  // ── keyboard controls ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const gs = gsRef.current
      if (!gs || phase !== 'playing') return
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (gs.onGround && !gs.ducking) {
          gs.pvy = JUMP_V
          gs.onGround = false
        }
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault()
        if (gs.onGround) gs.ducking = true
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const gs = gsRef.current
      if (!gs) return
      if (e.code === 'ArrowDown') gs.ducking = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [phase])

  useEffect(() => () => stopLoop(), [stopLoop])

  const saveScore = async () => {
    setSaving(true)
    await fetch('/api/game/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    })
    setSaving(false)
    setSaved(true)
  }

  // ── draw idle/dead screen on canvas ──
  useEffect(() => {
    if (phase === 'playing') return
    const canvas = getCanvas()
    const ctx = getCtx()
    if (!canvas || !ctx) return
    canvas.width = canvas.offsetWidth
    const cw = canvas.width

    ctx.clearRect(0, 0, cw, CH)
    drawBg(ctx, cw, 0)

    // player standing still on idle
    if (phase === 'idle') {
      drawPlayer(ctx, GY - PH, false, 0)
    }
  }, [phase])

  const cardStyle = {
    background: NAVY,
    border: `1px solid ${GOLD}`,
    borderRadius: '0.5rem',
    padding: '1rem',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Canvas */}
      <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', border: `2px solid ${GOLD}` }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: `${CH}px`, touchAction: 'none', cursor: 'pointer' }}
          height={CH}
          onClick={phase === 'idle' ? startGame : undefined}
        />

        {/* Idle overlay */}
        {phase === 'idle' && (
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.55)', gap: '0.5rem',
            }}
          >
            <p style={{ color: GOLD, fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.05em' }}>
              🏉 Corre Nete
            </p>
            <button
              onClick={startGame}
              style={{
                marginTop: '0.5rem',
                background: GOLD, color: '#0a1a36',
                fontWeight: 700, fontSize: '0.85rem',
                padding: '0.5rem 1.5rem', borderRadius: '0.375rem',
                border: 'none', cursor: 'pointer', fontFamily: 'monospace',
              }}
            >
              ▶ JUGAR
            </button>
            <div style={{ marginTop: '0.25rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontFamily: 'monospace', textAlign: 'center', lineHeight: 1.6 }}>
              TAP → saltar · HOLD → agacharse
            </div>
          </div>
        )}

        {/* Dead overlay */}
        {phase === 'dead' && (
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)', gap: '0.5rem',
            }}
          >
            <p style={{ color: '#ff4444', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
              ¡TACKLE! 💥
            </p>
            <p style={{ color: GOLD, fontSize: '0.9rem', fontFamily: 'monospace' }}>
              🏉 {result.tries} {result.tries === 1 ? 'try' : 'tries'}
              &nbsp;·&nbsp;
              {result.score} pts
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                onClick={startGame}
                style={{
                  background: GOLD, color: '#0a1a36',
                  fontWeight: 700, fontSize: '0.8rem',
                  padding: '0.4rem 1.2rem', borderRadius: '0.375rem',
                  border: 'none', cursor: 'pointer', fontFamily: 'monospace',
                }}
              >
                ↺ Reintentar
              </button>
              {!saved && (
                <button
                  onClick={saveScore}
                  disabled={saving}
                  style={{
                    background: '#1a6b3a', color: '#fff',
                    fontWeight: 700, fontSize: '0.8rem',
                    padding: '0.4rem 1.2rem', borderRadius: '0.375rem',
                    border: `1px solid ${GOLD}`, cursor: saving ? 'default' : 'pointer',
                    fontFamily: 'monospace', opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? '...' : '💾 Guardar'}
                </button>
              )}
              {saved && (
                <span style={{ color: '#4ade80', fontSize: '0.8rem', fontFamily: 'monospace', alignSelf: 'center' }}>
                  ✓ Guardado
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {phase === 'idle' && (
        <div style={{ ...cardStyle, fontSize: '0.7rem', color: 'rgba(245,240,224,0.55)', fontFamily: 'monospace', lineHeight: 1.8 }}>
          <p style={{ color: GOLD, fontWeight: 700, marginBottom: '0.3rem', fontSize: '0.72rem' }}>Cómo jugar</p>
          <p>🏉 Cruzá la línea de in para hacer try</p>
          <p>👆 Tap → saltar tacklers y árbitros</p>
          <p>✊ Hold → agacharse ante el pelotazo</p>
          <p>⚡ Cada try sube la velocidad</p>
        </div>
      )}
    </div>
  )
}
