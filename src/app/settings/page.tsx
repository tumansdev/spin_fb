'use client'

import { useState } from 'react'
import { useGiveawayStore } from '@/stores/giveaway-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { 
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Hash,
  Users,
  Trophy,
  MessageCircle,
  ThumbsUp,
  Share2,
  HelpCircle
} from 'lucide-react'

export default function SettingsPage() {
  const { config, updateConfig, clearDrawHistory, clearParticipants } = useGiveawayStore()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    eventName: config.eventName,
    postUrl: config.postUrl,
    requiredHashtag: config.requiredHashtag,
    enableHashtag: config.enableHashtag ?? true,
    minTextLength: config.minTextLength,
    enableMinLength: config.enableMinLength ?? true,
    minTaggedFriends: config.minTaggedFriends,
    enableTag: config.enableTag ?? true,
    likeVerification: config.likeVerification,
    shareVerification: config.shareVerification,

  })
  
  const handleSave = () => {
    updateConfig(formData)
    toast({
      title: '✅ บันทึกสำเร็จ!',
      description: 'การตั้งค่าถูกบันทึกเรียบร้อยแล้ว',
    })
  }
  
  const handleReset = () => {
    setFormData({
      eventName: 'Angthong Music Love 2026',
      postUrl: '',
      requiredHashtag: '#AngThongMusicLove',
      enableHashtag: true,
      minTextLength: 30,
      enableMinLength: true,
      minTaggedFriends: 1,
      enableTag: true,
      likeVerification: 'skip',
      shareVerification: 'skip',

    })
  }
  
  const handleClearAll = () => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะล้างข้อมูลทั้งหมด? (รายชื่อและประวัติการสุ่ม)')) {
      clearParticipants()
      clearDrawHistory()
      toast({
        title: 'ล้างข้อมูลสำเร็จ',
        description: 'ลบรายชื่อและประวัติการสุ่มทั้งหมดแล้ว',
      })
    }
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">⚙️ ตั้งค่า</h1>
          <p className="text-muted-foreground mt-1">
            ปรับแต่งเงื่อนไขและการตั้งค่ากิจกรรม
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              ข้อมูลกิจกรรม
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">ชื่องาน</Label>
              <Input
                id="eventName"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                placeholder="Angthong Music Love 2026"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postUrl">ลิงก์โพสต์</Label>
              <Input
                id="postUrl"
                value={formData.postUrl}
                onChange={(e) => setFormData({ ...formData, postUrl: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requiredHashtag">Hashtag ที่ต้องมี</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="requiredHashtag"
                  value={formData.requiredHashtag}
                  onChange={(e) => setFormData({ ...formData, requiredHashtag: e.target.value })}
                  className="pl-10"
                  placeholder="#AngThongMusicLove"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Condition Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              เงื่อนไขการร่วมกิจกรรม
            </CardTitle>
            <CardDescription>
              เปิด/ปิดและปรับเงื่อนไขที่ใช้ตรวจสอบอัตโนมัติ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hashtag Requirement */}
            <div className="p-4 rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableHashtag" className="flex items-center gap-2 cursor-pointer">
                  <Hash className="w-4 h-4" />
                  ต้องมี Hashtag
                </Label>
                <Switch
                  id="enableHashtag"
                  checked={formData.enableHashtag}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableHashtag: checked })}
                />
              </div>
              {formData.enableHashtag && (
                <Input
                  value={formData.requiredHashtag}
                  onChange={(e) => setFormData({ ...formData, requiredHashtag: e.target.value })}
                  placeholder="#AngThongMusicLove"
                  className="bg-background"
                />
              )}
            </div>
            
            {/* Tag Friends Requirement */}
            <div className="p-4 rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableTag" className="flex items-center gap-2 cursor-pointer">
                  <Users className="w-4 h-4" />
                  ต้องแท็กเพื่อน
                </Label>
                <Switch
                  id="enableTag"
                  checked={formData.enableTag}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableTag: checked })}
                />
              </div>
              {formData.enableTag && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">จำนวนขั้นต่ำ:</span>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.minTaggedFriends}
                    onChange={(e) => setFormData({ ...formData, minTaggedFriends: parseInt(e.target.value) || 1 })}
                    className="w-20 bg-background"
                  />
                  <span className="text-sm text-muted-foreground">คน</span>
                </div>
              )}
            </div>
            
            {/* Min Text Length Requirement */}
            <div className="p-4 rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableMinLength" className="flex items-center gap-2 cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  ต้องมีความยาวขั้นต่ำ
                </Label>
                <Switch
                  id="enableMinLength"
                  checked={formData.enableMinLength}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableMinLength: checked })}
                />
              </div>
              {formData.enableMinLength && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">ตัวอักษรขั้นต่ำ:</span>
                  <Input
                    type="number"
                    min={0}
                    max={200}
                    value={formData.minTextLength}
                    onChange={(e) => setFormData({ ...formData, minTextLength: parseInt(e.target.value) || 0 })}
                    className="w-20 bg-background"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                ใช้ตรวจว่าผู้ร่วมกิจกรรมบอกเหตุผลเพียงพอหรือไม่
              </p>
            </div>
          </CardContent>
        </Card>
        


        {/* Verification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🔍 การตรวจสอบ</CardTitle>
            <CardDescription>
              เงื่อนไขที่ Facebook API ไม่สามารถตรวจสอบได้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  <span>กด Like เพจ</span>
                </div>
                <Badge variant={formData.likeVerification === 'skip' ? 'warning' : 'outline'}>
                  {formData.likeVerification === 'skip' ? 'ข้าม' : 'ตรวจสอบ Manual'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Facebook API ไม่อนุญาตให้ตรวจสอบ followers โดยตรง
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>กด Share โพสต์</span>
                </div>
                <Badge variant={formData.shareVerification === 'skip' ? 'warning' : 'outline'}>
                  {formData.shareVerification === 'skip' ? 'ข้าม' : 'ตรวจสอบ Manual'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                ต้องตรวจสอบด้วยตนเองหรือข้ามเงื่อนไขนี้
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Danger Zone */}
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-red-400">⚠️ Danger Zone</CardTitle>
            <CardDescription>
              การกระทำเหล่านี้ไม่สามารถย้อนกลับได้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={handleClearAll}
            >
              ล้างข้อมูลทั้งหมด
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              ลบรายชื่อผู้เข้าร่วมและประวัติการสุ่มทั้งหมด
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Save Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          รีเซ็ตค่าเริ่มต้น
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          บันทึกการตั้งค่า
        </Button>
      </div>
    </div>
  )
}
