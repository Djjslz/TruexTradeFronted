import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const TAU = Math.PI * 2

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function random(min, max) {
  return min + Math.random() * (max - min)
}

function withAlpha(color, alpha) {
  if (typeof color !== 'string') return color
  if (color.startsWith('#')) {
    let hex = color.slice(1)
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('')
    }
    if (hex.length === 6) {
      const value = Number.parseInt(hex, 16)
      return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
    }
  }
  return color
}

function resolveColor(value, fallback) {
  if (!value || value === 'currentColor') return fallback
  return value
}

function measureLine(ctx, line, spacing) {
  let width = 0
  for (const char of line) {
    width += ctx.measureText(char).width + spacing
  }
  return Math.max(0, width - spacing)
}

function drawLine(ctx, line, startX, y, spacing) {
  let x = startX
  for (const char of line) {
    ctx.fillText(char, x, y)
    x += ctx.measureText(char).width + spacing
  }
}

function buildText({
  width,
  height,
  dpr,
  text,
  fontFamily,
  fontWeight,
  fontSize,
  letterSpacing,
  lineHeight,
  align,
  colors,
  accentColor,
  glow,
}) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return {
      canvas,
      fontSize: 16,
      box: { left: 0, top: 0, right: width, bottom: height },
    }
  }

  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, width, height)

  const family = fontFamily || "'Outfit', 'Segoe UI', sans-serif"
  const lines = String(text ?? '').split('\n')
  const safeLines = lines.length > 0 ? lines : ['']
  const base = 100

  ctx.font = `${fontWeight} ${base}px ${family}`
  const widthsAtBase = safeLines.map((line) =>
    measureLine(ctx, line, letterSpacing * base),
  )
  const widestBase = Math.max(1, ...widthsAtBase)
  const totalHeightBase = safeLines.length * base * lineHeight
  const maxWidth = width * 0.9
  const maxHeight = height * 0.82

  const fitted =
    fontSize > 0
      ? fontSize
      : base * Math.min(maxWidth / widestBase, maxHeight / totalHeightBase)
  const size = Math.max(8, fitted)

  ctx.font = `${fontWeight} ${size}px ${family}`
  const spacing = letterSpacing * size
  const widths = safeLines.map((line) => measureLine(ctx, line, spacing))
  const totalHeight = safeLines.length * size * lineHeight
  const centerY = height / 2
  const sidePadding = Math.max(2, width * 0.02)

  const starts = widths.map((lineWidth) => {
    if (align === 'left') return sidePadding
    if (align === 'right') return width - sidePadding - lineWidth
    return (width - lineWidth) / 2
  })

  const minX = Math.min(...starts)
  const maxX = Math.max(
    ...starts.map((start, index) => start + widths[index]),
  )
  const top = centerY - totalHeight / 2
  const bottom = centerY + totalHeight / 2

  const frontA = resolveColor(colors?.[0], accentColor)
  const frontB = resolveColor(colors?.[1], frontA)
  const gradient = ctx.createLinearGradient(minX, top, maxX, bottom)
  gradient.addColorStop(0, frontA)
  gradient.addColorStop(1, frontB)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  ctx.save()
  ctx.fillStyle = 'rgba(28, 12, 0, 0.9)'
  ctx.shadowColor = 'rgba(24, 10, 0, 0.5)'
  ctx.shadowBlur = size * 0.2
  ctx.shadowOffsetY = size * 0.04
  safeLines.forEach((line, index) => {
    const y = centerY + (index - (safeLines.length - 1) / 2) * size * lineHeight
    drawLine(ctx, line, starts[index], y, spacing)
  })
  ctx.restore()

  ctx.fillStyle = gradient

  if (glow > 0) {
    ctx.shadowColor = withAlpha(frontB, clamp(glow, 0, 1) * 0.7)
    ctx.shadowBlur = size * 0.45 * clamp(glow, 0, 1)
  }

  safeLines.forEach((line, index) => {
    const y = centerY + (index - (safeLines.length - 1) / 2) * size * lineHeight
    drawLine(ctx, line, starts[index], y, spacing)
  })

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  return {
    canvas,
    fontSize: size,
    box: {
      left: minX - size * 0.08,
      top: top - size * 0.08,
      right: maxX + size * 0.08,
      bottom: bottom + size * 0.08,
    },
  }
}

