'use client'

import { useState, useCallback, useEffect } from 'react'
import { useGiveawayStore } from '@/stores/giveaway-store'
import { validateAllParticipants, deduplicateParticipants } from '@/lib/validator'
import Image from 'next/image'
import { 
  fetchFacebookComments, 
  validateAccessToken, 
  getPages,
  getPagePosts,
  FBComment 
} from '@/lib/facebook-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  Facebook, 
  Download,
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2,
  Key,
  ExternalLink,
  Users,
  FileText,
  ChevronRight
} from 'lucide-react'
import { Participant, TaggedFriend } from '@/types/participant'

export default function ImportPage() {
  const { addParticipants, clearParticipants, participants, config, setParticipants } = useGiveawayStore()
  const { toast } = useToast()
  
  // Facebook API state
  const [accessToken, setAccessToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<Participant[]>([])
  const [fetchedComments, setFetchedComments] = useState<FBComment[]>([])
  
  // Page and Post selection
  const [tokenInfo, setTokenInfo] = useState<{ valid: boolean; name?: string } | null>(null)
  const [pages, setPages] = useState<{ id: string; name: string; access_token: string }[]>([])
  const [selectedPage, setSelectedPage] = useState<{ id: string; name: string; access_token: string } | null>(null)
  const [posts, setPosts] = useState<{ id: string; message?: string; created_time?: string; full_picture?: string }[]>([])
  const [selectedPostId, setSelectedPostId] = useState('')
  const [step, setStep] = useState<'token' | 'page' | 'post' | 'direct' | 'preview'>('token')
  const [filterDate, setFilterDate] = useState('') // Date filter YYYY-MM-DD
  const [directPhotoId, setDirectPhotoId] = useState('845759488439119') // Pre-filled with the known Photo ID
  
  // Validate token and get pages
  const handleValidateToken = useCallback(async () => {
    if (!accessToken) {
      toast({
        title: 'กรุณากรอก Access Token',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)
    
    const result = await validateAccessToken(accessToken)
    setTokenInfo(result)
    
    if (!result.valid) {
      toast({
        title: 'Token ไม่ถูกต้อง',
        description: result.error,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    // Get pages
    const pagesResult = await getPages(accessToken)
    
    if (pagesResult.error) {
      toast({
        title: 'ไม่สามารถดึงรายการ Pages ได้',
        description: pagesResult.error,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    if (pagesResult.pages.length === 0) {
      toast({
        title: 'ไม่พบ Pages',
        description: 'Token นี้ไม่มีสิทธิ์เข้าถึง Page ใดๆ กรุณาใช้ Page Access Token',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    setPages(pagesResult.pages)
    setStep('page')
    
    toast({
      title: '✅ Token ถูกต้อง!',
      description: `พบ ${pagesResult.pages.length} Pages`,
    })
    
    setIsLoading(false)
  }, [accessToken, toast])
  
  // Select page and load posts
  const handleSelectPage = useCallback(async (page: { id: string; name: string; access_token: string }) => {
    setSelectedPage(page)
    setIsLoading(true)
    
    const postsResult = await getPagePosts(page.id, page.access_token)
    
    if (postsResult.error) {
      toast({
        title: 'ไม่สามารถดึงโพสต์ได้',
        description: postsResult.error,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    setPosts(postsResult.posts)
    setStep('post')
    
    toast({
      title: `✅ เลือก ${page.name}`,
      description: `พบ ${postsResult.posts.length} โพสต์ล่าสุด`,
    })
    
    setIsLoading(false)
  }, [toast])
  
  // Fetch comments from selected post
  const handleFetchComments = useCallback(async () => {
    if (!selectedPostId || !selectedPage) {
      toast({
        title: 'กรุณาเลือกโพสต์',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)
    setProgress(30)
    
    const result = await fetchFacebookComments(selectedPostId, selectedPage.access_token)
    
    if (result.error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: result.error,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    if (result.comments.length === 0) {
      toast({
        title: 'ไม่พบคอมเมนต์',
        description: 'โพสต์นี้ยังไม่มีคอมเมนต์',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    setProgress(60)
    setFetchedComments(result.comments)
    
    // Convert to Participant format
    const rawParticipants = result.comments.map((comment, index) => {
      const userId = comment.from?.id || `unknown_${index}`
      const userName = comment.from?.name || `ผู้ใช้ #${userId.slice(-6)}`
      return {
        id: `fb_${comment.id}`,
        fbUserId: userId,
        fbUserName: userName,
        fbProfileUrl: comment.from?.id ? `https://facebook.com/${comment.from.id}` : '',
        commentText: comment.message || '',
        commentTime: new Date(comment.created_time),
        taggedFriends: [] as TaggedFriend[],
        hashtags: [] as string[],
        textLength: 0,
      }
    })
    
    setProgress(80)
    
    // Validate all participants
    const validatedParticipants = validateAllParticipants(rawParticipants, config)
    
    // Deduplicate by user ID
    const dedupedParticipants = deduplicateParticipants(validatedParticipants)
    
    setProgress(100)
    setPreview(dedupedParticipants)
    setStep('preview')
    
    toast({
      title: '🎉 ดึงข้อมูลสำเร็จ!',
      description: `พบ ${result.comments.length} คอมเมนต์ → ${dedupedParticipants.length} รายชื่อ`,
    })
    
    setIsLoading(false)
  }, [selectedPostId, selectedPage, config, toast])
  
  // Confirm import
  const handleConfirmImport = () => {
    setParticipants(preview)
    setPreview([])
    setProgress(0)
    setFetchedComments([])
    setStep('token')
    setSelectedPage(null)
    setSelectedPostId('')
    setPosts([])
    
    toast({
      title: '✅ บันทึกสำเร็จ!',
      description: `เพิ่ม ${preview.length} รายชื่อเข้าระบบแล้ว`,
    })
  }
  
  // Clear all
  const handleClearAll = () => {
    clearParticipants()
    setPreview([])
    setFetchedComments([])
    toast({
      title: 'ล้างข้อมูลสำเร็จ',
      description: 'ลบรายชื่อทั้งหมดแล้ว',
    })
  }
  
  // Fetch from direct Photo ID
  const handleFetchFromPhotoId = useCallback(async () => {
    if (!directPhotoId || !selectedPage) {
      toast({
        title: 'กรุณากรอก Photo ID',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)
    setProgress(30)
    
    // Use the photo ID directly
    const result = await fetchFacebookComments(directPhotoId.trim(), selectedPage.access_token)
    
    if (result.error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: result.error,
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    if (result.comments.length === 0) {
      toast({
        title: 'ไม่พบคอมเมนต์',
        description: 'Photo นี้ยังไม่มีคอมเมนต์ หรือ App ยังไม่ได้เผยแพร่',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }
    
    setProgress(60)
    setFetchedComments(result.comments)
    
    // Convert to Participant format
    const rawParticipants = result.comments.map((comment, index) => {
      const userId = comment.from?.id || `unknown_${index}`
      const userName = comment.from?.name || `ผู้ใช้ #${userId.slice(-6)}`
      return {
        id: `fb_${comment.id}`,
        fbUserId: userId,
        fbUserName: userName,
        fbProfileUrl: comment.from?.id ? `https://facebook.com/${comment.from.id}` : '',
        commentText: comment.message || '',
        commentTime: new Date(comment.created_time),
        taggedFriends: [] as TaggedFriend[],
        hashtags: [] as string[],
        textLength: 0,
      }
    })
    
    setProgress(80)
    
    // Validate all participants
    const validatedParticipants = validateAllParticipants(rawParticipants, config)
    
    // Deduplicate by user ID
    const dedupedParticipants = deduplicateParticipants(validatedParticipants)
    
    setProgress(100)
    setPreview(dedupedParticipants)
    setStep('preview')
    
    toast({
      title: '🎉 ดึงข้อมูลสำเร็จ!',
      description: `พบ ${result.comments.length} คอมเมนต์ → ${dedupedParticipants.length} รายชื่อ`,
    })
    
    setIsLoading(false)
  }, [directPhotoId, selectedPage, config, toast])
  
  // Reset flow
  const handleReset = () => {
    setStep('token')
    setTokenInfo(null)
    setPages([])
    setSelectedPage(null)
    setPosts([])
    setSelectedPostId('')
    setPreview([])
    setFetchedComments([])
    setProgress(0)
  }
  
  const qualifiedCount = preview.filter(p => p.status === 'passed').length
  const failedCount = preview.filter(p => p.status === 'failed').length
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Facebook className="w-8 h-8 text-blue-500" />
          ดึงข้อมูลจาก Facebook
        </h1>
        <p className="text-muted-foreground mt-1">
          เลือก Page และ Post เพื่อดึงคอมเมนต์โดยตรง
        </p>
      </div>
      
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>📊 สถานะปัจจุบัน</span>
            {participants.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                ล้างทั้งหมด
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-4xl font-bold">{participants.length}</span>
              <span className="text-lg text-muted-foreground ml-2">รายชื่อในระบบ</span>
            </div>
            {participants.length > 0 && (
              <>
                <Badge variant="success" className="text-lg px-3 py-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  ผ่าน {participants.filter(p => p.status === 'passed').length}
                </Badge>
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  ไม่ผ่าน {participants.filter(p => p.status === 'failed').length}
                </Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        <StepIndicator 
          number={1} 
          label="Token" 
          active={step === 'token'} 
          completed={step !== 'token'} 
        />
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <StepIndicator 
          number={2} 
          label="เลือก Page" 
          active={step === 'page'} 
          completed={step === 'post' || step === 'preview'} 
        />
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <StepIndicator 
          number={3} 
          label="เลือก Post" 
          active={step === 'post'} 
          completed={step === 'preview'} 
        />
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <StepIndicator 
          number={4} 
          label="ยืนยัน" 
          active={step === 'preview'} 
          completed={false} 
        />
        
        {step !== 'token' && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="ml-auto">
            เริ่มใหม่
          </Button>
        )}
      </div>
      
      {/* Step 1: Token */}
      {step === 'token' && (
        <Card className="border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5" />
              ขั้นตอนที่ 1: กรอก Access Token
            </CardTitle>
            <CardDescription>
              ใช้ User Access Token ที่มี permission pages_read_engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAAxxxxxxxxx..."
                className="font-mono"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  ใช้ Graph API Explorer สร้าง Token
                </p>
                <a 
                  href="https://developers.facebook.com/tools/explorer/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  สร้าง Token
                </a>
              </div>
            </div>
            
            <Button 
              className="w-full"
              size="lg"
              onClick={handleValidateToken}
              disabled={isLoading || !accessToken}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  ตรวจสอบ Token
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Select Page */}
      {step === 'page' && (
        <Card className="border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Facebook className="w-5 h-5 text-blue-500" />
              ขั้นตอนที่ 2: เลือก Page
            </CardTitle>
            <CardDescription>
              เลือก Facebook Page ที่มีโพสต์กิจกรรม
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pages.map((page) => (
              <Button
                key={page.id}
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleSelectPage(page)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{page.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {page.id}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 ml-auto" />
              </Button>
            ))}
            
            {/* Direct Photo ID Option */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">หรือ</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 border-purple-500/50 hover:bg-purple-500/10"
              onClick={() => {
                setSelectedPage(pages[0]) // Use first page token
                setStep('direct')
              }}
              disabled={isLoading || pages.length === 0}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  📷
                </div>
                <div className="text-left">
                  <p className="font-medium text-purple-400">ใช้ Photo ID โดยตรง</p>
                  <p className="text-xs text-muted-foreground">สำหรับโพสต์ที่เป็นรูปภาพ (Giveaway Post)</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 ml-auto" />
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2.5: Direct Photo ID */}
      {step === 'direct' && selectedPage && (
        <Card className="border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              📷 ดึงคอมเมนต์จาก Photo โดยตรง
            </CardTitle>
            <CardDescription>
              กรอก Photo ID จาก URL ของรูปภาพ (fbid=XXXXX)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <p className="text-sm font-medium text-purple-400 mb-2">🎯 Photo ID สำหรับ Giveaway</p>
              <p className="text-xs text-muted-foreground mb-3">
                URL: facebook.com/photo/?fbid=<span className="text-purple-400 font-mono">{directPhotoId}</span>
              </p>
              <Input
                value={directPhotoId}
                onChange={(e) => setDirectPhotoId(e.target.value)}
                placeholder="845759488439119"
                className="font-mono text-lg"
              />
            </div>
            
            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  กำลังดึงคอมเมนต์... {progress}%
                </p>
              </div>
            )}
            
            <Button 
              className="w-full bg-purple-500 hover:bg-purple-600"
              size="lg"
              onClick={handleFetchFromPhotoId}
              disabled={isLoading || !directPhotoId}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  กำลังดึงคอมเมนต์...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  ดึงคอมเมนต์จาก Photo ID: {directPhotoId}
                </>
              )}
            </Button>
            
            <Button 
              variant="ghost"
              className="w-full"
              onClick={() => setStep('page')}
            >
              ← กลับไปเลือก Page
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Select Post */}
      {step === 'post' && selectedPage && (
        <Card className="border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              ขั้นตอนที่ 3: เลือกโพสต์ ({posts.length} รายการ)
            </CardTitle>
            <CardDescription>
              เลือกโพสต์ที่ต้องการดึงคอมเมนต์จาก {selectedPage.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Filter */}
            <div className="p-4 rounded-lg bg-muted/30 space-y-3">
              <Label className="text-sm font-medium">🗓️ กรองตามวันที่</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterDate === '2026-01-08' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDate(filterDate === '2026-01-08' ? '' : '2026-01-08')}
                  className={filterDate === '2026-01-08' ? 'bg-purple-500 hover:bg-purple-600' : ''}
                >
                  📌 8 ม.ค. 2569 (โพสต์หลัก)
                </Button>
                <Button
                  variant={filterDate === '2026-01-15' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDate(filterDate === '2026-01-15' ? '' : '2026-01-15')}
                >
                  15 ม.ค. 2569
                </Button>
                <Button
                  variant={filterDate === '2026-01-22' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDate(filterDate === '2026-01-22' ? '' : '2026-01-22')}
                >
                  22 ม.ค. 2569
                </Button>
                {filterDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterDate('')}
                  >
                    ดูทั้งหมด
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-48"
                />
                <span className="text-xs text-muted-foreground">
                  หรือเลือกวันที่เอง
                </span>
              </div>
            </div>

            {(() => {
              // Filter posts by date
              const filteredPosts = filterDate
                ? posts.filter(post => {
                    if (!post.created_time) return false
                    const postDate = new Date(post.created_time).toISOString().split('T')[0]
                    return postDate === filterDate
                  })
                : posts

              return filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {filterDate 
                      ? `ไม่พบโพสต์ในวันที่ ${new Date(filterDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}`
                      : 'ไม่พบโพสต์'
                    }
                  </p>
                  {filterDate && (
                    <Button variant="link" onClick={() => setFilterDate('')}>
                      ดูโพสต์ทั้งหมด
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {filterDate && (
                    <Badge variant="outline" className="mb-2">
                      แสดง {filteredPosts.length} โพสต์ในวันที่ {new Date(filterDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Badge>
                  )}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-10">เลือก</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-20">รูป</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">ข้อความ</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-32">วันที่</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredPosts.map((post, index) => (
                        <tr 
                          key={post.id}
                          className={`cursor-pointer transition-colors ${
                            selectedPostId === post.id 
                              ? 'bg-blue-500/20' 
                              : 'hover:bg-muted/30'
                          }`}
                          onClick={() => setSelectedPostId(post.id)}
                        >
                          <td className="px-3 py-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedPostId === post.id 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-muted-foreground'
                            }`}>
                              {selectedPostId === post.id && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {post.full_picture ? (
                              <Image 
                                src={post.full_picture} 
                                alt="Post" 
                                width={64}
                                height={64}
                                className="w-16 h-16 object-cover rounded"
                                unoptimized
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted/50 rounded flex items-center justify-center">
                                <FileText className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <p className="text-sm line-clamp-3 max-w-md">
                              {post.message || '(ไม่มีข้อความ)'}
                            </p>
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {post.created_time 
                              ? new Date(post.created_time).toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Selected Post Info */}
                {selectedPostId && (
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-sm text-blue-400">
                      ✅ เลือกโพสต์ ID: {selectedPostId}
                    </p>
                  </div>
                )}
                
                {isLoading && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-center text-muted-foreground">
                      กำลังดึงคอมเมนต์... {progress}%
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  size="lg"
                  onClick={handleFetchComments}
                  disabled={isLoading || !selectedPostId}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      กำลังดึงคอมเมนต์...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      ดึงคอมเมนต์จากโพสต์นี้
                    </>
                  )}
                </Button>
              </>
              )
            })()}
          </CardContent>
        </Card>
      )}
      
      {/* Step 4: Preview */}
      {step === 'preview' && preview.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">👀 ตรวจสอบก่อนบันทึก</CardTitle>
                <CardDescription>
                  พบ {fetchedComments.length} คอมเมนต์ → {preview.length} รายชื่อ
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="success" className="px-3">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  ผ่าน {qualifiedCount}
                </Badge>
                <Badge variant="destructive" className="px-3">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  ไม่ผ่าน {failedCount}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="passed">
              <TabsList className="mb-4">
                <TabsTrigger value="passed">
                  ผ่านเงื่อนไข ({qualifiedCount})
                </TabsTrigger>
                <TabsTrigger value="failed">
                  ไม่ผ่าน ({failedCount})
                </TabsTrigger>
                <TabsTrigger value="all">
                  ทั้งหมด ({preview.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="passed">
                <ParticipantList participants={preview.filter(p => p.status === 'passed')} />
              </TabsContent>
              
              <TabsContent value="failed">
                <ParticipantList participants={preview.filter(p => p.status === 'failed')} />
              </TabsContent>
              
              <TabsContent value="all">
                <ParticipantList participants={preview} />
              </TabsContent>
            </Tabs>
            
            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={handleConfirmImport}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              ยืนยันนำเข้า {preview.length} รายชื่อ
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* How to get Access Token */}
      {step === 'token' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🔑 วิธีสร้าง Access Token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="outline">1</Badge>
              <div>
                <p className="font-medium">ไปที่ Facebook Graph API Explorer</p>
                <a 
                  href="https://developers.facebook.com/tools/explorer/" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:underline"
                >
                  developers.facebook.com/tools/explorer
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="outline">2</Badge>
              <div>
                <p className="font-medium">เลือก Facebook App ของคุณ</p>
                <p className="text-muted-foreground">หรือใช้ &ldquo;Meta App&rdquo; ที่สร้างไว้</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="outline">3</Badge>
              <div>
                <p className="font-medium">เพิ่ม Permissions</p>
                <p className="text-muted-foreground">
                  <code className="bg-muted px-1 rounded">pages_show_list</code>, 
                  <code className="bg-muted px-1 rounded ml-1">pages_read_engagement</code>, 
                  <code className="bg-muted px-1 rounded ml-1">pages_read_user_content</code>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="outline">4</Badge>
              <div>
                <p className="font-medium">Generate Access Token และคัดลอกมาวาง</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StepIndicator({ number, label, active, completed }: { 
  number: number
  label: string
  active: boolean
  completed: boolean 
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
      active ? 'bg-blue-500/20 text-blue-400' : 
      completed ? 'bg-green-500/20 text-green-400' : 
      'bg-muted text-muted-foreground'
    }`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        active ? 'bg-blue-500 text-white' :
        completed ? 'bg-green-500 text-white' :
        'bg-muted-foreground/50 text-background'
      }`}>
        {completed ? '✓' : number}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

function ParticipantList({ participants }: { participants: Participant[] }) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>ไม่มีข้อมูล</p>
      </div>
    )
  }
  
  return (
    <div className="max-h-80 overflow-y-auto space-y-2">
      {participants.slice(0, 20).map((p) => (
        <div 
          key={p.id} 
          className={`p-3 rounded-lg border ${p.status === 'passed' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium">{p.fbUserName}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{p.commentText}</p>
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
      {participants.length > 20 && (
        <p className="text-center text-sm text-muted-foreground">
          และอีก {participants.length - 20} รายการ...
        </p>
      )}
    </div>
  )
}
