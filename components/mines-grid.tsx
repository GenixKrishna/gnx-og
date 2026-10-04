"use client"

import { useEffect, useRef, useState } from "react"

interface MinesGridProps {
  safeSpots: number[]
  deviceType: "mobile" | "tablet" | "desktop"
  isLandscape?: boolean
}

export function MinesGrid({ safeSpots, deviceType, isLandscape = false }: MinesGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [tilePx, setTilePx] = useState<number | null>(null)
  const gapPx = 8 // ~8px gap between tiles, similar to the reference screenshot

  useEffect(() => {
    const calc = () => {
      const isPortrait = typeof window !== "undefined" && window.matchMedia("(orientation: portrait)").matches

      if (deviceType === "mobile" && isPortrait) {
        const containerWidth = gridRef.current?.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 360)

        const cols = 5
        const size = Math.floor((containerWidth - gapPx * (cols - 1)) / cols) + 4 // +4px bigger tiles
        setTilePx(size)
      } else {
        setTilePx(null)
      }
    }

    calc()

    // Recalculate on resize and when grid width changes
    const ro = gridRef.current ? new ResizeObserver(calc) : null
    window.addEventListener("resize", calc)
    return () => {
      window.removeEventListener("resize", calc)
      ro?.disconnect()
    }
  }, [deviceType])

  const renderGrid = () => {
    const grid = []

    // Detect orientation (portrait or landscape)
    const orientation = window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape"

    let boxSize = "w-28 h-28" // Desktop default
    let gapSize = "gap-3" // Desktop default

    if (deviceType === "mobile") {
      if (orientation === "portrait") {
        boxSize = "w-15 h-15" // Mobile Portrait (fallback; replaced by tilePx when available)
      } else {
        boxSize = "w-14 h-14" // Mobile Landscape
      }
      gapSize = "gap-2" // Mobile
    } else if (deviceType === "tablet") {
      if (orientation === "portrait") {
        boxSize = "w-20 h-20" // Tablet Portrait
      } else {
        boxSize = "w-15 h-15" // Tablet Landscape
      }
      gapSize = "gap-2" // Tablet
    }

    for (let i = 0; i < 25; i++) {
      const isSafe = safeSpots.includes(i)
      // For mobile portrait, use exact pixel size; otherwise fall back to prior Tailwind sizes
      const usePixelSize = deviceType === "mobile" && orientation === "portrait" && !!tilePx
      const sizeStyle = usePixelSize ? { width: tilePx!, height: tilePx! } : undefined

      const mobilePortraitStyles = deviceType === "mobile" && orientation === "portrait"
      const radiusClass = mobilePortraitStyles ? "rounded-md" : "rounded-lg"
      const shadowClass = mobilePortraitStyles ? "shadow-md" : "shadow-none"

      grid.push(
        <div key={i} className="relative">
          <div className="relative">
            <div
              className={`absolute left-0 ${radiusClass} ${usePixelSize ? "" : `aspect-square ${boxSize}`} top-[0.220rem]`}
              style={{
                ...sizeStyle,
                backgroundColor: isSafe ? "#7bc41f" : "#213844",
                zIndex: 1,
              }}
            />
            <div
              className={`relative transition-all duration-300 ${shadowClass} ${radiusClass} ${usePixelSize ? "" : `aspect-square ${boxSize}`} hover:shadow-l`}
              style={{
                ...sizeStyle,
                backgroundColor: isSafe ? "#a3f62a" : "#2f4553",
                borderColor: isSafe ? "#8ee024" : "#3a5866",
                zIndex: 2,
              }}
            />
          </div>
        </div>,
      )
    }
    return grid
  }

  return (
    <div className="flex items-center justify-center h-full w-full p-2">
      <div className="flex items-center justify-center w-full">
        {/* Use a measuring ref and CSS gap so 5 columns fill available width on mobile portrait */}
        <div
          ref={gridRef}
          className={`grid grid-cols-5 w-full h-auto pb-0 pt-0 mb-0 tracking-normal leading-7`}
          style={{ gap: `${gapPx}px` }}
        >
          {renderGrid()}
        </div>
      </div>
    </div>
  )
}
