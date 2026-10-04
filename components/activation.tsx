"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  onActivated?: () => void
}

/**
 * Activation/login screen
 * - Persists activation in localStorage under "minesPredictor_activated"
 * - Sets document.title to "Genix • Activation" or "Genix • Mines Predictor"
 * - Calls onActivated() when activation succeeds (optional)
 */
export function GenixActivationScreen({ onActivated }: Props) {
  const [activationKey, setActivationKey] = useState("")
  const [isActivated, setIsActivated] = useState(false)

  // Restore prior activation on first load
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("minesPredictor_activated") : null
      if (saved === "true") setIsActivated(true)
    } catch {}
  }, [])

  // Dynamic page title
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = isActivated ? "Genix • Mines Predictor" : "Genix • Activation"
    }
  }, [isActivated])

  const handleActivation = () => {
    if (activationKey.trim().toLowerCase() === "Genix-GPT") {
      try {
        localStorage.setItem("minesPredictor_activated", "true")
      } catch {}
      setIsActivated(true)
      onActivated?.()
    } else {
      // Same message text as provided (slightly consolidated)
      alert("Invalid activation key. Dm @stakexgenix on Telegram & @stakexpertgenix on Instagram To Purchase.")
    }
  }

  if (isActivated) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#1b3342" }}>
      <div className="w-full max-w-sm rounded-xl p-6 shadow-md" style={{ backgroundColor: "#213743" }}>
        <h1 className="text-center text-slate-100 text-lg font-semibold mb-1">Genix • Activation</h1>
        <p className="text-center text-slate-400 text-xs mb-5">Enter your activation key to continue</p>

        <label className="block text-slate-300 text-xs mb-2">Activation Key</label>
        <Input
          type="text"
          placeholder="Enter activation key"
          value={activationKey}
          onChange={(e) => setActivationKey(e.target.value)}
          className="text-white placeholder-slate-400 bg-[rgba(15,33,46,1)] border-2 border-[rgba(50,72,87,1)] rounded-xs h-10 mb-4"
        />

        <Button
          onClick={handleActivation}
          disabled={!activationKey.trim()}
          className="w-full text-black font-semibold text-base rounded-xs h-11"
          style={{
            backgroundColor: activationKey.trim() ? "#00e701" : "#058519",
            cursor: activationKey.trim() ? "pointer" : "not-allowed",
          }}
        >
          Activate
        </Button>

        <p className="text-center text-slate-400 text-[11px] mt-4">
          Need a key? DM @stakexgenix on Telegram To Purchase.
        </p>
      </div>
    </div>
  )
}

export default GenixActivationScreen
