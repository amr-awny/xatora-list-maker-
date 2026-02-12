"use client"

import { ArrowLeft, Download, Loader2, Calendar, User, Clock, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScrimList } from "@/lib/types"
import { useState, useRef, useEffect, useCallback } from "react"

interface PreviewScreenProps {
  list: ScrimList
  onBack: () => void
}

// Seeded random for consistent star/particle positions
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

// Load a Google Font via FontFace API for canvas rendering
async function loadCanvasFont(family: string, url: string, weight = "400"): Promise<void> {
  try {
    const font = new FontFace(family, `url(${url})`, { weight, style: "normal" })
    const loaded = await font.load()
    document.fonts.add(loaded)
  } catch {
    // Font loading failed, will fall back to system fonts
  }
}

const FONT_URLS = {
  rajdhani700: "https://fonts.gstatic.com/s/rajdhani/v15/LDI2apCSOBg7S-QT7pasEfOqeefkkbg.woff2",
  rajdhani600: "https://fonts.gstatic.com/s/rajdhani/v15/LDI2apCSOBg7S-QT7pb0EPOqeefkkbg.woff2",
  orbitron700: "https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nysimBpC-R.woff2",
  orbitron900: "https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nosSmBpC-R.woff2",
}

export function PreviewScreen({ list, onBack }: PreviewScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const animRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const logoImagesRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const [fontsLoaded, setFontsLoaded] = useState(false)

  const CANVAS_W = 1080
  const CANVAS_H = 1440
  const TOTAL_DURATION = 4500
  const TEAM_STAGGER = 120

  // Load canvas fonts
  useEffect(() => {
    Promise.all([
      loadCanvasFont("Rajdhani", FONT_URLS.rajdhani700, "700"),
      loadCanvasFont("Rajdhani", FONT_URLS.rajdhani600, "600"),
      loadCanvasFont("Orbitron", FONT_URLS.orbitron700, "700"),
      loadCanvasFont("Orbitron", FONT_URLS.orbitron900, "900"),
    ]).then(() => setFontsLoaded(true))
  }, [])

  // Stars
  const starsRef = useRef(
    Array.from({ length: 180 }, (_, i) => ({
      x: seededRandom(i * 7 + 1),
      y: seededRandom(i * 13 + 3),
      size: seededRandom(i * 19 + 5) * 2.5 + 0.3,
      brightness: seededRandom(i * 31 + 7),
      twinkleSpeed: seededRandom(i * 43 + 11) * 2 + 1,
    }))
  )

  // Particle dust
  const dustRef = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      x: seededRandom(i * 17 + 2),
      y: seededRandom(i * 23 + 5),
      size: seededRandom(i * 37 + 9) * 3 + 1,
      speed: seededRandom(i * 41 + 13) * 0.5 + 0.2,
      alpha: seededRandom(i * 53 + 17) * 0.3 + 0.1,
    }))
  )

  const FONT_HEADING = fontsLoaded ? "Rajdhani" : "system-ui, sans-serif"
  const FONT_LABEL = fontsLoaded ? "Orbitron" : "system-ui, sans-serif"

  const drawFrame = useCallback(
    (ctx: CanvasRenderingContext2D, progress: number, time: number) => {
      const w = CANVAS_W
      const h = CANVAS_H

      // ========== BACKGROUND: Deep cosmic ===========
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.25, 0, w * 0.5, h * 0.5, h * 0.95)
      bgGrad.addColorStop(0, "#1e0a45")
      bgGrad.addColorStop(0.25, "#130630")
      bgGrad.addColorStop(0.55, "#0a031c")
      bgGrad.addColorStop(1, "#040110")
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      // Nebula clouds
      const drawNebula = (cx: number, cy: number, r: number, color: string) => {
        const ng = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        ng.addColorStop(0, color)
        ng.addColorStop(0.6, color.replace(/[\d.]+\)$/, "0.02)"))
        ng.addColorStop(1, "transparent")
        ctx.fillStyle = ng
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
      }
      drawNebula(w * 0.15, h * 0.12, 400, "rgba(120, 40, 200, 0.08)")
      drawNebula(w * 0.85, h * 0.55, 450, "rgba(80, 20, 180, 0.06)")
      drawNebula(w * 0.5, h * 0.85, 350, "rgba(160, 60, 240, 0.05)")
      drawNebula(w * 0.8, h * 0.15, 250, "rgba(200, 100, 255, 0.04)")
      drawNebula(w * 0.3, h * 0.65, 300, "rgba(100, 30, 180, 0.05)")

      // Stars
      starsRef.current.forEach((star) => {
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.001 * star.twinkleSpeed + star.brightness * 10))
        const alpha = star.brightness * twinkle * Math.min(1, progress * 4)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2)
        ctx.fill()
        // Bright star cross glow
        if (star.size > 2) {
          ctx.save()
          ctx.globalAlpha = alpha * 0.3
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 0.5
          const sx = star.x * w
          const sy = star.y * h
          const gl = star.size * 3
          ctx.beginPath()
          ctx.moveTo(sx - gl, sy)
          ctx.lineTo(sx + gl, sy)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(sx, sy - gl)
          ctx.lineTo(sx, sy + gl)
          ctx.stroke()
          ctx.restore()
        }
      })

      // Floating dust particles
      dustRef.current.forEach((dust) => {
        const dx = ((dust.x * w + time * dust.speed * 0.02) % (w + 20)) - 10
        const dy = dust.y * h + Math.sin(time * 0.001 + dust.x * 10) * 15
        ctx.fillStyle = `rgba(180, 140, 255, ${dust.alpha * Math.min(1, progress * 3)})`
        ctx.beginPath()
        ctx.arc(dx, dy, dust.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Wide diagonal light beams
      const beamOffset = Math.sin(time * 0.0004) * 40
      ctx.save()
      ctx.globalAlpha = 0.04 * Math.min(1, progress * 2)
      const beam1 = ctx.createLinearGradient(0, 100 + beamOffset, w, h * 0.6 + beamOffset)
      beam1.addColorStop(0, "transparent")
      beam1.addColorStop(0.3, "rgba(140, 60, 255, 0.5)")
      beam1.addColorStop(0.7, "rgba(140, 60, 255, 0.5)")
      beam1.addColorStop(1, "transparent")
      ctx.strokeStyle = beam1
      ctx.lineWidth = 200
      ctx.beginPath()
      ctx.moveTo(-100, 100 + beamOffset)
      ctx.lineTo(w + 100, h * 0.6 + beamOffset)
      ctx.stroke()
      ctx.restore()

      ctx.save()
      ctx.globalAlpha = 0.025 * Math.min(1, progress * 2)
      const beam2 = ctx.createLinearGradient(w, 200 - beamOffset, 0, h * 0.8 - beamOffset)
      beam2.addColorStop(0, "transparent")
      beam2.addColorStop(0.3, "rgba(245, 158, 11, 0.4)")
      beam2.addColorStop(0.7, "rgba(245, 158, 11, 0.4)")
      beam2.addColorStop(1, "transparent")
      ctx.strokeStyle = beam2
      ctx.lineWidth = 150
      ctx.beginPath()
      ctx.moveTo(w + 100, 200 - beamOffset)
      ctx.lineTo(-100, h * 0.8 - beamOffset)
      ctx.stroke()
      ctx.restore()

      // =========== HEADER AREA ===========
      const headerProgress = Math.min(1, progress * 4)
      const headerAlpha = headerProgress
      const headerSlide = (1 - headerProgress) * -30

      ctx.save()
      ctx.globalAlpha = headerAlpha

      // Header background panel with gradient
      const hpGrad = ctx.createLinearGradient(0, 0, w, 200)
      hpGrad.addColorStop(0, "rgba(12, 4, 30, 0.9)")
      hpGrad.addColorStop(0.5, "rgba(25, 10, 60, 0.7)")
      hpGrad.addColorStop(1, "rgba(12, 4, 30, 0.9)")
      ctx.fillStyle = hpGrad
      ctx.fillRect(0, 0, w, 200)

      // Header bottom gold line with glow
      const goldLine = ctx.createLinearGradient(0, 0, w, 0)
      goldLine.addColorStop(0, "transparent")
      goldLine.addColorStop(0.1, "rgba(245, 158, 11, 0.05)")
      goldLine.addColorStop(0.3, "rgba(245, 158, 11, 0.8)")
      goldLine.addColorStop(0.5, "#fbbf24")
      goldLine.addColorStop(0.7, "rgba(245, 158, 11, 0.8)")
      goldLine.addColorStop(0.9, "rgba(245, 158, 11, 0.05)")
      goldLine.addColorStop(1, "transparent")
      ctx.fillStyle = goldLine
      ctx.fillRect(0, 196, w, 3)

      // Gold line glow
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.shadowColor = "#fbbf24"
      ctx.shadowBlur = 20
      ctx.fillStyle = goldLine
      ctx.fillRect(0, 196, w, 3)
      ctx.restore()

      // List name - large centered
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = `900 72px ${FONT_LABEL}, sans-serif`
      ctx.shadowColor = "rgba(245, 180, 11, 0.7)"
      ctx.shadowBlur = 30
      ctx.fillStyle = "#fcd34d"
      const title = (list.name || "SCRIM LIST").toUpperCase()
      ctx.fillText(title, w / 2, 72 + headerSlide, w - 100)
      // Double pass for extra glow
      ctx.shadowBlur = 15
      ctx.fillText(title, w / 2, 72 + headerSlide, w - 100)
      ctx.shadowBlur = 0

      // Organizer info - left aligned, stylized
      ctx.textAlign = "left"
      ctx.textBaseline = "alphabetic"
      const infoY = 130 + headerSlide
      const infoX = 40

      if (list.organizerName) {
        ctx.font = `700 20px ${FONT_HEADING}, sans-serif`
        ctx.fillStyle = "#a78bfa"
        ctx.fillText("ORGANIZER :", infoX, infoY)
        ctx.fillStyle = "#e8e0ff"
        ctx.font = `600 20px ${FONT_HEADING}, sans-serif`
        ctx.fillText(list.organizerName.toUpperCase(), infoX + 145, infoY)
      }

      if (list.scrimTime) {
        ctx.font = `700 18px ${FONT_HEADING}, sans-serif`
        ctx.fillStyle = "#a78bfa"
        ctx.fillText("TIME :", infoX, infoY + 28)
        ctx.fillStyle = "#e8e0ff"
        ctx.font = `600 18px ${FONT_HEADING}, sans-serif`
        ctx.fillText(list.scrimTime, infoX + 70, infoY + 28)
      }

      if (list.date) {
        const dateStr = new Date(list.date + "T00:00:00").toLocaleDateString("en-US", {
          year: "numeric", month: "short", day: "numeric",
        })
        ctx.font = `700 18px ${FONT_HEADING}, sans-serif`
        ctx.fillStyle = "#a78bfa"
        const dateX = list.scrimTime ? infoX + 250 : infoX
        ctx.fillText("DATE :", dateX, infoY + 28)
        ctx.fillStyle = "#e8e0ff"
        ctx.font = `600 18px ${FONT_HEADING}, sans-serif`
        ctx.fillText(dateStr, dateX + 65, infoY + 28)
      }

      ctx.restore()

      // =========== TEAM SLOTS GRID ===========
      const gridStartY = 220
      const gridPadX = 28
      const gridGap = 12
      const cols = 5
      const totalSlots = Math.max(list.teams.length, 25)
      const rows = Math.ceil(totalSlots / cols)

      const cellW = (w - gridPadX * 2 - (cols - 1) * gridGap) / cols
      const availH = h - gridStartY - 40
      const cellH = Math.min((availH - (rows - 1) * gridGap) / rows, 210)
      const slotLabelH = 30

      for (let slotIdx = 0; slotIdx < totalSlots; slotIdx++) {
        const col = slotIdx % cols
        const row = Math.floor(slotIdx / cols)
        const team = list.teams[slotIdx] || null

        // Stagger animation
        const teamDelay = (slotIdx * TEAM_STAGGER) / TOTAL_DURATION
        const teamProgress = Math.max(0, Math.min(1, (progress - teamDelay) * 4))
        if (teamProgress <= 0) continue

        const cx = gridPadX + col * (cellW + gridGap)
        const cy = gridStartY + row * (cellH + gridGap)

        ctx.save()
        ctx.globalAlpha = teamProgress

        // Scale-in effect
        const scale = 0.8 + teamProgress * 0.2
        const centerX = cx + cellW / 2
        const centerY = cy + cellH / 2
        ctx.translate(centerX, centerY)
        ctx.scale(scale, scale)
        ctx.translate(-centerX, -centerY)

        const isGoldSlot = row === 0
        const purpleColor = "rgba(140, 70, 255,"
        const goldColor = "rgba(245, 180, 40,"

        // ---- Slot Label ----
        const labelGrad = ctx.createLinearGradient(cx, cy, cx + cellW, cy + slotLabelH)
        if (isGoldSlot) {
          labelGrad.addColorStop(0, "rgba(160, 120, 20, 0.7)")
          labelGrad.addColorStop(0.5, "rgba(200, 160, 40, 0.5)")
          labelGrad.addColorStop(1, "rgba(120, 80, 10, 0.6)")
        } else {
          labelGrad.addColorStop(0, `${purpleColor} 0.5)`)
          labelGrad.addColorStop(0.5, `${purpleColor} 0.35)`)
          labelGrad.addColorStop(1, `${purpleColor} 0.5)`)
        }
        ctx.fillStyle = labelGrad
        roundRect(ctx, cx, cy, cellW, slotLabelH, 8, 8, 0, 0)
        ctx.fill()

        // Label text
        ctx.font = `700 13px ${FONT_LABEL}, monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = isGoldSlot ? "#fde68a" : "#c4b5fd"
        ctx.shadowColor = isGoldSlot ? "rgba(245, 180, 11, 0.6)" : "rgba(140, 80, 255, 0.6)"
        ctx.shadowBlur = 8
        ctx.fillText(`SLOT:${slotIdx + 1}`, cx + cellW / 2, cy + slotLabelH / 2 + 1)
        ctx.shadowBlur = 0

        // ---- Card Body ----
        const cardY = cy + slotLabelH
        const cardH = cellH - slotLabelH

        // Card dark glass background
        const cardBg = ctx.createLinearGradient(cx, cardY, cx + cellW, cardY + cardH)
        cardBg.addColorStop(0, "rgba(16, 6, 35, 0.95)")
        cardBg.addColorStop(0.3, "rgba(22, 10, 48, 0.92)")
        cardBg.addColorStop(0.7, "rgba(18, 8, 40, 0.92)")
        cardBg.addColorStop(1, "rgba(12, 4, 28, 0.95)")
        ctx.fillStyle = cardBg
        roundRect(ctx, cx, cardY, cellW, cardH, 0, 0, 8, 8)
        ctx.fill()

        // Card gradient border
        const borderGrad = ctx.createLinearGradient(cx, cardY, cx + cellW, cardY + cardH)
        if (isGoldSlot) {
          borderGrad.addColorStop(0, `${goldColor} 0.5)`)
          borderGrad.addColorStop(0.5, `${goldColor} 0.15)`)
          borderGrad.addColorStop(1, `${goldColor} 0.4)`)
        } else {
          borderGrad.addColorStop(0, `${purpleColor} 0.5)`)
          borderGrad.addColorStop(0.5, `${purpleColor} 0.1)`)
          borderGrad.addColorStop(1, `${purpleColor} 0.4)`)
        }
        ctx.strokeStyle = borderGrad
        ctx.lineWidth = 1.5
        roundRect(ctx, cx, cardY, cellW, cardH, 0, 0, 8, 8)
        ctx.stroke()

        // ---- Diagonal Light Streaks (animated) ----
        ctx.save()
        roundRect(ctx, cx, cardY, cellW, cardH, 0, 0, 8, 8)
        ctx.clip()

        const streakPhase = (time * 0.0006 + slotIdx * 0.8) % 4
        const streakBaseColor = isGoldSlot
          ? "rgba(245, 200, 60,"
          : "rgba(160, 90, 255,"

        for (let s = 0; s < 4; s++) {
          const sPhase = (streakPhase + s * 0.5) % 4
          const sAlpha = Math.max(0, 1 - Math.abs(sPhase - 2) * 0.5) * 0.15
          if (sAlpha < 0.01) continue

          ctx.save()
          ctx.globalAlpha = sAlpha * teamProgress
          const streakOffset = (sPhase / 4) * (cellW + cellH)
          ctx.translate(cx + streakOffset - cellH * 0.3, cardY)
          ctx.rotate(Math.PI * 0.2)

          const sw = 6 + s * 5
          const sg = ctx.createLinearGradient(-sw / 2, 0, sw / 2, 0)
          sg.addColorStop(0, "transparent")
          sg.addColorStop(0.5, `${streakBaseColor} 1)`)
          sg.addColorStop(1, "transparent")
          ctx.fillStyle = sg
          ctx.fillRect(-sw / 2, -30, sw, cardH + 80)
          ctx.restore()
        }

        // Inner shine at top of card
        const shineGrad = ctx.createLinearGradient(cx, cardY, cx, cardY + 30)
        shineGrad.addColorStop(0, isGoldSlot ? "rgba(255, 220, 80, 0.08)" : "rgba(180, 120, 255, 0.06)")
        shineGrad.addColorStop(1, "transparent")
        ctx.fillStyle = shineGrad
        ctx.fillRect(cx, cardY, cellW, 30)

        // Bottom glow bar
        const glowBar = ctx.createLinearGradient(cx, cardY + cardH - 6, cx + cellW, cardY + cardH - 6)
        const glowC = isGoldSlot ? "rgba(245, 180, 40," : "rgba(160, 80, 255,"
        glowBar.addColorStop(0, "transparent")
        glowBar.addColorStop(0.2, `${glowC} 0.2)`)
        glowBar.addColorStop(0.5, `${glowC} 0.6)`)
        glowBar.addColorStop(0.8, `${glowC} 0.2)`)
        glowBar.addColorStop(1, "transparent")
        ctx.fillStyle = glowBar
        ctx.fillRect(cx, cardY + cardH - 5, cellW, 5)

        ctx.restore() // unclip

        // ---- Team Content ----
        ctx.textBaseline = "alphabetic"
        if (team) {
          const logoImg = logoImagesRef.current.get(team.id)
          const contentCx = cx + cellW / 2

          if (logoImg) {
            const logoSize = Math.min(cellW - 24, cardH - 50)
            const logoX = contentCx - logoSize / 2
            const logoY = cardY + 10
            ctx.save()
            roundRect(ctx, logoX, logoY, logoSize, logoSize, 6, 6, 6, 6)
            ctx.clip()
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
            ctx.restore()

            // Team name below logo
            ctx.font = `700 14px ${FONT_HEADING}, sans-serif`
            ctx.textAlign = "center"
            ctx.fillStyle = isGoldSlot ? "#fde68a" : "#e8e0ff"
            ctx.shadowColor = isGoldSlot ? "rgba(245, 180, 11, 0.5)" : "rgba(140, 80, 255, 0.5)"
            ctx.shadowBlur = 6
            ctx.fillText((team.name || `TEAM ${slotIdx + 1}`).toUpperCase(), contentCx, cardY + cardH - 10, cellW - 12)
            ctx.shadowBlur = 0
          } else {
            // No logo - team name centered
            ctx.font = `700 16px ${FONT_HEADING}, sans-serif`
            ctx.textAlign = "center"
            ctx.fillStyle = isGoldSlot ? "#fde68a" : "#e8e0ff"
            ctx.shadowColor = isGoldSlot ? "rgba(245, 180, 11, 0.4)" : "rgba(140, 80, 255, 0.4)"
            ctx.shadowBlur = 5
            ctx.fillText((team.name || `TEAM ${slotIdx + 1}`).toUpperCase(), contentCx, cardY + cardH / 2 - 4, cellW - 14)
            ctx.shadowBlur = 0

            // Members
            ctx.font = `500 11px ${FONT_HEADING}, sans-serif`
            ctx.fillStyle = "rgba(200, 190, 225, 0.7)"
            const members = team.members.filter((m) => m.name.trim())
            members.slice(0, 4).forEach((m, mi) => {
              ctx.fillText(m.name, contentCx, cardY + cardH / 2 + 16 + mi * 16, cellW - 16)
            })
            if (members.length > 4) {
              ctx.fillStyle = "rgba(180, 160, 210, 0.5)"
              ctx.fillText(`+${members.length - 4} more`, contentCx, cardY + cardH / 2 + 16 + 4 * 16)
            }
          }
        } else {
          // Empty slot
          ctx.font = `700 16px ${FONT_HEADING}, sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillStyle = "rgba(100, 80, 140, 0.35)"
          ctx.fillText("EMPTY", cx + cellW / 2, cardY + cardH / 2)
          ctx.textBaseline = "alphabetic"
        }

        ctx.restore()
      }

      // =========== OUTER FRAME ===========
      // Double border glow
      ctx.save()
      ctx.globalAlpha = Math.min(1, progress * 2) * 0.5
      const frameGrad = ctx.createLinearGradient(0, 0, w, h)
      frameGrad.addColorStop(0, "rgba(140, 60, 255, 0.6)")
      frameGrad.addColorStop(0.3, "rgba(245, 158, 11, 0.3)")
      frameGrad.addColorStop(0.7, "rgba(140, 60, 255, 0.4)")
      frameGrad.addColorStop(1, "rgba(245, 158, 11, 0.5)")
      ctx.strokeStyle = frameGrad
      ctx.lineWidth = 3
      roundRect(ctx, 2, 2, w - 4, h - 4, 14, 14, 14, 14)
      ctx.stroke()
      ctx.restore()

      // Inner thin frame
      ctx.save()
      ctx.globalAlpha = Math.min(1, progress * 2) * 0.15
      ctx.strokeStyle = "rgba(200, 180, 255, 0.4)"
      ctx.lineWidth = 1
      roundRect(ctx, 6, 6, w - 12, h - 12, 12, 12, 12, 12)
      ctx.stroke()
      ctx.restore()

      // Corner accent flares
      const flareAlpha = Math.min(1, progress * 2) * 0.4
      const drawCornerFlare = (fx: number, fy: number) => {
        const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 60)
        fg.addColorStop(0, `rgba(245, 200, 60, ${flareAlpha * 0.8})`)
        fg.addColorStop(0.3, `rgba(245, 180, 40, ${flareAlpha * 0.3})`)
        fg.addColorStop(1, "transparent")
        ctx.fillStyle = fg
        ctx.fillRect(fx - 60, fy - 60, 120, 120)
      }
      drawCornerFlare(12, 12)
      drawCornerFlare(w - 12, 12)
      drawCornerFlare(12, h - 12)
      drawCornerFlare(w - 12, h - 12)

      // =========== FOOTER ===========
      const footerProgress = Math.min(1, Math.max(0, (progress - 0.5) * 3))
      if (footerProgress > 0) {
        ctx.save()
        ctx.globalAlpha = footerProgress * 0.35
        ctx.font = `600 13px ${FONT_LABEL}, monospace`
        ctx.fillStyle = "#8b5cf6"
        ctx.textAlign = "center"
        ctx.textBaseline = "alphabetic"
        ctx.fillText("SCRIM LIST GENERATOR", w / 2, h - 14)
        ctx.restore()
      }
    },
    [list, TOTAL_DURATION, TEAM_STAGGER, FONT_HEADING, FONT_LABEL]
  )

  // Preload team logos - for GIFs, we use visible-but-hidden img elements
  // so the browser keeps animating them, allowing drawImage to capture current frame
  useEffect(() => {
    const currentIds = new Set(list.teams.map((t) => t.id))

    list.teams.forEach((team) => {
      if (!team.logoUrl) return
      // Check if we already have this logo loaded with the same URL
      const existingImg = logoImagesRef.current.get(team.id)
      if (existingImg && existingImg.src === team.logoUrl) return

      // Remove old image if URL changed
      if (existingImg) {
        existingImg.remove()
        logoImagesRef.current.delete(team.id)
      }

      const img = document.createElement("img")
      // Only set crossOrigin for non-data URLs to avoid CORS issues
      if (!team.logoUrl.startsWith("data:")) {
        img.crossOrigin = "anonymous"
      }
      img.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;pointer-events:none;opacity:0.01;"
      img.onload = () => {
        logoImagesRef.current.set(team.id, img)
      }
      img.onerror = () => {
        // Logo failed to load - team will render without logo
      }
      img.src = team.logoUrl
      // Append to DOM so browser animates GIFs
      document.body.appendChild(img)
    })

    // Cleanup stale logos (teams that were removed)
    logoImagesRef.current.forEach((img, id) => {
      if (!currentIds.has(id)) {
        img.remove()
        logoImagesRef.current.delete(id)
      }
    })
  }, [list.teams])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      logoImagesRef.current.forEach((img) => img.remove())
    }
  }, [])

  // Preview animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    startTimeRef.current = performance.now()

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTimeRef.current
      const loopDuration = TOTAL_DURATION + 2500
      const loopElapsed = elapsed % loopDuration
      const progress = Math.min(1, loopElapsed / TOTAL_DURATION)
      drawFrame(ctx, progress, timestamp)
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [drawFrame, TOTAL_DURATION])

  // ========= GIF GENERATION =========
  const handleGenerateGif = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      const { GIFEncoder, quantize, applyPalette } = await import("gifenc")

      // Use a smaller canvas for GIF to keep file size reasonable
      const GIF_W = 640
      const GIF_H = 854

      const offscreen = document.createElement("canvas")
      offscreen.width = GIF_W
      offscreen.height = GIF_H
      const offCtx = offscreen.getContext("2d", { willReadFrequently: true })
      if (!offCtx) throw new Error("Canvas context not available")

      // Full-res canvas for drawing, then scale down
      const drawCanvas = document.createElement("canvas")
      drawCanvas.width = CANVAS_W
      drawCanvas.height = CANVAS_H
      const drawCtx = drawCanvas.getContext("2d")
      if (!drawCtx) throw new Error("Draw canvas context not available")

      const fps = 12
      const durationSec = 4
      const holdSec = 2
      const totalAnimFrames = fps * durationSec
      const holdFrames = fps * holdSec
      const totalFrames = totalAnimFrames + holdFrames
      const frameDelayMs = Math.round(1000 / fps)
      // GIF delay is in centiseconds (1/100th of a second)
      const gifDelay = Math.round(frameDelayMs / 10)

      const gif = GIFEncoder()

      const waitFrame = () => new Promise<void>((r) => setTimeout(r, 0))

      // Encode animation frames
      for (let i = 0; i <= totalAnimFrames; i++) {
        const progress = Math.min(1, i / (totalAnimFrames * 0.8))
        const fakeTime = i * (1000 / fps)

        drawFrame(drawCtx, progress, fakeTime)
        offCtx.clearRect(0, 0, GIF_W, GIF_H)
        offCtx.drawImage(drawCanvas, 0, 0, GIF_W, GIF_H)

        const imageData = offCtx.getImageData(0, 0, GIF_W, GIF_H)
        const rgba = imageData.data

        // Quantize to 256-color palette
        const palette = quantize(rgba, 256, { format: "rgb444" })
        const index = applyPalette(rgba, palette, "rgb444")

        gif.writeFrame(index, GIF_W, GIF_H, {
          palette,
          delay: gifDelay,
          repeat: 0,
        })

        setGenerationProgress(Math.round((i / totalFrames) * 80))
        if (i % 4 === 0) await waitFrame()
      }

      // Hold on final frame
      for (let i = 0; i < holdFrames; i++) {
        const fakeTime = (totalAnimFrames + i) * (1000 / fps)
        drawFrame(drawCtx, 1, fakeTime)
        offCtx.clearRect(0, 0, GIF_W, GIF_H)
        offCtx.drawImage(drawCanvas, 0, 0, GIF_W, GIF_H)

        const imageData = offCtx.getImageData(0, 0, GIF_W, GIF_H)
        const rgba = imageData.data

        const palette = quantize(rgba, 256, { format: "rgb444" })
        const index = applyPalette(rgba, palette, "rgb444")

        gif.writeFrame(index, GIF_W, GIF_H, {
          palette,
          delay: gifDelay,
        })

        setGenerationProgress(80 + Math.round((i / holdFrames) * 15))
        if (i % 4 === 0) await waitFrame()
      }

      gif.finish()
      setGenerationProgress(98)

      const output = gif.bytes()
      const blob = new Blob([output], { type: "image/gif" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = `${list.name || "scrim-list"}.gif`
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setGenerationProgress(100)
    } catch (err) {
      console.error("[v0] GIF generation failed:", err)
      alert("GIF generation failed. Try downloading as PNG instead.")
    } finally {
      setTimeout(() => {
        setIsGenerating(false)
        setGenerationProgress(0)
      }, 1000)
    }
  }

  // Also offer PNG download
  const handleDownloadPng = () => {
    const canvas = document.createElement("canvas")
    canvas.width = CANVAS_W
    canvas.height = CANVAS_H
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    drawFrame(ctx, 1, 3000)
    const link = document.createElement("a")
    link.download = `${list.name || "scrim-list"}.png`
    link.href = canvas.toDataURL("image/png")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadPng}
            className="border-border text-foreground hover:bg-muted"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
          <Button
            onClick={handleGenerateGif}
            disabled={isGenerating}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8 py-6 text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {generationProgress > 0 ? `${generationProgress}%` : "Preparing..."}
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Generate GIF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress bar during generation */}
      {isGenerating && (
        <div className="w-full rounded-full h-2 bg-muted overflow-hidden">
          <div
            className="h-full bg-secondary transition-all duration-300 rounded-full"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      )}

      {/* Preview Info */}
      <div className="card-gradient rounded-xl border border-border p-5">
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-secondary" />
            <span>
              {list.date
                ? new Date(list.date + "T00:00:00").toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })
                : "No date set"}
            </span>
          </div>
          {list.organizerName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>{list.organizerName}</span>
            </div>
          )}
          {list.scrimTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              <span>{list.scrimTime}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium">{list.teams.length} Teams</span>
          </div>
        </div>
      </div>

      {/* Canvas Preview */}
      <div className="flex justify-center">
        <div className="rounded-xl overflow-hidden border border-border shadow-2xl purple-glow">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full max-w-[540px] h-auto"
          />
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Preview plays the animated sequence on loop. Click &quot;Generate GIF&quot; for a high-quality animated GIF download.
        GIF team logos will animate in the output.
      </p>
    </div>
  )
}

// Rounded rect helper with individual corner radii
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  tl: number, tr?: number, br?: number, bl?: number
) {
  if (tr === undefined) { tr = tl; br = tl; bl = tl }
  if (br === undefined) br = tl
  if (bl === undefined) bl = tr!
  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y)
  ctx.arcTo(x + w, y, x + w, y + tr, tr)
  ctx.lineTo(x + w, y + h - br)
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br)
  ctx.lineTo(x + bl, y + h)
  ctx.arcTo(x, y + h, x, y + h - bl, bl)
  ctx.lineTo(x, y + tl)
  ctx.arcTo(x, y, x + tl, y, tl)
  ctx.closePath()
}
