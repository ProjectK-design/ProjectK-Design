'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Goal } from '@/lib/database.types'
import { GoalActions } from '@/components/goal-actions'
import { GoalEditForm } from '@/components/goal-edit-form'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  ChevronDown, 
  ChevronRight, 
  Target, 
  Calendar, 
  Tag,
  Zap,
  TrendingUp
} from 'lucide-react'

interface GoalCardProps {
  goal: Goal
  onGoalUpdated: () => void
  isUpdating: boolean
  onUpdateProgress: (goalId: string, newValue: number) => Promise<void>
  onToggleComplete: (goalId: string) => Promise<void>
}

export function GoalCard({ 
  goal, 
  onGoalUpdated, 
  isUpdating, 
  onUpdateProgress, 
  onToggleComplete 
}: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [progressValue, setProgressValue] = useState(goal.current_value.toString())

  const progressPercentage = Math.min((goal.current_value / goal.target_value) * 100, 100)
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newValue = parseFloat(progressValue)
    if (isNaN(newValue) || newValue < 0) {
      toast.error('Please enter a valid number')
      return
    }
    await onUpdateProgress(goal.id, newValue)
  }

  const handleGoalComplete = async () => {
    // Award XP when completing a goal
    if (!goal.completed) {
      try {
        const { error } = await supabase
          .from('goals')
          .update({ 
            xp_earned: goal.xp_value,
            completed: true,
            current_value: goal.target_value
          })
          .eq('id', goal.id)

        if (error) throw error
        toast.success(`Goal completed! +${goal.xp_value} XP earned! 🎉`)
        onGoalUpdated()
      } catch (error) {
        console.error('Error completing goal:', error)
        toast.error('Failed to complete goal')
      }
    } else {
      await onToggleComplete(goal.id)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setIsExpanded(false)
  }

  const handleEditComplete = () => {
    setIsEditing(false)
    onGoalUpdated()
  }

  if (isEditing) {
    return (
      <GoalEditForm 
        goal={goal} 
        onGoalUpdated={handleEditComplete}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <Card className={`transition-all duration-200 ${goal.completed ? 'opacity-75' : ''} ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
      <CardContent className="p-0">
        {/* Card Header - Always Visible */}
        <div 
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Target className={`h-4 w-4 ${goal.completed ? 'text-green-500' : 'text-blue-500'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg truncate ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {goal.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {goal.current_value}/{goal.target_value} {goal.unit}
                  </span>
                  {goal.xp_earned > 0 && (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Zap className="h-3 w-3" />
                      {goal.xp_earned} XP
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <div className="w-16 text-right text-sm font-medium">
                {Math.round(progressPercentage)}%
              </div>
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    goal.completed 
                      ? 'bg-green-500' 
                      : progressPercentage >= 100 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t bg-muted/25 p-4 space-y-4">
            {goal.description && (
              <div>
                <p className="text-muted-foreground">{goal.description}</p>
              </div>
            )}

            {/* Goal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {goal.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>{goal.category}</span>
                </div>
              )}
              
              {goal.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Due: {formatDate(goal.deadline)}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>{goal.xp_value} XP potential</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    goal.completed 
                      ? 'bg-green-500' 
                      : progressPercentage >= 100 
                        ? 'bg-yellow-500' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{goal.current_value} {goal.unit}</span>
                <span>{goal.target_value} {goal.unit}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {!goal.completed && (
                <form onSubmit={handleProgressSubmit} className="flex gap-2 flex-1">
                  <Input
                    type="number"
                    value={progressValue}
                    onChange={(e) => setProgressValue(e.target.value)}
                    placeholder={`Current ${goal.unit}`}
                    className="flex-1"
                    step="0.01"
                    min="0"
                  />
                  <Button type="submit" disabled={isUpdating}>
                    Update
                  </Button>
                </form>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant={goal.completed ? "outline" : "default"}
                  onClick={handleGoalComplete}
                  disabled={isUpdating}
                  className={goal.completed ? "" : "bg-green-600 hover:bg-green-700"}
                >
                  {goal.completed ? 'Reopen' : 'Complete'}
                </Button>
                
                <GoalActions 
                  goal={goal} 
                  onEdit={handleEdit}
                  onGoalUpdated={onGoalUpdated}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}