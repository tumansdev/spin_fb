import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Participant, DrawResult, GiveawayConfig } from '@/types/participant'
import { mockParticipants, mockDrawResults, defaultConfig, mockStats } from '@/lib/mock-data'

interface GiveawayState {
  // Data
  participants: Participant[]
  drawHistory: DrawResult[]
  config: GiveawayConfig
  
  // UI State
  isLoading: boolean
  lastUpdated: Date | null
  
  // Actions
  setParticipants: (participants: Participant[]) => void
  addParticipants: (newParticipants: Participant[]) => void
  updateParticipant: (id: string, updates: Partial<Participant>) => void
  clearParticipants: () => void
  
  // Draw actions
  addDrawResult: (result: DrawResult) => void
  clearDrawHistory: () => void
  
  // Config actions
  updateConfig: (config: Partial<GiveawayConfig>) => void
  
  // Computed
  getQualifiedParticipants: () => Participant[]
  getStatistics: () => {
    total: number
    qualified: number
    disqualified: number
    pending: number
  }
}

export const useGiveawayStore = create<GiveawayState>()(
  persist(
    (set, get) => ({
      // Initial state with mock data
      participants: mockParticipants,
      drawHistory: mockDrawResults,
      config: defaultConfig,
      isLoading: false,
      lastUpdated: new Date(),
      
      // Set participants (replace all)
      setParticipants: (participants) => {
        set({ 
          participants, 
          lastUpdated: new Date() 
        })
      },
      
      // Add new participants (append)
      addParticipants: (newParticipants) => {
        set((state) => ({
          participants: [...state.participants, ...newParticipants],
          lastUpdated: new Date()
        }))
      },
      
      // Update single participant
      updateParticipant: (id, updates) => {
        set((state) => ({
          participants: state.participants.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          lastUpdated: new Date()
        }))
      },
      
      // Clear all participants
      clearParticipants: () => {
        set({ 
          participants: [], 
          lastUpdated: new Date() 
        })
      },
      
      // Add draw result
      addDrawResult: (result) => {
        set((state) => ({
          drawHistory: [result, ...state.drawHistory],
          lastUpdated: new Date()
        }))
      },
      
      // Clear draw history
      clearDrawHistory: () => {
        set({ 
          drawHistory: [], 
          lastUpdated: new Date() 
        })
      },
      
      // Update config
      updateConfig: (config) => {
        set((state) => ({
          config: { ...state.config, ...config },
          lastUpdated: new Date()
        }))
      },
      
      // Get only qualified participants
      getQualifiedParticipants: () => {
        return get().participants.filter((p) => p.status === 'passed')
      },
      
      // Statistics
      getStatistics: () => {
        const participants = get().participants
        return {
          total: participants.length,
          qualified: participants.filter((p) => p.status === 'passed').length,
          disqualified: participants.filter((p) => p.status === 'failed').length,
          pending: participants.filter((p) => p.status === 'pending').length,
        }
      },
    }),
    {
      name: 'giveaway-store',
    }
  )
)
