'use client'

import { useGiveawayStore } from '@/stores/giveaway-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Trophy,
  Upload,
  Shuffle,
  TrendingUp,
  Heart
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { participants, drawHistory, config, getStatistics } = useGiveawayStore()
  const stats = getStatistics()
  
  const lastWinner = drawHistory[0]?.winner
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            💕 {config.eventName}
          </h1>
          <p className="text-muted-foreground mt-1">
            ระบบสุ่มแจกบัตรคอนเสิร์ต - Valentine Special
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 border-pink-500/50">
            <Heart className="w-4 h-4 mr-1 text-pink-500" />
            Active
          </Badge>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-pink-500/20 hover:border-pink-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้เข้าร่วมทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              จากคอมเมนต์ใต้โพส
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผ่านเงื่อนไข</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{stats.qualified}</div>
            <p className="text-xs text-muted-foreground">
              พร้อมลุ้นรางวัล
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-red-500/20 hover:border-red-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ไม่ผ่านเงื่อนไข</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{stats.disqualified}</div>
            <p className="text-xs text-muted-foreground">
              ไม่ครบกติกา
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนรอบสุ่ม</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{drawHistory.length}</div>
            <p className="text-xs text-muted-foreground">
              รอบที่สุ่มไปแล้ว
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🚀 เริ่มต้นใช้งาน</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/import">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Upload className="h-6 w-6" />
              <span>นำเข้าข้อมูล</span>
            </Button>
          </Link>
          <Link href="/participants">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>ดูรายชื่อ</span>
            </Button>
          </Link>
          <Link href="/draw">
            <Button 
              variant="gold"
              className="w-full h-20 flex flex-col gap-2"
              disabled={stats.qualified === 0}
            >
              <Shuffle className="h-6 w-6" />
              <span>สุ่มรางวัล!</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conditions Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📝 กติกาการร่วมกิจกรรม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">👍</span>
              <div>
                <p className="font-medium">กด Like เพจ Angthong Music Love</p>
                <p className="text-xs text-muted-foreground">ตรวจสอบ: {config.likeVerification === 'skip' ? 'ข้าม' : 'Manual'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">🔄</span>
              <div>
                <p className="font-medium">กด Share โพสต์เป็นสาธารณะ</p>
                <p className="text-xs text-muted-foreground">ตรวจสอบ: {config.shareVerification === 'skip' ? 'ข้าม' : 'Manual'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">👥</span>
              <div>
                <p className="font-medium">แท็กเพื่อนอย่างน้อย {config.minTaggedFriends} คน</p>
                <p className="text-xs text-muted-foreground">ตรวจสอบอัตโนมัติ</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">#️⃣</span>
              <div>
                <p className="font-medium">ติด {config.requiredHashtag}</p>
                <p className="text-xs text-muted-foreground">ตรวจสอบอัตโนมัติ</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">📝</span>
              <div>
                <p className="font-medium">บอกเหตุผล (อย่างน้อย {config.minTextLength} ตัวอักษร)</p>
                <p className="text-xs text-muted-foreground">ตรวจสอบอัตโนมัติ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Last Winner */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🏆 ผู้โชคดีล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {lastWinner ? (
              <div className="text-center p-6 rounded-lg gradient-purple">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-white">
                  {lastWinner.fbUserName}
                </h3>
                <p className="text-white/80 mt-2 text-sm">
                  รับบัตรคอนเสิร์ต 2 ใบ!
                </p>
                <div className="mt-4 p-3 bg-white/10 rounded text-xs text-white/60">
                  สุ่มเมื่อ: {new Date(drawHistory[0].timestamp).toLocaleString('th-TH')}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>ยังไม่มีการสุ่มรางวัล</p>
                <Link href="/draw">
                  <Button variant="outline" className="mt-4">
                    ไปสุ่มรางวัล
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
