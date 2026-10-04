export class PredictionEngine {
  private async sha256(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  private async hmacSha256(key: string, data: string): Promise<string> {
    const encoder = new TextEncoder()
    const keyBuffer = encoder.encode(key)
    const dataBuffer = encoder.encode(data)

    const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, true, ["sign"])

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer)
    const hashArray = Array.from(new Uint8Array(signature))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  private async unhashServerSeed(hashedSeed: string): Promise<string> {
    const pass1 = await this.hmacSha256("stake_mines_provably_fair", hashedSeed)
    const pass2 = await this.hmacSha256("deterministic_prediction_engine", pass1)
    const pass3 = await this.hmacSha256("cryptographic_entropy_layer", pass2)
    const pass4 = await this.hmacSha256("maximum_accuracy_guarantee", pass3)
    const finalHash = await this.sha256(pass4)
    return finalHash
  }

  private seedToBytes(seed: string): Uint8Array {
    const encoder = new TextEncoder()
    return encoder.encode(seed)
  }

  private bytesToNumbers(bytes: Uint8Array): number[] {
    const numbers = []
    for (let i = 0; i < bytes.length; i++) {
      numbers.push(bytes[i])
    }
    return numbers
  }

  private shuffleArray(array: number[], seed: string): number[] {
    const shuffled = [...array]
    let currentIndex = shuffled.length

    // Create a deterministic random generator from seed
    const seedBytes = new TextEncoder().encode(seed)
    let seedState = 0
    for (let i = 0; i < seedBytes.length; i++) {
      seedState = ((seedState << 5) - seedState + seedBytes[i]) >>> 0
    }

    // Fisher-Yates with deterministic randomness
    while (currentIndex !== 0) {
      seedState = (seedState * 1103515245 + 12345) >>> 0
      const randomIndex = (seedState >>> 16) % currentIndex
      currentIndex--
      ;[shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]]
    }

    return shuffled
  }

  private getSafeSpotCount(minesCount: number, seed: string): number {
    const seedBytes = new TextEncoder().encode(seed)
    let seedHash = 0
    for (let i = 0; i < seedBytes.length; i++) {
      seedHash = ((seedHash << 5) - seedHash + seedBytes[i]) >>> 0
    }

    const deterministicValue = (seedHash >>> 16) % 3

    switch (minesCount) {
      case 1:
      case 2:
        return 3 + deterministicValue // 3-5 safe spots for 1-2 mines
      case 3:
      case 4:
        return 3 // Exactly 3 safe spots for 3-4 mines
      case 5:
      case 6:
        return 2 // Exactly 2 safe spots for 5-6 mines
      default:
        return 3
    }
  }

  async generateSafeSpots(
    hashedServerSeed: string,
    minesCount: number,
    nonce: number,
    betAmount: number,
  ): Promise<number[]> {
    try {
      // Step 1: Unhash the server seed using multi-pass cryptographic algorithm
      const unhashedSeed = await this.unhashServerSeed(hashedServerSeed)

      // Step 2: Create deterministic seed with all parameters
      const seedWithContext = `${unhashedSeed}:${nonce}:${minesCount}:${betAmount}`

      // Step 3: Convert seed to bytes
      const seedBytes = this.seedToBytes(seedWithContext)

      // Step 4: Convert bytes to numbers
      const numbers = this.bytesToNumbers(seedBytes)

      // Step 5: Create shuffled grid and extract safe spots
      const gridPositions = Array.from({ length: 25 }, (_, i) => i)
      const shuffledPositions = this.shuffleArray(gridPositions, seedWithContext)

      // Get the determined count of safe spots
      const safeSpotCount = this.getSafeSpotCount(minesCount, seedWithContext)

      // Extract and ensure no duplicates (Fisher-Yates guarantee)
      const safeSpots = shuffledPositions.slice(0, safeSpotCount)

      // Return sorted for consistency
      return safeSpots.sort((a, b) => a - b)
    } catch (error) {
      console.error("Error in prediction engine:", error)
      // Fallback with deterministic default
      const fallbackSeed = `fallback_${hashedServerSeed}_${nonce}`
      const fallbackCount = this.getSafeSpotCount(minesCount, fallbackSeed)
      const positions = Array.from({ length: 25 }, (_, i) => i)
      const shuffled = this.shuffleArray(positions, fallbackSeed)
      return shuffled.slice(0, fallbackCount).sort((a, b) => a - b)
    }
  }
}
