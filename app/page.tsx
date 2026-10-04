"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MinesGrid } from "@/components/mines-grid"
import { PredictionEngine } from "@/lib/prediction-engine"
import { Instagram, Send } from "lucide-react"
import { Show } from "@clerk/nextjs"
import { AuthControls, AuthLoading, SignedOutWelcome } from "@/components/auth-controls"

const currencies = [
  { value: "inr", label: "INR" },
  { value: "btc", label: "BTC" },
  { value: "usdt", label: "USDT" },
  { value: "usdc", label: "USDC" },
  { value: "bnb", label: "BNB" },
  { value: "shiba", label: "SHIBA" },
  { value: "eth", label: "ETH" },
  { value: "doge", label: "DOGE" },
]

const payoutMultipliers = {
  1: [
    1.03, 1.08, 1.12, 1.18, 1.24, 1.3, 1.37, 1.46, 1.55, 1.65, 1.77, 1.9, 2.06, 2.25, 2.47, 2.75, 3.09, 3.54, 4.12,
    4.95, 6.19, 8.25, 12.37, 24.75,
  ],
  2: [
    1.08, 1.17, 1.29, 1.41, 1.56, 1.74, 1.94, 2.18, 2.47, 2.83, 3.26, 3.81, 4.5, 5.4, 6.6, 8.25, 10.61, 14.14, 19.8,
    29.7, 49.5, 99, 297,
  ],
  3: [
    1.12, 1.29, 1.48, 1.71, 2, 2.35, 2.79, 3.35, 4.07, 5, 6.26, 8, 10.4, 13.85, 19.25, 28, 42, 66, 110, 220, 440, 1320,
  ],
  4: [
    1.18, 1.41, 1.71, 2.09, 2.58, 3.23, 4.09, 5.26, 6.88, 9.17, 12.51, 17.52, 25.3, 38.5, 61.6, 103.4, 206.8, 516.9,
    1551,
  ],
  5: [1.24, 1.56, 2, 2.58, 3.39, 4.52, 6.14, 8.5, 12.04, 17.52, 26.18, 41.89, 70.08, 126.13, 252.26, 630.66, 1891.97],
  6: [1.3, 1.74, 2.35, 3.23, 4.52, 6.46, 9.44, 14.17, 21.89, 35.03, 58.38, 105.08, 210.17, 472.87, 1418.6],
  7: [1.37, 1.94, 2.79, 4.09, 6.14, 9.44, 14.95, 24.47, 42.25, 77.11, 154.22, 370.13, 1110.38],
  8: [1.46, 2.18, 3.35, 5.26, 8.5, 14.17, 24.47, 44.06, 88.12, 198.27, 594.81],
}

