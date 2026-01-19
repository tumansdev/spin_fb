'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGiveawayStore } from '@/stores/giveaway-store'
import { pickWinner, createDrawResult } from '@/lib/randomizer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Shuffle, 
  Trophy,
  Users,
  Sparkles,
  RotateCcw,
  Gift,
  Ticket
} from 'lucide-react'
import { Participant } from '@/types/participant'
import Link from 'next/link'

export default function DrawPage() {
  const { participants, drawHistory, addDrawResult, getQualifiedParticipants } = useGiveawayStore()
  const { toast } = useToast()
  
  const qualifiedParticipants = getQualifiedParticipants()
  const previousWinnerIds = drawHistory.map(d => d.winner?.fbUserId).filter(Boolean) as string[]
  
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentName, setCurrentName] = useState<string | null>(null)
  const [winner, setWinner] = useState<Participant | null>(null)
  const [spinSeed, setSpinSeed] = useState<string | null>(null)
  
  // Spin animation
  const spin = useCallback(() => {
    if (qualifiedParticipants.length === 0) {
      toast({
        title: 'ไม่มีผู้มีสิทธิ์ลุ้น',
        description: 'กรุณานำเข้าข้อมูลก่อน',
        variant: 'destructive',
      })
      return
    }
    
    setIsSpinning(true)
    setWinner(null)
    
    // Draw from ALL participants (excluding previous winners)
    // User requirement: Allow drawing failed participants but show warning
    const eligibleParticipants = participants.filter(
      p => !previousWinnerIds.includes(p.fbUserId)
    )
    
    if (eligibleParticipants.length === 0) {
      toast({
        title: 'สุ่มครบทุกคนแล้ว!',
        description: 'ผู้เข้าร่วมทั้งหมดได้รับรางวัลไปแล้ว',
        variant: 'destructive',
      })
      setIsSpinning(false)
      return
    }
    
    // Animate through names
    let count = 0
    const maxCount = 30
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleParticipants.length)
      setCurrentName(eligibleParticipants[randomIndex].fbUserName)
      count++
      
      if (count >= maxCount) {
        clearInterval(interval)
        
        // Pick actual winner from ALL eligible
        const result = pickWinner(eligibleParticipants, previousWinnerIds)
        setWinner(result.winner)
        setSpinSeed(result.seed)
        setCurrentName(null)
        setIsSpinning(false)
        
        if (result.winner) {
          if (result.winner.status === 'passed') {
            toast({
              title: '🎉 ยินดีด้วย!',
              description: `${result.winner.fbUserName} เป็นผู้โชคดี!`,
            })
          } else {
            toast({
              title: '⚠️ ผู้โชคดีไม่ผ่านเงื่อนไข',
              description: 'โปรดตรวจสอบรายละเอียด',
              variant: 'default',
            })
          }
        }
      }
    }, 100)
  }, [participants, previousWinnerIds, toast])
  
  // Confirm winner
  const confirmWinner = () => {
    if (!winner || !spinSeed) return
    
    const drawResult = createDrawResult(
      winner,
      participants,
      qualifiedParticipants,
      spinSeed,
      'Admin'
    )
    
    addDrawResult(drawResult)
    
    toast({
      title: 'บันทึกเรียบร้อย',
      description: 'เพิ่มผู้ชนะในรายการแล้ว',
    })
    
    setWinner(null)
    setSpinSeed(null)
  }
  
  // Reset
  const reset = () => {
    setWinner(null)
    setCurrentName(null)
    setSpinSeed(null)
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-pink bg-clip-text text-transparent">
          สุ่มผู้โชคดี
        </h1>
        <p className="text-muted-foreground">
          ระบบสุ่มผู้โชคดีจากผู้เข้าร่วมทั้งหมด {participants.length} คน
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <div className="space-y-4">
          <Card className="border-pink-500/20 bg-pink-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-pink-600">
                ผู้เข้าร่วมทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{participants.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                ผ่านเงื่อนไข
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {qualifiedParticipants.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                ผู้โชคดีก่อนหน้า
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">
                {previousWinnerIds.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center - Spinner */}
        <div className="md:col-span-2">
          <Card className={`h-[400px] flex flex-col items-center justify-center p-8 transition-colors ${
            winner?.status === 'failed' ? 'border-red-500 bg-red-50' : 'border-2 border-pink-500/20'
          }`}>
            <div className="min-h-[200px] flex items-center justify-center w-full">
              {winner ? (
                // Winner display
                <div className="text-center animate-in zoom-in-50 duration-500 w-full">
                  {winner.status === 'failed' ? (
                     // FAILED WINNER DISPLAY
                     <div className="space-y-4">
                       <div className="text-6xl mb-2">😢</div>
                       <h2 className="text-2xl font-bold text-red-500">
                         ขออภัยด้วยน้า...
                       </h2>
                       <div className="bg-white/80 p-4 rounded-lg border border-red-200 inline-block min-w-[300px]">
                         <p className="font-semibold text-lg mb-2">{winner.fbUserName}</p>
                         <p className="text-red-500 font-medium mb-1">คุณทำไม่ครบเงื่อนไข:</p>
                         <ul className="text-sm text-muted-foreground text-left list-disc list-inside bg-red-50 p-2 rounded">
                           {winner.failReasons.map((reason, i) => (
                             <li key={i}>{reason}</li>
                           ))}
                         </ul>
                         <p className="mt-3 text-sm font-medium text-muted-foreground">
                           ไว้โอกาสหน้ามาร่วมกิจกรรมใหม่น้าา 💕
                         </p>
                       </div>
                     </div>
                  ) : (
                    // PASSED WINNER DISPLAY
                    <div className="space-y-4">
                      {winner.fbProfilePicture ? (
                        <img 
                          src={winner.fbProfilePicture} 
                          alt={winner.fbUserName}
                          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-yellow-400 shadow-lg object-cover"
                        />
                      ) : (
                        <div className="text-8xl mb-4">🎉</div>
                      )}
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        {winner.fbUserName}
                      </h2>
                      <p className="text-muted-foreground mt-2">
                        ยินดีด้วย! ได้รับบัตรคอนเสิร์ต 2 ใบ
                      </p>
                      <div className="flex justify-center gap-2 mt-4">
                        <Ticket className="w-8 h-8 text-yellow-400" />
                        <Ticket className="w-8 h-8 text-yellow-400" />
                      </div>
                      <Badge variant="outline" className="mt-4">
                        Seed: {spinSeed?.slice(0, 10)}...
                      </Badge>
                    </div>
                  )}
                </div>
              ) : isSpinning && currentName ? (
                // Spinning animation
                <div className="text-center">
                  <div className="relative">
                    <Sparkles className="w-16 h-16 mx-auto text-yellow-400 animate-spin-slow" />
                  </div>
                  <h2 className="text-2xl font-bold mt-4 animate-pulse">
                    {currentName}
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    กำลังสุ่ม...
                  </p>
                </div>
              ) : (
                // Ready state
                <div className="text-center">
                  <Shuffle className="w-20 h-20 mx-auto text-muted-foreground" />
                  <h2 className="text-xl font-medium mt-4 text-muted-foreground">
                    พร้อมสุ่มแล้ว!
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    มีผู้มีสิทธิ์ลุ้น {qualifiedParticipants.length - previousWinnerIds.length} คน
                  </p>
                </div>
              )}
            </div>
        
        <CardContent className="p-6 space-y-4">
          {winner ? (
            <div className="flex gap-3">
              <Button 
                variant="gold" 
                size="xl" 
                className="flex-1"
                onClick={confirmWinner}
              >
                <Trophy className="w-5 h-5 mr-2" />
                ยืนยันผู้โชคดี
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={reset}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="gold" 
              size="xl" 
              className="w-full glow-gold"
              onClick={spin}
              disabled={isSpinning || qualifiedParticipants.length === 0}
            >
              {isSpinning ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  กำลังสุ่ม...
                </>
              ) : (
                <>
                  <Shuffle className="w-5 h-5 mr-2" />
                  🎰 สุ่มผู้โชคดี!
                </>
              )}
            </Button>
          )}
          
          {qualifiedParticipants.length === 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                ยังไม่มีผู้ผ่านเงื่อนไข
              </p>
              <Link href="/import">
                <Button variant="outline" size="sm">
                  ไปนำเข้าข้อมูล
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      
      {/* Previous Winners */}
      {drawHistory.length > 0 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">🏆 ผู้โชคดีก่อนหน้า</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {drawHistory.map((draw, index) => (
                <div 
                  key={draw.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge className="gradient-gold text-background">
                      #{drawHistory.length - index}
                    </Badge>
                    <span className="font-medium">{draw.winner?.fbUserName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(draw.timestamp).toLocaleString('th-TH')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </div>
  )
}
