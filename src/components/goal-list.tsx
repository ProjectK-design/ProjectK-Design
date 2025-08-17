'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { Goal } from '@/lib/database.types'
import { toast } from 'sonner'
import { Plus, Minus, Check, Calendar, Target } from 'lucide-react'
import { GoalActions } from './goal-actions'
import { GoalEditForm } from './goal-edit-form'

interface GoalListProps {
  refreshTrigger?: number
}

export function GoalList({ refreshTrigger }: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingGoals, setUpdatingGoals] = useState<Set<string>>(new Set())
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

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
      
      const { error } = await supabase
        .from('goals')
        .update({ 
          current_value: newValue,
          completed: isCompleted
        })
        .eq('id', goalId)

      if (error) throw error

      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { ...g, current_value: newValue, completed: isCompleted }
          : g
      ))

      if (isCompleted && !goal.completed) {
        toast.success('Goal completed! 🎉')
      }
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
      const { error } = await supabase
        .from('goals')
        .update({ completed: !goal.completed })
        .eq('id', goalId)

      if (error) throw error

      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { ...g, completed: !g.completed }
          : g
      ))

      toast.success(goal.completed ? 'Goal reopened' : 'Goal marked complete!')
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

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const handleGoalUpdated = () => {
    setEditingGoal(null)
    fetchGoals()
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

  if (editingGoal) {
    return (
      <div className="space-y-4">
        <GoalEditForm 
          goal={editingGoal} 
          onGoalUpdated={handleGoalUpdated}
          onCancel={() => setEditingGoal(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const progressPercentage = getProgressPercentage(goal.current_value, goal.target_value)
        const isUpdating = updatingGoals.has(goal.id)
        
        return (
          <Card key={goal.id} className={`${goal.completed ? 'opacity-75' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`${goal.completed ? 'line-through' : ''}`}>
                  {goal.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={goal.completed ? "secondary" : "default"}
                    size="sm"
                    onClick={() => toggleComplete(goal.id)}
                    disabled={isUpdating}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <GoalActions 
                    goal={goal} 
                    onGoalUpdated={fetchGoals}
                    onEdit={setEditingGoal}
                  />
                </div>
              </div>
              {goal.description && (
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                {goal.category && (
                  <>
                    <span>•</span>
                    <span>{goal.category}</span>
                  </>
                )}
                {goal.deadline && (
                  <>
                    <span>•</span>
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(goal.deadline)}</span>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              
              {!goal.completed && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateProgress(goal.id, Math.max(0, goal.current_value - 1))}
                    disabled={isUpdating || goal.current_value <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={goal.current_value}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      updateProgress(goal.id, value)
                    }}
                    className="flex-1 text-center"
                    disabled={isUpdating}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateProgress(goal.id, goal.current_value + 1)}
                    disabled={isUpdating}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}