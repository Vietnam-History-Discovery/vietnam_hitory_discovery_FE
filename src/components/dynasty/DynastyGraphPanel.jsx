import { useState, useEffect, useMemo, useRef } from 'react'
import SectionHeader from './SectionHeader'

function truncateLabel(s) {
  return s.length > 14 ? s.slice(0, 13) + '…' : s
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

export default function DynastyGraphPanel({ persons = [], events = [], dynastyName, onAsk, sessionReady }) {
  const [motionOverride, setMotionOverride] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [infoText, setInfoText] = useState(
    'Chọn một node trên sơ đồ hoặc một thẻ bên dưới — câu hỏi sẽ tự động gửi cho Chronicle AI.'
  )
  const [statusText, setStatusText] = useState('')

  // System reduced motion preference with lazy state initialization
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const listener = (e) => setSystemReducedMotion(e.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  // Build network nodes
  const otherNodes = useMemo(() => {
    const pNodes = persons.map((p) => {
      const name = typeof p === 'string' ? p : p.name ?? String(p)
      return { label: name, type: 'person' }
    })
    const eNodes = events.map((ev) => {
      const name = typeof ev === 'string' ? ev : ev.name ?? String(ev)
      return { label: name, type: 'event' }
    })
    return [...pNodes, ...eNodes]
  }, [persons, events])

  const othersCount = otherNodes.length
  const isReduced = systemReducedMotion && !motionOverride
  const isOverriding = systemReducedMotion && motionOverride
  const useGraph = othersCount >= 2 && !isReduced

  // Force-directed layout state
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const svgRef = useRef(null)

  // Zoom/pan viewport state
  const W = 560
  const H = 300
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: W, h: H })

  // Initialize and run physical force simulation via requestAnimationFrame to keep UI responsive
  useEffect(() => {
    if (!useGraph || othersCount === 0) return

    const cx = W / 2
    const cy = H / 2
    const tempNodes = [{ id: 'center', type: 'dynasty', label: dynastyName, x: cx, y: cy, vx: 0, vy: 0 }]

    otherNodes.forEach((o, i) => {
      const angle = (i / othersCount) * Math.PI * 2
      const r = o.type === 'person' ? 85 : 130
      tempNodes.push({
        id: 'n' + i,
        type: o.type,
        label: o.label,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: 0,
        vy: 0,
      })
    })

    const tempEdges = tempNodes.slice(1).map((n) => ({ source: tempNodes[0], target: n }))

    Promise.resolve().then(() => {
      setNodes(tempNodes)
      setEdges(tempEdges)
      setSelectedNodeId(null)
      setViewBox({ x: 0, y: 0, w: W, h: H })
    })

    let tickCount = 0
    let animId = null

    const tick = () => {
      if (tickCount >= 150) return

      // Run 2 ticks per frame to optimize performance and animation speed
      for (let step = 0; step < 2; step++) {
        if (tickCount >= 150) break
        tickCount++

        // Repulsive force
        for (let i = 0; i < tempNodes.length; i++) {
          for (let j = i + 1; j < tempNodes.length; j++) {
            const a = tempNodes[i]
            const b = tempNodes[j]
            const dx = a.x - b.x
            const dy = a.y - b.y
            const distSq = dx * dx + dy * dy || 0.01
            const dist = Math.sqrt(distSq)
            const force = 2200 / distSq
            const fx = (dx / dist) * force
            const fy = (dy / dist) * force
            if (a.id !== 'center') {
              a.vx += fx
              a.vy += fy
            }
            if (b.id !== 'center') {
              b.vx -= fx
              b.vy -= fy
            }
          }
        }

        // Spring tension on edges
        tempEdges.forEach((e) => {
          const dx = e.target.x - e.source.x
          const dy = e.target.y - e.source.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
          const targetLen = e.target.type === 'person' ? 90 : 130
          const f = (dist - targetLen) * 0.03
          const fx = (dx / dist) * f
          const fy = (dy / dist) * f
          if (e.target.id !== 'center') {
            e.target.vx -= fx
            e.target.vy -= fy
          }
        })

        // Dampen velocity and update coordinates
        tempNodes.forEach((n) => {
          if (n.id === 'center') {
            n.x = cx
            n.y = cy
            return
          }
          n.vx *= 0.82
          n.vy *= 0.82
          n.x += n.vx
          n.y += n.vy
          n.x = clamp(n.x, 30, W - 30)
          n.y = clamp(n.y, 30, H - 30)
        })
      }

      setNodes([...tempNodes])
      setEdges([...tempEdges])
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [otherNodes, dynastyName, useGraph, othersCount])

  // Click asking handler
  const handleAsk = (node) => {
    const questionText = node.id === 'center'
      ? `Cho tôi biết tổng quan về ${dynastyName}`
      : `Cho tôi biết về ${node.label} trong ${dynastyName}`

    const note = sessionReady
      ? 'đã gửi câu hỏi cho Chronicle AI.'
      : 'đang kết nối — câu hỏi sẽ tự động gửi khi sẵn sàng.'

    setInfoText(`Đang hỏi: ${node.label}`)
    setStatusText(note)
    onAsk(questionText)
  }

  // Handle node selection
  const selectNode = (node) => {
    if (node.id === 'center') {
      setSelectedNodeId(null)
      handleAsk(node)
      return
    }
    const alreadySelected = selectedNodeId === node.id
    setSelectedNodeId(alreadySelected ? null : node.id)
    if (!alreadySelected) {
      handleAsk(node)
    } else {
      setInfoText('Chọn một node trên sơ đồ hoặc một thẻ bên dưới — câu hỏi sẽ tự động gửi cho Chronicle AI.')
      setStatusText('')
    }
  }

  // Convert client cursor coords to SVG viewBox space
  const toSvgCoords = (clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const pt = svgRef.current.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svgRef.current.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  // Node Dragging & Canvas Panning interaction state variables
  const dragNodeRef = useRef(null)
  const panRef = useRef(null)

  const handlePointerDown = (e, node) => {
    e.preventDefault()
    if (node) {
      dragNodeRef.current = node
    } else {
      panRef.current = { x: e.clientX, y: e.clientY }
    }
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (dragNodeRef.current) {
      const p = toSvgCoords(e.clientX, e.clientY)
      // Lock center node position
      if (dragNodeRef.current.id !== 'center') {
        dragNodeRef.current.x = clamp(p.x, 30, W - 30)
        dragNodeRef.current.y = clamp(p.y, 30, H - 30)
        setNodes([...nodes])
      }
    } else if (panRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      const scaleX = viewBox.w / rect.width
      const scaleY = viewBox.h / rect.height
      const dx = (e.clientX - panRef.current.x) * scaleX
      const dy = (e.clientY - panRef.current.y) * scaleY
      setViewBox((prev) => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy,
      }))
      panRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handlePointerUp = () => {
    dragNodeRef.current = null
    panRef.current = null
  }

  // Wheel zoom handler
  const handleWheel = (e) => {
    e.preventDefault()
    const p = toSvgCoords(e.clientX, e.clientY)
    const factor = e.deltaY < 0 ? 0.9 : 1.1
    const newW = clamp(viewBox.w * factor, 200, 1000)
    const newH = newW * (H / W)
    setViewBox({
      x: p.x - (p.x - viewBox.x) * (newW / viewBox.w),
      y: p.y - (p.y - viewBox.y) * (newH / viewBox.h),
      w: newW,
      h: newH,
    })
  }

  // Zoom Button Controls
  const zoomBy = (factor) => {
    const centerX = viewBox.x + viewBox.w / 2
    const centerY = viewBox.y + viewBox.h / 2
    const newW = clamp(viewBox.w * factor, 200, 1000)
    const newH = newW * (H / W)
    setViewBox({
      x: centerX - newW / 2,
      y: centerY - newH / 2,
      w: newW,
      h: newH,
    })
  }

  const handleReset = () => {
    setViewBox({ x: 0, y: 0, w: W, h: H })
    setSelectedNodeId(null)
    setInfoText('Chọn một node trên sơ đồ hoặc một thẻ bên dưới — câu hỏi sẽ tự động gửi cho Chronicle AI.')
    setStatusText('')
  }

  if (othersCount === 0) return null

  return (
    <section className="space-y-4">
      <SectionHeader>Mạng lưới liên quan</SectionHeader>

      <div className="bg-surface border border-gold-border rounded-[3px] p-4 space-y-3">
        {useGraph ? (
          <>
            {/* Graph Controls */}
            <div className="flex justify-between items-center text-[11.5px] text-ink-muted gap-2.5 flex-wrap">
              <span className="flex-1 min-w-[160px] font-sans">
                Click vào node để hỏi Chronicle AI · kéo để di chuyển · cuộn/nút để phóng to
              </span>
              <div className="flex gap-1">
                {isOverriding && (
                  <button
                    type="button"
                    onClick={() => setMotionOverride(false)}
                    className="bg-none border border-gold-border-strong text-ink-muted hover:text-primary-bright hover:border-primary text-xs px-2.5 py-1 rounded-[4px] cursor-pointer transition-colors focus:outline-none"
                    title="Hệ thống của bạn đang bật giảm chuyển động — quay lại chế độ tôn trọng cài đặt đó"
                  >
                    ↺ Tắt hiệu ứng
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => zoomBy(1.25)}
                  className="bg-none border border-gold-border-strong text-ink-muted hover:text-primary-bright hover:border-primary font-bold text-xs px-2.5 py-1 rounded-[4px] cursor-pointer transition-colors focus:outline-none"
                  aria-label="Thu nhỏ"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => zoomBy(0.8)}
                  className="bg-none border border-gold-border-strong text-ink-muted hover:text-primary-bright hover:border-primary font-bold text-xs px-2.5 py-1 rounded-[4px] cursor-pointer transition-colors focus:outline-none"
                  aria-label="Phóng to"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-none border border-gold-border-strong text-ink-muted hover:text-primary-bright hover:border-primary text-xs px-2.5 py-1 rounded-[4px] cursor-pointer transition-colors focus:outline-none"
                  aria-label="Xem toàn bộ sơ đồ"
                >
                  ⤢ Fit
                </button>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="w-full h-[300px] rounded-[4px] overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,rgba(198,161,91,0.06),transparent_70%)] touch-none select-none relative">
              <svg
                ref={svgRef}
                className="w-full h-full cursor-grab active:cursor-grabbing block"
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={`Sơ đồ liên kết nhân vật và sự kiện của ${dynastyName}`}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
                onPointerDown={(e) => handlePointerDown(e, null)}
              >
                {/* Edges */}
                {edges.map((e, idx) => {
                  const hl = selectedNodeId === e.target.id
                  const dim = selectedNodeId && !hl
                  return (
                    <line
                      key={`edge-${idx}`}
                      className="transition-all duration-150"
                      x1={e.source.x}
                      y1={e.source.y}
                      x2={e.target.x}
                      y2={e.target.y}
                      stroke={hl ? 'var(--color-primary-bright)' : 'var(--color-gold-border-strong)'}
                      strokeWidth={hl ? 1.8 : 1.3}
                      opacity={dim ? 0.15 : 1}
                    />
                  )
                })}

                {/* Edge labels (only render if node count is <= 8 to prevent overlap) */}
                {othersCount <= 8 &&
                  edges.map((e, idx) => {
                    const hl = selectedNodeId === e.target.id
                    const dim = selectedNodeId && !hl
                    const mx = (e.source.x + e.target.x) / 2
                    const my = (e.source.y + e.target.y) / 2
                    const label = e.target.type === 'person' ? 'nhân vật của' : 'sự kiện của'
                    const labelWidth = label.length * 4.6 + 8

                    return (
                      <g key={`edge-label-${idx}`} opacity={dim ? 0.2 : 1}>
                        <rect
                          className="fill-surface opacity-[0.92]"
                          x={mx - labelWidth / 2}
                          y={my - 7}
                          width={labelWidth}
                          height={12}
                          rx={3}
                        />
                        <text
                          className="font-sans text-[8.5px] fill-ink-muted text-center pointer-events-none select-none"
                          x={mx}
                          y={my + 2}
                          textAnchor="middle"
                        >
                          {label}
                        </text>
                      </g>
                    )
                  })}

                {/* Nodes */}
                {nodes.map((n) => {
                  // Central Node
                  if (n.id === 'center') {
                    const rectWidth = Math.max(90, (n.label || '').length * 8.5 + 16)
                    const rectX = -rectWidth / 2
                    return (
                      <g key={n.id}>
                        <g
                          className="cursor-pointer select-none"
                          transform={`translate(${n.x},${n.y})`}
                          onPointerDown={(e) => {
                            e.stopPropagation()
                            handlePointerDown(e, n)
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            selectNode(n)
                          }}
                        >
                          <rect
                            className="fill-primary"
                            x={rectX}
                            y="-16"
                            width={rectWidth}
                            height="32"
                            rx="6"
                          />
                          <text
                            className="font-sans font-bold text-[12px] fill-[#1a1309] text-center"
                            x="0"
                            y="4.5"
                            textAnchor="middle"
                          >
                            {n.label}
                          </text>
                        </g>
                      </g>
                    )
                  }

                  const dim = selectedNodeId && selectedNodeId !== n.id
                  const sel = selectedNodeId === n.id

                  return (
                    <g key={n.id} opacity={dim ? 0.22 : 1}>
                      {n.type === 'person' ? (
                        <circle
                          className="cursor-pointer select-none fill-surface2 transition-all duration-150"
                          cx={n.x}
                          cy={n.y}
                          r={14}
                          stroke={sel ? 'var(--color-primary-bright)' : 'var(--color-vermilion)'}
                          strokeWidth={sel ? 2.6 : 1.7}
                          onPointerDown={(e) => {
                            e.stopPropagation()
                            handlePointerDown(e, n)
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            selectNode(n)
                          }}
                        />
                      ) : (
                        <rect
                          className="cursor-pointer select-none fill-surface2 transition-all duration-150"
                          x={n.x - 11}
                          y={n.y - 11}
                          width={22}
                          height={22}
                          stroke={sel ? 'var(--color-primary-bright)' : 'var(--color-jade)'}
                          strokeWidth={sel ? 2.6 : 1.7}
                          transform={`rotate(45 ${n.x} ${n.y})`}
                          onPointerDown={(e) => {
                            e.stopPropagation()
                            handlePointerDown(e, n)
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            selectNode(n)
                          }}
                        />
                      )}
                      <text
                        className="font-sans text-[9.5px] fill-ink-muted text-center pointer-events-none select-none"
                        x={n.x}
                        y={n.y + 26}
                        textAnchor="middle"
                      >
                        {truncateLabel(n.label)}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Legends */}
            <div className="flex gap-4 text-[10.5px] text-ink-muted flex-wrap">
              <span className="flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 bg-primary rounded-[2px] inline-block" /> Triều đại (click hỏi tổng quan)
              </span>
              <span className="flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 rounded-full bg-surface2 border-[1.6px] border-vermilion inline-block" /> Nhân vật
              </span>
              <span className="flex items-center gap-1.5">
                <i className="w-2 h-2 bg-surface2 border-[1.6px] border-jade inline-block rotate-45" /> Sự kiện
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Fallback Text List */}
            <div className="text-[11.5px] text-ink-muted italic mb-2 font-sans">
              {isReduced && othersCount >= 2
                ? 'Đã tắt hiệu ứng chuyển động theo tùy chọn hệ thống — hiển thị dạng danh sách.'
                : 'Chưa đủ dữ liệu liên kết để dựng sơ đồ — hiển thị dạng danh sách.'}
            </div>
            {isReduced && othersCount >= 2 && (
              <button
                type="button"
                onClick={() => setMotionOverride(true)}
                className="block bg-none border border-gold-border-strong text-primary hover:text-primary-bright hover:border-primary text-[11.5px] px-3 py-1.5 rounded-[4px] cursor-pointer transition-colors focus:outline-none mb-3"
              >
                ▶ Bật hiệu ứng chuyển động cho phiên này
              </button>
            )}
          </>
        )}

        {/* Console / Status hint */}
        <div className="text-[12.5px] text-ink-muted min-h-[18px] leading-relaxed pt-1.5 font-sans border-t border-gold-border/20">
          {statusText ? (
            <>
              <b>{infoText.replace('Đang hỏi: ', '')}</b> — <span className="text-primary italic font-medium">{statusText}</span>
            </>
          ) : (
            <span>{infoText}</span>
          )}
        </div>

        {/* Fallback Chips / Screen reader fallback inputs */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gold-border/20">
          {otherNodes.map((n, i) => {
            const idxStr = 'n' + i
            const isSel = selectedNodeId === idxStr
            return (
              <button
                key={`chip-${i}`}
                type="button"
                onClick={() => selectNode({ id: idxStr, label: n.label, type: n.type })}
                className={`text-[11.5px] px-3 py-1.5 rounded-full border cursor-pointer font-sans transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                  isSel
                    ? 'border-primary text-primary-bright bg-primary/10'
                    : 'border-gold-border text-ink-muted hover:border-primary hover:text-primary-bright bg-background/50'
                }`}
              >
                {n.type === 'event' ? '◆ ' : ''}
                {n.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
