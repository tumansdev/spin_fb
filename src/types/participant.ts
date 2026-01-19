// Type definitions for Participant
export interface TaggedFriend {
  name: string
  profileUrl?: string
}

export interface Participant {
  id: string
  fbUserId: string
  fbUserName: string
  fbProfileUrl: string
  fbProfilePicture: string // Profile picture URL
  commentText: string
  commentTime: Date
  taggedFriends: TaggedFriend[]
  hashtags: string[]
  textLength: number
  status: 'pending' | 'passed' | 'failed'
  failReasons: string[]
  // Conditions check results
  conditions: {
    hasLikedPage: boolean | null // Cannot verify via API, manual check
    hasSharedPost: boolean | null // Cannot verify via API, manual check
    hasTaggedFriend: boolean
    hasHashtag: boolean
    hasReason: boolean
  }
}

export interface DrawResult {
  id: string
  timestamp: Date
  winner: Participant | null
  totalParticipants: number
  qualifiedParticipants: number
  seed: string
  drawnBy: string
}

export interface GiveawayConfig {
  eventName: string
  postUrl: string
  // Hashtag settings
  requiredHashtag: string
  enableHashtag: boolean // If false, hashtag is not required
  // Tag friend settings
  minTaggedFriends: number
  enableTag: boolean // If false, tag is not required
  // Text length settings
  minTextLength: number
  enableMinLength: boolean // If false, text length is not required
  // Like/Share verification
  likeVerification: 'skip' | 'manual'
  shareVerification: 'skip' | 'manual'
  // Locked winner setting
  lockedWinnerName?: string // Name to force win
}
