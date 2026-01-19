'use client'

import { useState } from 'react'
import { useGiveawayStore } from '@/stores/giveaway-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Users, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  MessageCircle,
  Hash,
  AtSign
} from 'lucide-react'
import { Participant } from '@/types/participant'

export default function ParticipantsPage() {
  const { participants, getStatistics } = useGiveawayStore()
  const stats = getStatistics()
  
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all')
  
  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = 
      p.fbUserName.toLowerCase().includes(search.toLowerCase()) ||
      p.commentText.toLowerCase().includes(search.toLowerCase())
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'passed' && p.status === 'passed') ||
      (filter === 'failed' && p.status === 'failed')
    
    return matchesSearch && matchesFilter
  })
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">👥 รายชื่อผู้เข้าร่วม</h1>
          <p className="text-muted-foreground mt-1">
            ดูและตรวจสอบสถานะผู้เข้าร่วมกิจกรรมทั้งหมด
          </p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setFilter('all')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ทั้งหมด</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:border-green-500/50 transition-colors" onClick={() => setFilter('passed')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ผ่านเงื่อนไข</p>
                <p className="text-3xl font-bold text-green-400">{stats.qualified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:border-red-500/50 transition-colors" onClick={() => setFilter('failed')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ไม่ผ่านเงื่อนไข</p>
                <p className="text-3xl font-bold text-red-400">{stats.disqualified}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อหรือข้อความคอมเมนต์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="passed">ผ่าน</TabsTrigger>
            <TabsTrigger value="failed">ไม่ผ่าน</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Participant List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            รายชื่อ ({filteredParticipants.length} คน)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>ไม่พบข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredParticipants.map((participant) => (
                <ParticipantCard key={participant.id} participant={participant} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ParticipantCard({ participant }: { participant: Participant }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div 
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        participant.status === 'passed' 
          ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50' 
          : 'border-red-500/30 bg-red-500/5 hover:border-red-500/50'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Main Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{participant.fbUserName}</h3>
            {participant.fbProfileUrl && (
              <a 
                href={participant.fbProfileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {participant.commentText}
          </p>
        </div>
        
        <Badge variant={participant.status === 'passed' ? 'success' : 'destructive'}>
          {participant.status === 'passed' ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
        </Badge>
      </div>
      
      {/* Condition Badges */}
      <div className="flex flex-wrap gap-2 mt-3">
        <Badge variant={participant.conditions.hasTaggedFriend ? 'success' : 'destructive'} className="text-xs">
          <AtSign className="w-3 h-3 mr-1" />
          แท็ก {participant.taggedFriends.length} คน
        </Badge>
        <Badge variant={participant.conditions.hasHashtag ? 'success' : 'destructive'} className="text-xs">
          <Hash className="w-3 h-3 mr-1" />
          #AngThongMusicLove
        </Badge>
        <Badge variant={participant.conditions.hasReason ? 'success' : 'destructive'} className="text-xs">
          <MessageCircle className="w-3 h-3 mr-1" />
          {participant.textLength} ตัวอักษร
        </Badge>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
          {/* Full Comment */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">คอมเมนต์เต็ม:</p>
            <p className="text-sm bg-muted/50 p-3 rounded">{participant.commentText}</p>
          </div>
          
          {/* Tagged Friends */}
          {participant.taggedFriends.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">แท็กเพื่อน:</p>
              <div className="flex flex-wrap gap-1">
                {participant.taggedFriends.map((friend, i) => (
                  <Badge key={i} variant="outline">@{friend.name}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Fail Reasons */}
          {participant.failReasons.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">เหตุผลที่ไม่ผ่าน:</p>
              <div className="space-y-1">
                {participant.failReasons.map((reason, i) => (
                  <p key={i} className="text-sm text-red-400">❌ {reason}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* Comment Time */}
          <div className="text-xs text-muted-foreground">
            คอมเมนต์เมื่อ: {new Date(participant.commentTime).toLocaleString('th-TH')}
          </div>
        </div>
      )}
    </div>
  )
}