function buildShards(textCanvas, box, options) {
  const { width, height, dpr, fontSize, shardSize, irregularity } = options
  const cell = clamp(fontSize * shardSize * 2.8, 8, 22)
  const expand = cell * 0.6
  const left = Math.max(0, box.left - expand)
  const top = Math.max(0, box.top - expand)
  const right = Math.min(width, box.right + expand)
  const bottom = Math.min(height, box.bottom + expand)

  if (right <= left || bottom <= top) return []

  const cols = Math.max(1, Math.ceil((right - left) / cell))
  const rows = Math.max(1, Math.ceil((bottom - top) / cell))
  const stepX = (right - left) / cols
  const stepY = (bottom - top) / rows
  const jitter = Math.min(stepX, stepY) * 0.42 * clamp(irregularity, 0, 1)

  const points = []
  for (let row = 0; row <= rows; row += 1) {
    const line = []
    for (let col = 0; col <= cols; col += 1) {
      line.push({
        x: left + col * stepX + random(-jitter, jitter),
        y: top + row * stepY + random(-jitter, jitter),
      })
    }
    points.push(line)
  }

  const triangles = []
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const p00 = points[row][col]
      const p10 = points[row][col + 1]
      const p01 = points[row + 1][col]
      const p11 = points[row + 1][col + 1]
      if (Math.random() < 0.5) {
        triangles.push([p00, p10, p01])
        triangles.push([p10, p11, p01])
      } else {
        triangles.push([p00, p10, p11])
        triangles.push([p00, p11, p01])
      }
    }
  }

  const shards = []

  for (const triangle of triangles) {
    const [a, b, c] = triangle
    const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)))
    const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)))
    const maxX = Math.min(width, Math.ceil(Math.max(a.x, b.x, c.x)))
    const maxY = Math.min(height, Math.ceil(Math.max(a.y, b.y, c.y)))
    const w = maxX - minX
    const h = maxY - minY

    if (w < 2 || h < 2) continue

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.ceil(w * dpr))
    canvas.height = Math.max(1, Math.ceil(h * dpr))

    const ctx = canvas.getContext('2d')
    if (!ctx) continue

    ctx.scale(dpr, dpr)
    ctx.translate(-minX, -minY)
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.lineTo(c.x, c.y)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(textCanvas, 0, 0, width, height)

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let visible = false
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] > 12) {
        visible = true
        break
      }
    }
    if (!visible) continue

    const cx = (a.x + b.x + c.x) / 3
    const cy = (a.y + b.y + c.y) / 3

    shards.push({
      canvas,
      w,
      h,
      originX: cx - minX,
      originY: cy - minY,
      points: [
        { x: a.x - cx, y: a.y - cy },
        { x: b.x - cx, y: b.y - cy },
        { x: c.x - cx, y: c.y - cy },
      ],
      x: cx,
      y: cy,
      px: cx,
      py: cy,
      vx: 0,
      vy: 0,
      rot: 0,
      vrot: 0,
      scale: 1,
      alpha: 1,
      crackX: 0,
      crackY: 0,
      crackRot: 0,
      glint: 0,
      active: false,
      mode: '',
      returnAt: 0,
    })
  }

  return shards
}

