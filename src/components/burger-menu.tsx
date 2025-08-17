'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Menu, 
  Sun, 
  Moon, 
  Monitor, 
  LogOut, 
  Settings,
  User
} from 'lucide-react'
import { toast } from 'sonner'

export function BurgerMenu() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    // For now, just show a toast since we don't have authentication yet
    // This can be replaced with actual logout logic when auth is implemented
    toast.success('Logged out successfully!')
    setIsOpen(false)
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  const handleSettings = () => {
    // Open settings modal/page
    toast.info('Settings panel coming soon! 🛠️')
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {/* User Info Section */}
        <div className="flex items-center gap-2 p-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">User</span>
            <span className="text-xs text-muted-foreground">Goal Tracker</span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Theme Toggle Section */}
        <div className="px-2 py-1">
          <span className="text-xs font-medium text-muted-foreground px-2 py-1">Theme</span>
        </div>
        
        <DropdownMenuItem
          onClick={() => handleThemeChange('light')}
          className="cursor-pointer"
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
          {theme === 'light' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleThemeChange('dark')}
          className="cursor-pointer"
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
          {theme === 'dark' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleThemeChange('system')}
          className="cursor-pointer"
        >
          <Monitor className="h-4 w-4 mr-2" />
          System
          {theme === 'system' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Settings */}
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={handleSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}