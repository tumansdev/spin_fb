import { Participant, TaggedFriend, GiveawayConfig } from '@/types/participant'

// Extract @mentions and named mentions from text
// Facebook comments can have:
// 1. @username format
// 2. Full names like "Nham Nham Umapornl" (no @)
// 3. Thai names (มีช่องว่าง)
export function extractTaggedFriends(text: string): TaggedFriend[] {
  const friends: TaggedFriend[] = []
  
  // Pattern 1: @mentions (classic format)
  const atMentionRegex = /@([^\s@]+)/g
  let match
  while ((match = atMentionRegex.exec(text)) !== null) {
    friends.push({ name: match[1].trim() })
  }
  
  // Pattern 2: Detect names that look like Facebook mentions
  // Common patterns: "ชื่อ นามสกุล", "Name Surname", capitalized consecutive words
  // Look for sequences of 2-4 capitalized words (likely a name)
  const namePatternEng = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g
  while ((match = namePatternEng.exec(text)) !== null) {
    const potentialName = match[1].trim()
    // Avoid short common words
    if (potentialName.length > 5 && !friends.some(f => f.name === potentialName)) {
      friends.push({ name: potentialName })
    }
  }
  
  // Pattern 3: Thai name patterns (sequences of Thai characters)
  // Look for Thai names that appear to be tags (usually 2+ Thai words together)
  const thaiNameRegex = /([ก-๛]+\s+[ก-๛]+(?:\s+[ก-๛]+)?)/g
  while ((match = thaiNameRegex.exec(text)) !== null) {
    const potentialName = match[1].trim()
    // Filter out common phrases that aren't names
    const commonPhrases = ['อยาก ไป', 'ไป ด้วย', 'มา ด้วย', 'เพื่อน แท็ก', 'ต้องการ']
    const isCommonPhrase = commonPhrases.some(phrase => potentialName.toLowerCase().includes(phrase.replace(' ', '')))
    if (!isCommonPhrase && potentialName.length > 4 && !friends.some(f => f.name === potentialName)) {
      friends.push({ name: potentialName })
    }
  }
  
  return friends
}

// Extract hashtags from text
export function extractHashtags(text: string): string[] {
  const regex = /#[^\s#,.!?]+/gi
  return text.match(regex) || []
}

// Check if hashtag exists (flexible matching)
// - Case insensitive
// - Allows partial match (e.g., #AngthongMusicLove = #AngThongMusicLove)
// - Removes common suffix differences
export function hasRequiredHashtag(text: string, requiredHashtag: string): boolean {
  if (!requiredHashtag || requiredHashtag.trim() === '' || requiredHashtag === '#') {
    return true // No hashtag requirement
  }
  
  const hashtags = extractHashtags(text)
  const required = requiredHashtag.toLowerCase().replace('#', '').replace(/[^a-z0-9ก-๛]/gi, '')
  
  // Check if any hashtag contains the required text (flexible match)
  return hashtags.some((h) => {
    const normalized = h.toLowerCase().replace('#', '').replace(/[^a-z0-9ก-๛]/gi, '')
    // Exact match or close enough (contains)
    return normalized === required || normalized.includes(required) || required.includes(normalized)
  })
}

// Validate a single participant against all conditions
export function validateParticipant(
  participant: Omit<Participant, 'status' | 'failReasons' | 'conditions'>,
  config: GiveawayConfig
): Pick<Participant, 'status' | 'failReasons' | 'conditions'> {
  const failReasons: string[] = []
  
  // Extract data from comment
  const taggedFriends = extractTaggedFriends(participant.commentText)
  const hashtags = extractHashtags(participant.commentText)
  const textLength = participant.commentText.length
  
  // Check conditions (only if enabled)
  const hasTaggedFriend = config.enableTag !== false 
    ? taggedFriends.length >= config.minTaggedFriends 
    : true // Skip if disabled
  
  const hasHashtag = config.enableHashtag !== false 
    ? hasRequiredHashtag(participant.commentText, config.requiredHashtag)
    : true // Skip if disabled
  
  const hasReason = config.enableMinLength !== false 
    ? textLength >= config.minTextLength
    : true // Skip if disabled
  
  // Build fail reasons (only for enabled checks)
  if (config.enableTag !== false && !hasTaggedFriend) {
    failReasons.push(`ไม่มีแท็กเพื่อน (ต้องแท็กอย่างน้อย ${config.minTaggedFriends} คน)`)
  }
  
  if (config.enableHashtag !== false && !hasHashtag) {
    failReasons.push(`ไม่มี ${config.requiredHashtag}`)
  }
  
  if (config.enableMinLength !== false && !hasReason) {
    failReasons.push(`ข้อความสั้นเกินไป (ต้องมากกว่า ${config.minTextLength} ตัวอักษร)`)
  }
  
  // Determine status
  const status = failReasons.length === 0 ? 'passed' : 'failed'
  
  return {
    status,
    failReasons,
    conditions: {
      hasLikedPage: null, // Cannot verify via API
      hasSharedPost: null, // Cannot verify via API
      hasTaggedFriend,
      hasHashtag,
      hasReason,
    },
  }
}

// Validate all participants
export function validateAllParticipants(
  participants: Omit<Participant, 'status' | 'failReasons' | 'conditions'>[],
  config: GiveawayConfig
): Participant[] {
  return participants.map((p) => ({
    ...p,
    taggedFriends: extractTaggedFriends(p.commentText),
    hashtags: extractHashtags(p.commentText),
    textLength: p.commentText.length,
    ...validateParticipant(p, config),
  }))
}

// Deduplicate by FB User ID (keep first comment only)
export function deduplicateParticipants(participants: Participant[]): Participant[] {
  const seen = new Map<string, Participant>()
  
  for (const p of participants) {
    if (!seen.has(p.fbUserId)) {
      seen.set(p.fbUserId, p)
    }
  }
  
  return Array.from(seen.values())
}
