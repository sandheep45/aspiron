import type { LinkProps } from '@tanstack/react-router'
import {
  BarChart3,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  Video,
} from 'lucide-react'
import type * as React from 'react'

export interface SidebarItem {
  id: string
  label: string
  href: LinkProps['to']
  icon: React.JSX.Element
}

export const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className='h-5 w-5' />,
    href: '/dashboard',
  },
  {
    id: 'content',
    label: 'Content',
    icon: <FileText className='h-5 w-5' />,
    href: '/content',
  },
  {
    id: 'tests',
    label: 'Tests & Quizzes',
    icon: <ClipboardCheck className='h-5 w-5' />,
    href: '/quizzes',
  },
  {
    id: 'classes',
    label: 'Live Classes',
    icon: <Video className='h-5 w-5' />,
    href: '/live-classes',
  },
  {
    id: 'community',
    label: 'Community',
    icon: <Users className='h-5 w-5' />,
    href: '/community',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className='h-5 w-5' />,
    href: '/analytics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className='h-5 w-5' />,
    href: '/settings',
  },
]
