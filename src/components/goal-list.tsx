'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Goal } from '@/lib/database.types'
import { toast } from 'sonner'
import { GoalCard } from './goal-card'

interface GoalListProps {
  refreshTrigger?: number
  onGoalUpdated?: () => void
  filters?: {
    search: string
    status: 'all' | 'active' | 'completed'
    category: string
    sortBy: 'created' | 'deadline' | 'progress' | 'xp'
    sortOrder: 'asc' | 'desc'
  }
}

export function GoalList({ refreshTrigger, onGoalUpdated, filters }: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingGoals, setUpdatingGoals] = useState<Set<string>>(new Set())
  const { user } = useAuth()

  const fetchGoals = async () => {
    try {
      let query = supabase
        .from('goals')
        .select('*')

      // Filter by user - show user's goals if authenticated, or anonymous goals if guest
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.is('user_id', null)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [refreshTrigger, user])

  // Filter and sort goals based on filters
  const filteredAndSortedGoals = useMemo(() => {
    if (!filters) return goals

    let filtered = goals

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(searchLower) ||
        goal.description?.toLowerCase().includes(searchLower) ||
        goal.category?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(goal => 
        filters.status === 'completed' ? goal.completed : !goal.completed
      )
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(goal => goal.category === filters.category)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number, bValue: number

      switch (filters.sortBy) {
        case 'deadline':
          aValue = a.deadline ? new Date(a.deadline).getTime() : 0
          bValue = b.deadline ? new Date(b.deadline).getTime() : 0
          break
        case 'progress':
          aValue = a.current_value / a.target_value
          bValue = b.current_value / b.target_value
          break
        case 'xp':
          aValue = a.xp_value
          bValue = b.xp_value
          break
        default: // 'created'
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
      }

      if (filters.sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return filtered
  }, [goals, filters])

  const updateProgress = async (goalId: string, newValue: number) => {
    setUpdatingGoals(prev => new Set(prev).add(goalId))
    
    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) return

      const isCompleted = newValue >= goal.target_value
      const progressPercentage = Math.min(newValue / goal.target_value, 1)
      
      // Award XP proportionally to progress, but only award full XP when completed
      let xpToAward: number
      if (isCompleted && !goal.completed) {
        // First time completing - award full XP
        xpToAward = goal.xp_value
      } else if (isCompleted) {
        // Already completed - keep existing XP
        xpToAward = goal.xp_earned
      } else {
        // Partial progress - award proportional XP (rounded to 1 decimal)
        xpToAward = Math.round(goal.xp_value * progressPercentage * 10) / 10
      }
      
      const { error } = await supabase
        .from('goals')
        .update({ 
          current_value: newValue,
          completed: isCompleted,
          xp_earned: xpToAward
        })
        .eq('id', goalId)

      if (error) throw error

      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { ...g, current_value: newValue, completed: isCompleted, xp_earned: xpToAward }
          : g
      ))

      if (isCompleted && !goal.completed) {
        toast.success(`Goal completed! +${goal.xp_value} XP earned! 🎉`)
      } else if (!isCompleted && xpToAward > goal.xp_earned) {
        const xpGained = Math.round((xpToAward - goal.xp_earned) * 10) / 10
        if (xpGained > 0) {
          toast.success(`Progress updated! +${xpGained} XP earned!`)
        }
      }
      
      // Trigger XP bar refresh
      onGoalUpdated?.()
    } catch (error) {
      console.error('Error updating goal:', error)
      toast.error('Failed to update progress')
    } finally {
      setUpdatingGoals(prev => {
        const newSet = new Set(prev)
        newSet.delete(goalId)
        return newSet
      })
    }
  }

  const toggleComplete = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    setUpdatingGoals(prev => new Set(prev).add(goalId))
    
    try {
      const newCompletedStatus = !goal.completed
      const xpToAward = newCompletedStatus ? goal.xp_value : 0
      
      const { error } = await supabase
        .from('goals')
        .update({ 
          completed: newCompletedStatus,
          xp_earned: xpToAward,
          current_value: newCompletedStatus ? goal.target_value : goal.current_value
        })
        .eq('id', goalId)

      if (error) throw error

      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { 
              ...g, 
              completed: newCompletedStatus, 
              xp_earned: xpToAward,
              current_value: newCompletedStatus ? goal.target_value : g.current_value
            }
          : g
      ))

      toast.success(goal.completed ? 'Goal reopened' : `Goal completed! +${goal.xp_value} XP earned! 🎉`)
      
      // Trigger XP bar refresh
      onGoalUpdated?.()
    } catch (error) {
      console.error('Error toggling goal:', error)
      toast.error('Failed to update goal')
    } finally {
      setUpdatingGoals(prev => {
        const newSet = new Set(prev)
        newSet.delete(goalId)
        return newSet
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading goals...</div>
  }

  if (goals.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-muted-foreground">No goals yet. Create your first goal to get started!</p>
        </CardContent>
      </Card>
    )
  }

  if (filteredAndSortedGoals.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-muted-foreground">No goals match your current filters.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {filteredAndSortedGoals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onGoalUpdated={() => {
            fetchGoals()
            onGoalUpdated?.()
          }}
          isUpdating={updatingGoals.has(goal.id)}
          onUpdateProgress={updateProgress}
          onToggleComplete={toggleComplete}
        />
      ))}
    </div>
  )
}