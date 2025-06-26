'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Brain, 
  FolderOpen, 
  Settings, 
  Home,
  BarChart3,
  Images,
  Cog
} from 'lucide-react'
import { cn } from '@neon/ui'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Agent Training', href: '/training', icon: Brain },
  { name: 'Asset Library', href: '/assets', icon: Images },
  { name: 'System Settings', href: '/settings', icon: Cog },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Neon AI</span>
            </Link>
            
            <div className="hidden md:flex md:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              v2.1.0
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 