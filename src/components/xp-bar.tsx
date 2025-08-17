'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Goal } from '@/lib/database.types'
import { Zap, Calendar, TrendingUp } from 'lucide-react'

interface XPStats {
  totalXP: number
  weeklyXP: number
  monthlyXP: number
  level: number
  xpToNextLevel: number
  weeklyGoalsCompleted: number
  monthlyGoalsCompleted: number
}

interface XPBarProps {
  refreshTrigger?: number
}

export function XPBar({ refreshTrigger }: XPBarProps) {
  const [xpStats, setXpStats] = useState<XPStats>({
    totalXP: 0,
    weeklyXP: 0,
    monthlyXP: 0,
    level: 1,
    xpToNextLevel: 100,
    weeklyGoalsCompleted: 0,
    monthlyGoalsCompleted: 0
  })
  const [loading, setLoading] = useState(true)

  const calculateLevel = (totalXP: number) => {
    // Level formula: each level requires 100 * level XP (100, 200, 300, etc.)
    let level = 1
    let xpNeeded = 100
    let xpUsed = 0

    while (totalXP >= xpUsed + xpNeeded) {
      xpUsed += xpNeeded
      level++
      xpNeeded = 100 * level
    }

    const xpToNextLevel = xpNeeded - (totalXP - xpUsed)
    return { level, xpToNextLevel, currentLevelXP: totalXP - xpUsed, maxLevelXP: xpNeeded }
  }

  const fetchXPStats = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get all goals
      const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Calculate XP stats
      let totalXP = 0
      let weeklyXP = 0
      let monthlyXP = 0
      let weeklyGoalsCompleted = 0
      let monthlyGoalsCompleted = 0

      goals?.forEach((goal: Goal) => {
        totalXP += goal.xp_earned
        
        const goalUpdated = new Date(goal.updated_at)
        
        if (goalUpdated >= oneWeekAgo) {
          weeklyXP += goal.xp_earned
          if (goal.completed && goalUpdated >= oneWeekAgo) {
            weeklyGoalsCompleted++
          }
        }
        
        if (goalUpdated >= oneMonthAgo) {
          monthlyXP += goal.xp_earned
          if (goal.completed && goalUpdated >= oneMonthAgo) {
            monthlyGoalsCompleted++
          }
        }
      })

      const { level, xpToNextLevel } = calculateLevel(totalXP)

      setXpStats({
        totalXP,
        weeklyXP,
        monthlyXP,
        level,
        xpToNextLevel,
        weeklyGoalsCompleted,
        monthlyGoalsCompleted
      })
    } catch (error) {
      console.error('Error fetching XP stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchXPStats()
  }, [refreshTrigger, fetchXPStats])

  const { level, xpToNextLevel, currentLevelXP, maxLevelXP } = calculateLevel(xpStats.totalXP)
  const progressPercentage = maxLevelXP > 0 ? (currentLevelXP / maxLevelXP) * 100 : 0

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-muted rounded w-full mb-4"></div>
            <div className="flex gap-4">
              <div className="h-16 bg-muted rounded flex-1"></div>
              <div className="h-16 bg-muted rounded flex-1"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Level {level} - {xpStats.totalXP} XP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress to Level {level + 1}</span>
            <span>{xpToNextLevel} XP to go</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Weekly and Monthly Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-sm">This Week</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {xpStats.weeklyXP} XP
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {xpStats.weeklyGoalsCompleted} goals completed
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-sm">This Month</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {xpStats.monthlyXP} XP
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {xpStats.monthlyGoalsCompleted} goals completed
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}