'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Goal } from '@/lib/database.types'
import { Zap, Calendar, TrendingUp, Trophy, Star, Target, Fire, Award } from 'lucide-react'

interface XPStats {
  totalXP: number
  weeklyXP: number
  monthlyXP: number
  level: number
  xpToNextLevel: number
  weeklyGoalsCompleted: number
  monthlyGoalsCompleted: number
  currentStreak: number
  longestStreak: number
  totalGoalsCompleted: number
  averageDaily: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress: number
  maxProgress: number
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
    monthlyGoalsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalGoalsCompleted: 0,
    averageDaily: 0
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [showAchievements, setShowAchievements] = useState(false)

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

  const calculateStreaks = (goals: Goal[]) => {
    const completedGoals = goals.filter(g => g.completed).sort((a, b) => 
      new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    )
    
    if (completedGoals.length === 0) return { currentStreak: 0, longestStreak: 0 }
    
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null
    
    completedGoals.forEach(goal => {
      const goalDate = new Date(goal.updated_at)
      goalDate.setHours(0, 0, 0, 0)
      
      if (!lastDate) {
        tempStreak = 1
      } else {
        const dayDiff = Math.floor((goalDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        if (dayDiff <= 1) {
          if (dayDiff === 1) tempStreak++
        } else {
          tempStreak = 1
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak)
      lastDate = goalDate
    })
    
    // Calculate current streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastGoalDate = lastDate
    
    if (lastGoalDate) {
      const daysSinceLastGoal = Math.floor((today.getTime() - lastGoalDate.getTime()) / (1000 * 60 * 60 * 24))
      currentStreak = daysSinceLastGoal <= 1 ? tempStreak : 0
    }
    
    return { currentStreak, longestStreak }
  }

  const generateAchievements = (stats: XPStats): Achievement[] => [
    {
      id: 'first-goal',
      title: 'Getting Started',
      description: 'Complete your first goal',
      icon: <Target className="h-4 w-4" />,
      unlocked: stats.totalGoalsCompleted >= 1,
      progress: Math.min(stats.totalGoalsCompleted, 1),
      maxProgress: 1
    },
    {
      id: 'goal-crusher',
      title: 'Goal Crusher',
      description: 'Complete 10 goals',
      icon: <Trophy className="h-4 w-4" />,
      unlocked: stats.totalGoalsCompleted >= 10,
      progress: Math.min(stats.totalGoalsCompleted, 10),
      maxProgress: 10
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 7-day streak',
      icon: <Fire className="h-4 w-4" />,
      unlocked: stats.longestStreak >= 7,
      progress: Math.min(stats.longestStreak, 7),
      maxProgress: 7
    },
    {
      id: 'xp-collector',
      title: 'XP Collector',
      description: 'Earn 1000 XP',
      icon: <Star className="h-4 w-4" />,
      unlocked: stats.totalXP >= 1000,
      progress: Math.min(stats.totalXP, 1000),
      maxProgress: 1000
    },
    {
      id: 'level-up',
      title: 'Level Up',
      description: 'Reach Level 5',
      icon: <Award className="h-4 w-4" />,
      unlocked: stats.level >= 5,
      progress: Math.min(stats.level, 5),
      maxProgress: 5
    }
  ]

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
      let totalGoalsCompleted = 0

      goals?.forEach((goal: Goal) => {
        totalXP += goal.xp_earned
        if (goal.completed) totalGoalsCompleted++
        
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

      const { currentStreak, longestStreak } = calculateStreaks(goals || [])
      const averageDaily = goals?.length ? totalXP / Math.max(1, Math.ceil((now.getTime() - new Date(goals[goals.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24))) : 0

      const { level, xpToNextLevel } = calculateLevel(totalXP)

      const newStats = {
        totalXP,
        weeklyXP,
        monthlyXP,
        level,
        xpToNextLevel,
        weeklyGoalsCompleted,
        monthlyGoalsCompleted,
        currentStreak,
        longestStreak,
        totalGoalsCompleted,
        averageDaily: Math.round(averageDaily * 10) / 10
      }

      setXpStats(newStats)
      setAchievements(generateAchievements(newStats))
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
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
              {xpStats.currentStreak > 0 && (
                <Fire className="h-3 w-3 text-orange-500 absolute -top-1 -right-1" />
              )}
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Level {level}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xl font-bold">{xpStats.totalXP.toLocaleString()} XP</span>
          </CardTitle>
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 text-sm font-medium hover:shadow-lg transition-all duration-200"
          >
            <Trophy className="h-4 w-4" />
            Achievements
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress to Level {level + 1}</span>
            <span className="text-muted-foreground">{xpToNextLevel} XP to go</span>
          </div>
          <div className="relative w-full bg-muted rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 p-4 rounded-xl border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-sm">This Week</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {xpStats.weeklyXP}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {xpStats.weeklyGoalsCompleted} goals • {xpStats.weeklyXP} XP
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-sm">This Month</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {xpStats.monthlyXP}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {xpStats.monthlyGoalsCompleted} goals • {xpStats.monthlyXP} XP
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950 dark:to-red-900 p-4 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Fire className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-sm">Current Streak</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {xpStats.currentStreak}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">
                {xpStats.currentStreak === 1 ? 'day' : 'days'} • Best: {xpStats.longestStreak}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900 p-4 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-sm">Total Stats</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {xpStats.totalGoalsCompleted}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                goals • {xpStats.averageDaily} XP/day avg
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        {showAchievements && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800 shadow-md'
                      : 'bg-muted border-muted-foreground/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      achievement.unlocked 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${achievement.unlocked ? 'text-yellow-700 dark:text-yellow-300' : 'text-muted-foreground'}`}>
                          {achievement.title}
                        </h4>
                        {achievement.unlocked && (
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {!achievement.unlocked && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full bg-muted-foreground/20 rounded-full h-1">
                            <div 
                              className="bg-yellow-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}