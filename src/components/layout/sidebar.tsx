'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Upload, 
  Users, 
  Shuffle, 
  Trophy,
  Settings,
  Heart
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/import', label: 'นำเข้าข้อมูล', icon: Upload },
  { href: '/participants', label: 'รายชื่อผู้ร่วม', icon: Users },
  { href: '/draw', label: 'สุ่มรางวัล', icon: Shuffle },
  { href: '/results', label: 'ผลการสุ่ม', icon: Trophy },
  { href: '/settings', label: 'ตั้งค่า', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-sm flex flex-col">
      {/* Logo - Angthong Music Love */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-pink flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-pink-400">Angthong</h1>
            <p className="text-sm text-pink-300">Music Love 💕</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg glow-pink' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      
      {/* Footer - Developer Credit */}
      <div className="p-4 border-t">
        <div className="glass rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground">
            พัฒนาโดย
          </p>
          <p className="text-sm font-medium text-pink-400 mt-1">
            Tum jirawat
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            🎫 ระบบสุ่มแจกบัตร
          </p>
        </div>
      </div>
    </aside>
  )
}
