'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Target } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  showCard?: boolean
}

export function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  showCard = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  const spinner = (
    <div className="flex items-center justify-center gap-2">
      <Target className={`${sizeClasses[size]} animate-pulse text-primary`} />
      <div className="animate-spin rounded-full border-2 border-primary border-t-transparent" 
           style={{ width: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px', 
                   height: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px' }} />
      {message && (
        <span className={`text-muted-foreground ${
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : ''
        }`}>
          {message}
        </span>
      )}
    </div>
  )

  if (showCard) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {spinner}
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return spinner
}

export function PageLoading({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" message={message} />
      </div>
    </div>
  )
}

export function ContentLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner message={message} />
    </div>
  )
}