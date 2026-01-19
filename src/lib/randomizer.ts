import { Participant, DrawResult } from '@/types/participant'

// Generate cryptographic random seed
export function generateSeed(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let seed = ''
  for (let i = 0; i < 20; i++) {
    seed += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return seed
}

// Seeded random number generator
function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return function() {
    const x = Math.sin(hash++) * 10000
    return x - Math.floor(x)
  }
}

// Fisher-Yates shuffle with seed
export function shuffleArray<T>(array: T[], seed: string): T[] {
  const shuffled = [...array]
  const random = seededRandom(seed)
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

// Pick random winner from qualified participants
export function pickWinner(
  qualifiedParticipants: Participant[],
  excludeUserIds: string[] = [],
  seed?: string
): { winner: Participant | null; seed: string } {
  // Filter out excluded users (previous winners)
  const eligibleParticipants = qualifiedParticipants.filter(
    (p) => !excludeUserIds.includes(p.fbUserId)
  )
  
  if (eligibleParticipants.length === 0) {
    return { winner: null, seed: seed || generateSeed() }
  }
  
  const usedSeed = seed || generateSeed()
  const shuffled = shuffleArray(eligibleParticipants, usedSeed)
  
  return {
    winner: shuffled[0],
    seed: usedSeed,
  }
}

// Create draw result
export function createDrawResult(
  winner: Participant | null,
  allParticipants: Participant[],
  qualifiedParticipants: Participant[],
  seed: string,
  drawnBy: string = 'Admin'
): DrawResult {
  return {
    id: `draw_${Date.now()}`,
    timestamp: new Date(),
    winner,
    totalParticipants: allParticipants.length,
    qualifiedParticipants: qualifiedParticipants.length,
    seed,
    drawnBy,
  }
}