const ShatterText = forwardRef(function ShatterText(
  {
    text = 'Intercambia Ahora',
    fontFamily = "'Outfit', 'Segoe UI', sans-serif",
    fontWeight = 800,
    fontSize = 0,
    letterSpacing = 0.01,
    lineHeight = 1.05,
    align = 'center',
    colors = ['#fbbf24', '#e8860c'],
    accentColor = '#ffb45c',
    shardSize = 0.09,
    irregularity = 0.6,
    crack = 0.6,
    crackRadius = 0.5,
    shatter = true,
    shatterRadius = 0.55,
    force = 1,
    spin = 1,
    depth = 1,
    gravity = 0,
    reassemble = 1.1,
    stiffness = 0.55,
    glint = 0.8,
    intro = 'assemble',
    introDuration = 1.6,
    autoplay = false,
    autoplayInterval = 4,
    interactive = true,
    paused = false,
    quality = 1,
    className = '',
    style,
  },
  ref,
) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const stateRef = useRef({
    shards: [],
    visible: true,
    pointer: null,
    width: 0,
    height: 0,
    dpr: 1,
    fontSize: 0,
    textCanvas: null,
    textBox: null,
    ctx: null,
    last: 0,
    lastBurst: 0,
    introUntil: 0,
    reduced: false,
    shatter: null,
    assemble: null,
  })
  const settingsRef = useRef({})

  settingsRef.current = {
    text,
    fontFamily,
    fontWeight,
    fontSize,
    letterSpacing,
    lineHeight,
    align,
    colors,
    accentColor,
    shardSize,
    irregularity,
    crack,
    crackRadius,
    shatter,
    shatterRadius,
    force,
    spin,
    depth,
    gravity,
    reassemble,
    stiffness,
    glint,
    intro,
    introDuration,
    autoplay,
    autoplayInterval,
    interactive,
    paused,
    quality,
  }

  useImperativeHandle(
    ref,
    () => ({
      shatter: (x, y) => stateRef.current.shatter?.(x, y),
      assemble: () => stateRef.current.assemble?.(),
    }),
    [],
  )

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return undefined

    const state = stateRef.current
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    let reduced = motionQuery?.matches ?? false

    let disposed = false
    let raf = 0
    let resizeTimer = 0
    let autoplayTimer = 0

    state.reduced = reduced
    state.visible = true
    state.pointer = null
    state.last = 0
    state.lastBurst = performance.now()
    state.introUntil = 0

    const prepareIntro = (shards, width, height, settings, isReduced) => {
      const now = performance.now()

      if (isReduced || settings.intro === 'none' || settings.paused) {
        state.introUntil = now
        return
      }

      const reach = Math.max(width, height)

      for (const shard of shards) {
        shard.active = true
        shard.mode = 'intro'
        shard.px = shard.x
        shard.py = shard.y
        shard.vx = 0
        shard.vy = 0
        shard.rot = 0
        shard.vrot = 0
        shard.scale = 1
        shard.alpha = 1

        if (settings.intro === 'fade') {
          shard.alpha = 0
          shard.scale = 0.86
        } else if (settings.intro === 'drop') {
          shard.py = shard.y - (height * 0.75 + random(0, height * 0.5))
          shard.rot = random(-0.9, 0.9)
          shard.vrot = random(-2, 2)
        } else {
          const angle = random(0, TAU)
          const distance = reach * random(0.25, 0.7)
          shard.px = shard.x + Math.cos(angle) * distance
          shard.py = shard.y + Math.sin(angle) * distance
          shard.rot = random(-1.5, 1.5)
          shard.vrot = random(-2.5, 2.5)
          shard.scale = random(0.7, 1)
        }
      }

      state.introUntil =
        now + Math.max(0.2, settings.introDuration) * 1000 + 500
    }

    const spring = (shard, dt, k, damping) => {
      const drag = Math.exp(-damping * dt)
      shard.vx = (shard.vx + (shard.x - shard.px) * k * dt) * drag
      shard.vy = (shard.vy + (shard.y - shard.py) * k * dt) * drag
      shard.px += shard.vx * dt
      shard.py += shard.vy * dt
      shard.vrot = (shard.vrot + -shard.rot * k * 0.5 * dt) * drag
      shard.rot += shard.vrot * dt
      shard.scale += (1 - shard.scale) * Math.min(1, 8 * dt)
      shard.alpha += (1 - shard.alpha) * Math.min(1, 8 * dt)
    }

    const settled = (shard) => {
      const distance = Math.hypot(shard.x - shard.px, shard.y - shard.py)
      const speed =
        Math.abs(shard.vx) + Math.abs(shard.vy) + Math.abs(shard.vrot)
      return (
        distance < 0.4 &&
        speed < 6 &&
        Math.abs(shard.rot) < 0.02 &&
        Math.abs(shard.scale - 1) < 0.02 &&
        shard.alpha > 0.99
      )
    }

    const finishShard = (shard) => {
      shard.px = shard.x
      shard.py = shard.y
      shard.vx = 0
      shard.vy = 0
      shard.rot = 0
      shard.vrot = 0
      shard.scale = 1
      shard.alpha = 1
      shard.active = false
      shard.mode = ''
    }

    const updateShard = (shard, dt, now) => {
      if (!shard.active) return false

      const settings = settingsRef.current

      if (shard.mode === 'intro') {
        spring(shard, dt, 70 + settings.stiffness * 120, 7 + settings.stiffness * 4)
        if (settled(shard)) finishShard(shard)
        return true
      }

      if (shard.mode === 'shatter') {
        if (now < shard.returnAt) {
          shard.px += shard.vx * dt
          shard.py += shard.vy * dt
          shard.vy += settings.gravity * 520 * dt
          const drag = Math.exp(-1.4 * dt)
          shard.vx *= drag
          shard.vy *= drag
          shard.rot += shard.vrot * dt
          shard.vrot *= Math.exp(-0.8 * dt)
          shard.scale += (1.1 - shard.scale) * Math.min(1, 3 * dt)
          shard.alpha = 1
        } else {
          spring(
            shard,
            dt,
            55 + settings.stiffness * 230,
            5.5 + settings.stiffness * 8,
          )
          if (settled(shard)) finishShard(shard)
        }
        return true
      }

      return false
    }

    const updateCracks = (dt) => {
      const settings = settingsRef.current
      const pointer = state.pointer
      const radius = Math.max(16, state.fontSize * settings.crackRadius * 1.9)
      let moving = false

      for (const shard of state.shards) {
        let targetX = 0
        let targetY = 0
        let targetRot = 0
        let targetGlint = 0

        if (pointer && settings.crack > 0) {
          const dx = shard.x - pointer.x
          const dy = shard.y - pointer.y
          const distance = Math.hypot(dx, dy)

          if (distance < radius) {
            const influence = 1 - distance / radius
            const nx = distance > 0.001 ? dx / distance : 0
            const ny = distance > 0.001 ? dy / distance : 0
            const push = influence * influence * (0.4 + settings.crack * 1.6)
            targetX = nx * push
            targetY = ny * push
            targetRot = nx * influence * settings.crack * 0.012
            targetGlint = influence * settings.crack
          }
        }

        const ease = Math.min(1, 16 * dt)
        shard.crackX += (targetX - shard.crackX) * ease
        shard.crackY += (targetY - shard.crackY) * ease
        shard.crackRot += (targetRot - shard.crackRot) * ease
        shard.glint += (targetGlint - shard.glint) * ease

        if (
          Math.abs(targetX - shard.crackX) > 0.01 ||
          Math.abs(targetY - shard.crackY) > 0.01 ||
          Math.abs(targetRot - shard.crackRot) > 0.002 ||
          Math.abs(targetGlint - shard.glint) > 0.005
        ) {
          moving = true
        }
      }

      return moving
    }

    const draw = () => {
      const ctx = state.ctx
      if (!ctx) return

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0)

      if (reduced || settingsRef.current.paused) {
        if (state.textCanvas) {
          ctx.drawImage(state.textCanvas, 0, 0, state.width, state.height)
        }
        return
      }

      const settings = settingsRef.current

      for (const shard of state.shards) {
        ctx.save()
        ctx.globalAlpha = shard.alpha
        ctx.translate(shard.px + shard.crackX, shard.py + shard.crackY)
        ctx.rotate(shard.rot + shard.crackRot)
        ctx.scale(shard.scale, shard.scale)

        const [p0, p1, p2] = shard.points
        const moving =
          shard.active ||
          shard.glint > 0.02 ||
          Math.abs(shard.rot) > 0.01

        if (Math.cos(shard.rot) < 0) {
          ctx.beginPath()
          ctx.moveTo(p0.x, p0.y)
          ctx.lineTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.closePath()
          ctx.fillStyle = settings.accentColor
          ctx.fill()
          if (moving) {
            ctx.strokeStyle = withAlpha('#ffffff', 0.18)
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        } else {
          ctx.drawImage(
            shard.canvas,
            -shard.originX,
            -shard.originY,
            shard.w,
            shard.h,
          )

          if (shard.glint > 0.02) {
            ctx.beginPath()
            ctx.moveTo(p0.x, p0.y)
            ctx.lineTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.closePath()
            ctx.fillStyle = withAlpha('#ffffff', shard.glint * 0.2)
            ctx.fill()
          }

          if (moving) {
            ctx.beginPath()
            ctx.moveTo(p0.x, p0.y)
            ctx.lineTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.closePath()
            ctx.strokeStyle = withAlpha('#ffffff', 0.12)
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }

        ctx.restore()
      }
    }

    const triggerShatter = (x, y, now = performance.now()) => {
      const settings = settingsRef.current
      if (!state.shards.length) return

      const radius = Math.max(22, state.fontSize * settings.shatterRadius * 2.2)
      const cx = Number.isFinite(x) ? x : state.width * random(0.3, 0.7)
      const cy = Number.isFinite(y) ? y : state.height * random(0.35, 0.65)
      let affected = 0

      for (const shard of state.shards) {
        const dx = shard.x - cx
        const dy = shard.y - cy
        const distance = Math.hypot(dx, dy)

        if (distance > radius * 2.4) continue

        const influence = clamp(1 - distance / (radius * 2.4), 0, 1)
        const angle = distance > 0.001 ? Math.atan2(dy, dx) : random(0, TAU)
        const power =
          (60 + settings.force * 280) *
          (0.35 + influence) *
          random(0.75, 1.25)

        shard.vx = Math.cos(angle) * power + random(-30, 30)
        shard.vy = Math.sin(angle) * power - random(10, 80)
        shard.vrot =
          random(-1, 1) * (3 + settings.spin * 9) * (0.5 + influence)
        shard.scale =
          random(0.95, 1.15) * (1 + settings.depth * 0.2 * influence)
        shard.returnAt =
          now + Math.max(0.1, settings.reassemble) * 1000 + random(0, 200)
        shard.active = true
        shard.mode = 'shatter'
        affected += 1
      }

      if (affected > 0) {
        state.lastBurst = now
        wake()
      }
    }

    const wake = () => {
      const settings = settingsRef.current
      if (disposed || reduced || settings.paused || !state.visible) return
      if (raf) return
      state.last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const frame = (now) => {
      raf = 0
      if (disposed || !state.visible) return

      const settings = settingsRef.current
      if (reduced || settings.paused) {
        draw()
        return
      }

      const dt = clamp((now - state.last) / 1000, 0, 1 / 30)
      state.last = now
      let moving = false

      for (const shard of state.shards) {
        if (updateShard(shard, dt, now)) moving = true
      }

      if (updateCracks(dt)) moving = true

      draw()

      if (moving && !disposed && state.visible) {
        raf = requestAnimationFrame(frame)
      }
    }

    const build = () => {
      if (disposed) return

      cancelAnimationFrame(raf)
      raf = 0
      window.clearTimeout(resizeTimer)

      const rect = root.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      const settings = settingsRef.current
      const pixelRatio = clamp(
        (window.devicePixelRatio || 1) * clamp(settings.quality, 0.5, 1),
        0.5,
        2.5,
      )

      canvas.width = Math.max(1, Math.round(width * pixelRatio))
      canvas.height = Math.max(1, Math.round(height * pixelRatio))

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      const textLayer = buildText({
        width,
        height,
        dpr: pixelRatio,
        text: settings.text,
        fontFamily: settings.fontFamily,
        fontWeight: settings.fontWeight,
        fontSize: settings.fontSize,
        letterSpacing: settings.letterSpacing,
        lineHeight: settings.lineHeight,
        align: settings.align,
        colors: settings.colors,
        accentColor: settings.accentColor,
        glow: settings.glint,
      })

      const shards = buildShards(textLayer.canvas, textLayer.box, {
        width,
        height,
        dpr: pixelRatio,
        fontSize: textLayer.fontSize,
        shardSize: settings.shardSize,
        irregularity: settings.irregularity,
      })

      state.width = width
      state.height = height
      state.dpr = pixelRatio
      state.ctx = ctx
      state.textCanvas = textLayer.canvas
      state.textBox = textLayer.box
      state.fontSize = textLayer.fontSize
      state.shards = shards
      state.pointer = null
      state.lastBurst = performance.now()

      prepareIntro(shards, width, height, settings, reduced)
      draw()

      if (!reduced && !settings.paused) wake()
    }

    const checkAutoplay = () => {
      const settings = settingsRef.current

      if (
        disposed ||
        reduced ||
        settings.paused ||
        !settings.autoplay ||
        !state.visible ||
        document.hidden
      ) {
        return
      }

      if (state.pointer) {
        state.lastBurst = performance.now()
        return
      }

      const busy = state.shards.some(
        (shard) => shard.active && shard.mode === 'shatter',
      )
      if (busy) return

      const interval = Math.max(1, settings.autoplayInterval) * 1000
      if (performance.now() - state.lastBurst < interval) return

      const box = state.textBox
      triggerShatter(
        box ? random(box.left, box.right) : state.width / 2,
        box ? random(box.top, box.bottom) : state.height / 2,
      )
    }

    const onPointerMove = (event) => {
      if (!settingsRef.current.interactive) return

      const rect = root.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height

      if (inside) {
        state.pointer = { x, y }
        wake()
        return
      }

      if (state.pointer) {
        state.pointer = null
        wake()
      }
    }

    const onPointerDown = (event) => {
      const settings = settingsRef.current
      if (!settings.interactive || !settings.shatter) return

      const rect = root.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return

      triggerShatter(x, y)
    }

    const onPointerLeave = () => {
      if (!state.pointer) return
      state.pointer = null
      wake()
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
        return
      }
      wake()
    }

    const onReducedChange = () => {
      reduced = motionQuery?.matches ?? false
      state.reduced = reduced
      build()
    }

    let resizeObserver = null
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver((entries) => {
        const box = entries[0]?.contentRect
        if (
          box &&
          Math.abs(box.width - state.width) < 1 &&
          Math.abs(box.height - state.height) < 1
        ) {
          return
        }
        window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(() => {
          if (!disposed) build()
        }, 120)
      })
      resizeObserver.observe(root)
    }

    let visibilityObserver = null
    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          state.visible = entry.isIntersecting
          if (!state.visible) {
            cancelAnimationFrame(raf)
            raf = 0
          } else {
            wake()
          }
        },
        { threshold: 0.05 },
      )
      visibilityObserver.observe(root)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibilityChange)
    motionQuery?.addEventListener?.('change', onReducedChange)

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) build()
      })
    }

    autoplayTimer = window.setInterval(checkAutoplay, 400)

    state.shatter = (x, y) => triggerShatter(x, y)
    state.assemble = () => {
      prepareIntro(
        state.shards,
        state.width,
        state.height,
        settingsRef.current,
        reduced,
      )
      draw()
      wake()
    }

    build()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.clearInterval(autoplayTimer)
      resizeObserver?.disconnect()
      visibilityObserver?.disconnect()
      motionQuery?.removeEventListener?.('change', onReducedChange)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      state.shatter = null
      state.assemble = null
      state.shards = []
      state.ctx = null
      state.textCanvas = null
    }
  }, [
    text,
    fontFamily,
    fontWeight,
    fontSize,
    letterSpacing,
    lineHeight,
    align,
    colors?.[0],
    colors?.[1],
    accentColor,
    shardSize,
    irregularity,
    crack,
    crackRadius,
    shatter,
    shatterRadius,
    force,
    spin,
    depth,
    gravity,
    reassemble,
    stiffness,
    glint,
    intro,
    introDuration,
    autoplay,
    autoplayInterval,
    interactive,
    paused,
    quality,
  ])

  return (
    <div
      ref={rootRef}
      className={['shatter-text', className].filter(Boolean).join(' ')}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="shatter-text__canvas"
        aria-hidden="true"
      />
      <span className="sr-only">{text}</span>
    </div>
  )
})

export default ShatterText
