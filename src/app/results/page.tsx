'use client'

import { useGiveawayStore } from '@/stores/giveaway-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy,
  Download,
  Copy,
  Calendar,
  User,
  Hash,
  Ticket,
  Share2,
  CheckCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ResultsPage() {
  const { drawHistory, config } = useGiveawayStore()
  const { toast } = useToast()
  
  // Generate announcement text
  const generateAnnouncement = (winnerName: string, timestamp: Date) => {
    return `🎉 ประกาศผู้โชคดี! 🎉

🎵 ${config.eventName}
━━━━━━━━━━━━━━━━━━━━

🏆 ผู้โชคดีที่ได้รับบัตรคอนเสิร์ต 2 ใบ คือ...

🎫✨ ${winnerName} ✨🎫

━━━━━━━━━━━━━━━━━━━━
📅 สุ่มเมื่อ: ${timestamp.toLocaleString('th-TH')}

ขอบคุณทุกท่านที่ร่วมกิจกรรม! 💜
#AngThongMusicLove`
  }
  
  // Copy to clipboard
  const copyAnnouncement = (winnerName: string, timestamp: Date) => {
    const text = generateAnnouncement(winnerName, new Date(timestamp))
    navigator.clipboard.writeText(text)
    toast({
      title: 'คัดลอกแล้ว!',
      description: 'ข้อความประกาศถูกคัดลอกไปยัง clipboard',
    })
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🏆 ผลการสุ่ม</h1>
          <p className="text-muted-foreground mt-1">
            ดูประวัติการสุ่มและสร้างข้อความประกาศผล
          </p>
        </div>
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="w-8 h-8 mx-auto text-yellow-400" />
            <p className="text-3xl font-bold mt-2">{drawHistory.length}</p>
            <p className="text-sm text-muted-foreground">รอบที่สุ่ม</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <User className="w-8 h-8 mx-auto text-green-400" />
            <p className="text-3xl font-bold mt-2">{drawHistory.filter(d => d.winner).length}</p>
            <p className="text-sm text-muted-foreground">ผู้โชคดี</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Ticket className="w-8 h-8 mx-auto text-purple-400" />
            <p className="text-3xl font-bold mt-2">{drawHistory.filter(d => d.winner).length * 2}</p>
            <p className="text-sm text-muted-foreground">บัตรที่แจก</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="w-8 h-8 mx-auto text-blue-400" />
            <p className="text-sm font-bold mt-2">
              {drawHistory[0] 
                ? new Date(drawHistory[0].timestamp).toLocaleDateString('th-TH')
                : '-'
              }
            </p>
            <p className="text-sm text-muted-foreground">สุ่มล่าสุด</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Draw History */}
      {drawHistory.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
            <h3 className="text-xl font-medium mt-4">ยังไม่มีการสุ่ม</h3>
            <p className="text-muted-foreground mt-2">
              ไปหน้าสุ่มรางวัลเพื่อเริ่มต้น
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {drawHistory.map((draw, index) => (
            <Card key={draw.id} className="overflow-hidden">
              <div className="gradient-purple p-1">
                <div className="bg-background rounded-t-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="gradient-gold text-background text-lg px-4 py-1">
                          #{drawHistory.length - index}
                        </Badge>
                        <div>
                          <CardTitle className="text-xl">
                            🎉 {draw.winner?.fbUserName}
                          </CardTitle>
                          <CardDescription>
                            สุ่มเมื่อ {new Date(draw.timestamp).toLocaleString('th-TH')}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-yellow-400" />
                        <Ticket className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Winner Details */}
                    {draw.winner && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">📝 คอมเมนต์ที่ชนะ:</h4>
                        <p className="text-sm text-muted-foreground">
                          {draw.winner.commentText}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            ครบทุกเงื่อนไข
                          </Badge>
                          {draw.winner.taggedFriends.map((f, i) => (
                            <Badge key={i} variant="outline">@{f.name}</Badge>
                          ))}
                          {draw.winner.hashtags.map((h, i) => (
                            <Badge key={i} variant="outline">{h}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">ผู้เข้าร่วมทั้งหมด</p>
                        <p className="text-xl font-bold">{draw.totalParticipants}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">ผ่านเงื่อนไข</p>
                        <p className="text-xl font-bold text-green-400">{draw.qualifiedParticipants}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">สุ่มโดย</p>
                        <p className="text-xl font-bold">{draw.drawnBy}</p>
                      </div>
                    </div>
                    
                    {/* Seed for verification */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-xs text-muted-foreground">Random Seed (สำหรับตรวจสอบ)</p>
                        <p className="font-mono text-sm">{draw.seed}</p>
                      </div>
                      <Hash className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => copyAnnouncement(draw.winner?.fbUserName || '', draw.timestamp)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        คัดลอกประกาศ
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        แชร์ผล
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
