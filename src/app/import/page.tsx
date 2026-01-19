'use client'

import { useState } from 'react'
import { useGiveawayStore } from '@/stores/giveaway-store'
import { useHydration } from '@/hooks/use-hydration'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  FileSpreadsheet,
  Upload,
  Check,
  X,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Trash2,
  HelpCircle
} from 'lucide-react'
import { fetchGoogleSheet, type SheetParticipant } from '@/lib/google-sheets'
import { Participant, TaggedFriend } from '@/types/participant'

export default function ImportPage() {
  const { setParticipants, clearParticipants, participants, config } = useGiveawayStore()
  const hydrated = useHydration()
  const { toast } = useToast()
  
  const [sheetUrl, setSheetUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<Participant[]>([])
  const [step, setStep] = useState<'input' | 'preview'>('input')
  
  // Fetch and parse Google Sheet
  const handleFetch = async () => {
    if (!sheetUrl.trim()) {
      toast({
        title: 'กรุณาใส่ URL',
        description: 'ใส่ลิงก์ Google Sheets ที่ Publish to web แล้ว',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)
    
    const result = await fetchGoogleSheet(sheetUrl)
    
    if (!result.ok) {
      toast({
        title: '❌ ไม่สามารถดึงข้อมูลได้',
        description: result.error,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    // Convert to Participant format with validation
    const validated = result.participants.map((p, index) => {
      // Check pass keywords (flexible)
      const passWords = ['ผ่าน', 'pass', 'yes', 'true', '1', 'ใช่', 'ok']
      const failWords = ['ไม่', 'fail', 'no', 'false', '0']
      
      const checkPass = (text: string) => {
        const isFailed = failWords.some(w => text.toLowerCase().includes(w))
        if (isFailed) return false
        return passWords.some(w => text.toLowerCase().includes(w))
      }
      
      const hasTaggedFriend = checkPass(p.taggedFriendName) // Column C
      const hasComment = checkPass(p.comment)               // Column B (Logic change: check for pass word)
      
      const participant: Participant = {
        id: `sheet_${index}_${Date.now()}`,
        fbUserId: `user_${index}`,
        fbUserName: p.name,
        fbProfileUrl: '',
        fbProfilePicture: '',
        commentText: p.comment,
        commentTime: new Date(),
        taggedFriends: hasTaggedFriend ? [{ name: p.taggedFriendName }] as TaggedFriend[] : [],
        hashtags: extractHashtags(p.comment),
        textLength: getThaiTextLength(p.comment),
        conditions: {
          hasLikedPage: p.likedPage,       // คอลัมน์ D
          hasSharedPost: p.sharedPost,     // คอลัมน์ E
          hasTaggedFriend: hasTaggedFriend, // คอลัมน์ C (เช็คคำว่า ผ่าน)
          hasHashtag: p.hasHashtag,        // คอลัมน์ F
          hasReason: hasComment,           // คอลัมน์ B (คอมเมนต์: เช็คคำว่า ผ่าน)
        },
        status: 'pending',
        failReasons: [],
      }
      
      // Validate conditions - อ้างอิงจาก Sheet
      const failReasons: string[] = []
      
      if (!participant.conditions.hasLikedPage) {
        failReasons.push('ไม่ได้กดไลค์เพจ')
      }
      if (!participant.conditions.hasSharedPost) {
        failReasons.push('ไม่ได้แชร์โพสต์')
      }
      if (!participant.conditions.hasTaggedFriend) {
        failReasons.push('ไม่ได้แท็กเพื่อน')
      }
      if (!participant.conditions.hasHashtag) {
        failReasons.push('ไม่มี #AngThongMusicLove')
      }
      if (!participant.conditions.hasReason) {
        failReasons.push('ไม่ได้คอมเมนต์') // New condition
      }
      
      participant.failReasons = failReasons
      participant.status = failReasons.length === 0 ? 'passed' : 'failed'
      
      return participant
    })
    
    setPreview(validated)
    setStep('preview')
    setIsLoading(false)
    
    const passedCount = validated.filter(p => p.status === 'passed').length
    toast({
      title: '🎉 ดึงข้อมูลสำเร็จ!',
      description: `พบ ${validated.length} คน (ผ่าน ${passedCount} / ไม่ผ่าน ${validated.length - passedCount})`,
    })
  }
  
  // Confirm import
  const handleConfirm = () => {
    setParticipants(preview)
    toast({
      title: '✅ นำเข้าสำเร็จ!',
      description: `บันทึก ${preview.length} รายชื่อเรียบร้อย`,
    })
    setStep('input')
    setPreview([])
    setSheetUrl('')
  }
  
  // Reset
  const handleReset = () => {
    setStep('input')
    setPreview([])
  }
  
  // Clear all
  const handleClearAll = () => {
    if (confirm('ล้างข้อมูลผู้เข้าร่วมทั้งหมด?')) {
      clearParticipants()
      toast({
        title: 'ล้างข้อมูลแล้ว',
        description: 'ลบรายชื่อผู้เข้าร่วมทั้งหมดเรียบร้อย',
      })
    }
  }
  
  const passedCount = preview.filter(p => p.status === 'passed').length
  const failedCount = preview.filter(p => p.status === 'failed').length
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 นำเข้าจาก Google Sheets</h1>
          <p className="text-muted-foreground mt-1">
            ดึงรายชื่อผู้เข้าร่วมจาก Google Sheets และตรวจสอบเงื่อนไขอัตโนมัติ
          </p>
        </div>
        {hydrated && participants.length > 0 && (
          <Badge variant="outline" className="px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            มีข้อมูล {participants.length} คน
          </Badge>
        )}
      </div>
      
      {step === 'input' && (
        <>
          {/* Instructions */}
          <Card className="border-pink-500/30 bg-pink-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-pink-400" />
                วิธีเตรียม Google Sheets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-medium">1. สร้าง Google Sheet ตาม Format นี้:</p>
                  <div className="bg-muted/50 p-3 rounded text-sm font-mono">
                    <div className="grid grid-cols-6 gap-1 text-xs">
                      <span className="bg-pink-500/20 px-1 py-1 rounded text-center">ชื่อ</span>
                      <span className="bg-pink-500/20 px-1 py-1 rounded text-center">คอมเมนต์</span>
                      <span className="bg-pink-500/20 px-1 py-1 rounded text-center">แท็กเพื่อน</span>
                      <span className="bg-pink-500/20 px-1 py-1 rounded text-center">ไลค์เพจ</span>
                      <span className="bg-pink-500/20 px-1 py-1 rounded text-center">แชร์โพสต์</span>
                      <span className="bg-pink-500/20 px-1 py-1 rounded text-center">แฮชแท็ก</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">💡 แท็กเพื่อน = ชื่อเพื่อน, อื่นๆ = ผ่าน หรือ ไม่ผ่าน</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">2. Publish to web:</p>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>• File → Share → Publish to web</li>
                    <li>• เลือก Entire Document → CSV</li>
                    <li>• คลิก Publish แล้วคัดลอก URL</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-500" />
                ใส่ลิงก์ Google Sheets
              </CardTitle>
              <CardDescription>
                วาง URL ที่ได้จาก Publish to web หรือ URL ปกติของ Sheet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="https://docs.google.com/spreadsheets/d/xxxxx/pub?output=csv"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleFetch} 
                  disabled={isLoading || !sheetUrl.trim()}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังดึง...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      ดึงข้อมูล
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Current Data */}
          {hydrated && participants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ข้อมูลปัจจุบัน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{participants.length}</p>
                      <p className="text-sm text-muted-foreground">ทั้งหมด</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400">
                        {participants.filter(p => p.status === 'passed').length}
                      </p>
                      <p className="text-sm text-muted-foreground">ผ่าน</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-400">
                        {participants.filter(p => p.status === 'failed').length}
                      </p>
                      <p className="text-sm text-muted-foreground">ไม่ผ่าน</p>
                    </div>
                  </div>
                  <Button variant="outline" className="text-red-400" onClick={handleClearAll}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    ล้างข้อมูล
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      {step === 'preview' && (
        <>
          {/* Preview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-purple-500/30">
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 mx-auto text-purple-400" />
                <p className="text-3xl font-bold mt-2">{preview.length}</p>
                <p className="text-sm text-muted-foreground">ทั้งหมด</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-400" />
                <p className="text-3xl font-bold mt-2 text-green-400">{passedCount}</p>
                <p className="text-sm text-muted-foreground">ผ่านเงื่อนไข</p>
              </CardContent>
            </Card>
            <Card className="border-red-500/30">
              <CardContent className="pt-6 text-center">
                <XCircle className="w-8 h-8 mx-auto text-red-400" />
                <p className="text-3xl font-bold mt-2 text-red-400">{failedCount}</p>
                <p className="text-sm text-muted-foreground">ไม่ผ่าน</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Preview List */}
          <Card>
            <CardHeader>
              <CardTitle>ตัวอย่างข้อมูล</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {preview.slice(0, 20).map((p) => (
                  <div 
                    key={p.id} 
                    className={`p-3 rounded-lg border ${
                      p.status === 'passed' 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : 'border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{p.fbUserName}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{p.commentText}</p>
                      </div>
                      <Badge variant={p.status === 'passed' ? 'success' : 'destructive'}>
                        {p.status === 'passed' ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
                      </Badge>
                    </div>
                    {p.failReasons.length > 0 && (
                      <div className="mt-2 text-xs text-red-400">
                        ❌ {p.failReasons.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
                {preview.length > 20 && (
                  <p className="text-center text-sm text-muted-foreground py-2">
                    และอีก {preview.length - 20} รายการ...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              เริ่มใหม่
            </Button>
            <Button onClick={handleConfirm} className="bg-pink-500 hover:bg-pink-600">
              <Check className="w-4 h-4 mr-2" />
              ยืนยันนำเข้า {preview.length} รายชื่อ
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// Helper: Extract hashtags from text
function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\wก-๙]+/g) || []
  return matches
}

// Helper: Get Thai text length (excluding spaces, hashtags, mentions)
function getThaiTextLength(text: string): number {
  const cleaned = text
    .replace(/#[\wก-๙]+/g, '') // Remove hashtags
    .replace(/@[\wก-๙.]+/g, '') // Remove mentions
    .replace(/\s+/g, '') // Remove whitespace
  return cleaned.length
}