function MinesPredictor() {
  const [isActivated, setIsActivated] = useState(false)
  const [activationKey, setActivationKey] = useState("")
  const [serverSeed, setServerSeed] = useState("")
  const [betAmount, setBetAmount] = useState("0.00")
  const [currency, setCurrency] = useState("inr")
  const [minesCount, setMinesCount] = useState(1)
  const [betsMade, setBetsMade] = useState(0)
  const [payout, setPayout] = useState(0)
  const [safeSpots, setSafeSpots] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop")
  const [isLandscape, setIsLandscape] = useState(false)
  const [isActivating, setIsActivating] = useState(false)

  const predictionEngine = new PredictionEngine()

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = isActivated ? "Genix • Mines Predictor" : "Genix • Activation"
    }
  }, [isActivated])

  useEffect(() => {
    const savedActivation = localStorage.getItem("minesPredictor_activated")
    if (savedActivation === "true") {
      setIsActivated(true)
    }
  }, [])

  const handleActivation = async () => {
    const key = activationKey.trim().toLowerCase()
    if (key === "genix-gpt") {
      try {
        setIsActivating(true)
        await new Promise((r) => setTimeout(r, 5500))
        setIsActivated(true)
        localStorage.setItem("minesPredictor_activated", "true")
      } finally {
        setIsActivating(false)
      }
    } else {
      alert("Invalid activation key. Dm @stakexgenix on Telegram & @stakexpertgenix on Instagram To Purchase.")
    }
  }

  const calculatePayout = (mines: number, safeFound: number) => {
    const multipliers = payoutMultipliers[mines as keyof typeof payoutMultipliers]
    if (multipliers && safeFound > 0 && safeFound <= multipliers.length) {
      return multipliers[safeFound - 1]
    }
    return 0
  }

  const handlePredict = async () => {
    if (!serverSeed.trim()) {
      alert("Please enter a server seed")
      return
    }

    setIsLoading(true)

    try {
      const analysisTime = Math.random() * 3000 + 5000 // 5-8 seconds
      await new Promise((resolve) => setTimeout(resolve, analysisTime))

      const predictedSpots = await predictionEngine.generateSafeSpots(
        serverSeed,
        minesCount,
        betsMade,
        Number.parseFloat(betAmount),
      )

      setSafeSpots(predictedSpots)
      const newBetsMade = betsMade + 1
      setBetsMade(newBetsMade)

      const payoutMultiplier = calculatePayout(minesCount, predictedSpots.length)
      setPayout(payoutMultiplier)
    } catch (error) {
      console.error("Prediction error:", error)
      alert("Error generating prediction. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      if (width < 768) {
        setDeviceType("mobile")
      } else if (width < 1024) {
        setDeviceType("tablet")
      } else {
        setDeviceType("desktop")
      }

      setIsLandscape(height < width)
    }

    updateLayout()
    window.addEventListener("resize", updateLayout)
    window.addEventListener("orientationchange", () => {
      setTimeout(updateLayout, 100)
    })

    return () => {
      window.removeEventListener("resize", updateLayout)
      window.removeEventListener("orientationchange", updateLayout)
    }
  }, [])

  if (!isActivated) {
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
            disabled={!activationKey.trim() || isActivating}
            className="w-full text-black font-semibold text-base rounded-xs h-11"
            style={{
              backgroundColor: activationKey.trim() && !isActivating ? "#00e701" : "#058519",
              cursor: activationKey.trim() && !isActivating ? "pointer" : "not-allowed",
            }}
            aria-busy={isActivating}
          >
            {isActivating ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black"
                  aria-hidden="true"
                />
                Activating...
              </span>
            ) : (
              "Activate"
            )}
          </Button>

          <p className="text-center text-slate-400 text-[11px] mt-4">
            Need a key? DM @stakexgenix on Telegram To Purchase.
          </p>
        </div>
      </div>
    )
  }

  const getLayoutConfig = () => {
    if (deviceType === "mobile") {
      if (isLandscape) {
        return {
          layout: "horizontal",
          containerClass: "flex-row min-h-screen",
          gridContainerClass: "flex-1 order-2 rounded-r-lg px-2 py-2 flex items-center justify-center",
          inputContainerClass: "w-80 order-1 rounded-l-m px-4 py-3 overflow-y-auto max-h-screen",
          wrapperClass: "max-w-full mx-auto flex min-h-screen",
        }
      } else {
        return {
          layout: "vertical",
          containerClass: "flex-col min-h-screen",
          gridContainerClass: "order-1 rounded-t-lg p-2 flex-1",
          inputContainerClass: "w-full order-2 rounded-b-lg px-4 py-3",
          wrapperClass: "max-w-full mx-auto",
        }
      }
    } else if (deviceType === "tablet") {
      if (isLandscape) {
        return {
          layout: "horizontal",
          containerClass: "flex-row min-h-screen max-w-4xl mx-auto",
          gridContainerClass: "flex-1 order-2 rounded-r-lg px-3 py-3 flex items-center justify-center",
          inputContainerClass: "w-80 order-1 rounded-l-lg px-6 py-4 overflow-y-auto max-h-screen",
          wrapperClass: "max-w-5xl mx-auto flex items-center justify-center min-h-screen p-4",
        }
      } else {
        return {
          layout: "vertical",
          containerClass: "flex-col min-h-screen max-w-2xl mx-auto",
          gridContainerClass: "order-1 rounded-t-lg p-6 flex-1",
          inputContainerClass: "w-full order-2 rounded-b-lg px-6 py-4",
          wrapperClass: "max-w-4xl mx-auto flex items-center justify-center min-h-screen p-4",
        }
      }
    } else {
      return {
        layout: "horizontal",
        containerClass: "flex-row min-h-[700px] max-w-5xl mx-auto",
        gridContainerClass: "flex-1 order-2 rounded-r-lg px-11 py-6",
        inputContainerClass: "w-80 order-1 rounded-l-lg px-6 py-4",
        wrapperClass: "max-w-6xl mx-auto flex items-center justify-center min-h-screen py-2",
      }
    }
  }

  const layoutConfig = getLayoutConfig()

  return (
    <div className="min-h-screen p-2 py-2 leading-7 text-[rgba(26,44,56,1)]" style={{ backgroundColor: "#1a2c38" }}>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-1 pb-2" aria-label="Account navigation">
        <span className="text-sm font-bold tracking-[0.2em] text-slate-200">GENIX</span>
        <AuthControls />
      </header>
      <div className={layoutConfig.wrapperClass}>
        <div className={`flex gap-0 ${layoutConfig.containerClass}`}>
          <div
            className={`flex items-center justify-center ${layoutConfig.gridContainerClass}`}
            style={{ backgroundColor: "#0f212e" }}
          >
            <MinesGrid safeSpots={safeSpots} deviceType={deviceType} isLandscape={isLandscape} />
          </div>

          <div
            className={`${layoutConfig.inputContainerClass} flex flex-col gap-0 border-0 text-[rgba(33,55,67,1)] bg-[rgba(33,55,67,1)]`}
            style={{ backgroundColor: "#213743" }}
          >
            <div className={`flex justify-center gap-3.5 ${deviceType === "mobile" ? "mb-4" : "mb-6"}`}>
              <div className="flex items-center rounded-3xl overflow-hidden">
                <span
                  className={`font-sans pr-1 pl-1.5 ${deviceType === "mobile" ? "text-xs py-1 px-2" : "text-sm py-1 px-2"}`}
                  style={{ backgroundColor: "rgb(52, 85, 104)", color: "white" }}
                >
                  Bets Made
                </span>
                <span
                  className={`tracking-wider pr-5 pl-4 ${deviceType === "mobile" ? "text-xs px-2 py-1" : "text-sm px-2 py-1"}`}
                  style={{ backgroundColor: "rgb(13, 34, 51)", color: "white" }}
                >
                  {betsMade}
                </span>
              </div>
              <div className="flex items-center rounded-3xl overflow-hidden">
                <span
                  className={`${deviceType === "mobile" ? "text-xs px-2 py-1" : "text-sm px-2 py-1"}`}
                  style={{ backgroundColor: "rgb(52, 85, 104)", color: "white" }}
                >
                  Payout
                </span>
                <span
                  className={`${deviceType === "mobile" ? "text-xs px-2 py-1" : "text-sm px-2 py-1"}`}
                  style={{ backgroundColor: "rgb(13, 34, 51)", color: "white" }}
                >
                  {payout.toFixed(2)}x
                </span>
              </div>
            </div>

            <div className={deviceType === "mobile" ? "mb-2" : "mb-3"}>
              <label className={`block text-slate-300 mb-2 ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>
                Server Seed
              </label>
              <Input
                type="text"
                placeholder="Paste your server seed"
                value={serverSeed}
                onChange={(e) => setServerSeed(e.target.value)}
                className={`text-white placeholder-slate-400 border-[#375a6f] focus:outline-none focus:border-[#375a6f] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] rounded-xs w-full pt-0 mt-0 mb-0 pb-0 leading-7 tracking-normal text-xs border-solid bg-[rgba(15,33,46,1)] border-2 border-[rgba(50,72,87,1)] ${deviceType === "mobile" ? "h-10" : "h-12"}`}
              />
            </div>

            <div className={`grid grid-cols-2 gap-4 ${deviceType === "mobile" ? "mb-2" : "mb-3.5"}`}>
              <div>
                <label className={`block text-slate-300 mb-2 ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>
                  Bet Amount
                </label>
                <div className="relative w-36 h-10">
                  <input
                    className="w-38 h-full px-3 pr-16 text-white placeholder-slate-400 bg-[rgba(13,34,51,1)] border-[#375a6f] focus:outline-none focus:border-[#375a6f] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] rounded-xs text-xs border-2 border-[rgba(50,72,87,1)] border-double"
                    placeholder="0.00"
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                  />
                  <div className="absolute left-17.5 top-1/2 transform -translate-y-1/2">
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="text-white border border-[#334552] bg-[rgba(13,34,51,1)] rounded-xs text-xs font-normal w-19 h-2.5 border-solid border-[rgba(51,69,82,1)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {currencies.map((curr) => (
                          <SelectItem key={curr.value} value={curr.value} className="text-white">
                            {curr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="pl-7">
                <label
                  className={`block text-slate-300 mb-2 ${deviceType === "mobile" ? "text-xs" : "text-sm"} pr-0 pl-0.5`}
                >
                  Mines
                </label>
                <Select value={minesCount.toString()} onValueChange={(value) => setMinesCount(Number.parseInt(value))}>
                  <SelectTrigger
                    className={`border-[#324857] text-white bg-[rgba(13,34,51,1)] rounded-xs pl-2.5 border-solid border-2 ${deviceType === "mobile" ? "h-10 w-full" : deviceType === "tablet" ? "h-11 w-full" : "h-11 w-full"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()} className="text-white">
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handlePredict}
              disabled={isLoading || !serverSeed.trim()}
              className={`w-full text-black font-semibold text-base rounded-xs transition-colors ${deviceType === "mobile" ? "py-3 h-12 mb-3" : "py-4 h-14 mb-4"}`}
              style={{
                backgroundColor: serverSeed.trim() && !isLoading ? "#00e701" : "#058519",
                cursor: serverSeed.trim() && !isLoading ? "pointer" : "not-allowed",
              }}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black"
                    aria-hidden="true"
                  />
                  Analyzing...
                </span>
              ) : (
                "Predict"
              )}
            </Button>

            <div className={`flex-1 ${deviceType === "mobile" ? "mb-2" : "mb-3"}`}>
              <h3 className={`font-medium text-slate-300 mb-2 ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}>
                NOTE
              </h3>
              <p className={`text-slate-400 leading-relaxed ${deviceType === "mobile" ? "text-xs" : "text-xs"}`}>
                Due to the nature of the game, the predictions generated from the (hashed) server seed are only to be
                accurate. The accuracy of the prediction cannot be guaranteed. The accuracy, along with the number of
                predictions, decreases as the number of mines increases. The amount of mines increases. The accuracy.
                Under 7 gems can be predicted at a time. The bet must be given in the correct currency and amount.
              </p>
            </div>

            <div className={`text-center ${deviceType === "mobile" ? "py-2" : "py-3"} px-0 my-px mx-0`}>
              <p
                className={`mb-2 mt-0 ml-0 py-0 border-0 font-sans text-center text-slate-200 ${deviceType === "mobile" ? "text-xs" : "text-sm"}`}
              >
                CONNECTIONS
              </p>
              <div
                className={`flex h-auto items-center justify-center gap-3 text-teal-400 ${deviceType === "mobile" ? "mb-2" : "mb-3.5"}`}
              >
                <a href="https://instagram.com/stakexpertgenix" target="_blank" rel="noopener noreferrer">
                  <Instagram
                    className={`hover:text-blue-300 cursor-pointer bg-[rgba(56,92,116,1)] text-[rgba(30,44,63,1)] rounded-sm ${deviceType === "mobile" ? "w-6 h-6" : deviceType === "tablet" ? "w-7 h-7" : "w-5 h-5"}`}
                  />
                </a>
                <a href="https://t.me/stakexgenix" target="_blank" rel="noopener noreferrer">
                  <Send
                    className={`hover:text-blue-300 cursor-pointer bg-[rgba(56,92,116,1)] text-slate-800 rounded-sm ${deviceType === "mobile" ? "w-5 h-5" : deviceType === "tablet" ? "w-6 h-6" : "w-4 h-4"}`}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <>
      <Show when="signed-out">
        <SignedOutWelcome />
      </Show>
      <Show when="signed-in" fallback={<AuthLoading />}>
        <MinesPredictor />
      </Show>
    </>
  )
}
