'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Goal } from '@/lib/database.types'
import { toast } from 'sonner'
import { GoalCard } from './goal-card'

interface GoalListProps {
  refreshTrigger?: number
  onGoalUpdated?: () => void
}

export function GoalList({ refreshTrigger, onGoalUpdated }: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingGoals, setUpdatingGoals] = useState<Set<string>>(new Set())

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

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
  }, [refreshTrigger])

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

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
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