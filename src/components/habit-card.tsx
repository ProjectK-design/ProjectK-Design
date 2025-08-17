'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Goal, HabitType } from '@/lib/database.types'
import { GoalActions } from '@/components/goal-actions'
import { GoalEditForm } from '@/components/goal-edit-form'
import { 
  ChevronDown, 
  ChevronRight, 
  Target, 
  Calendar, 
  Tag,
  Zap,
  Flame,
  CheckCircle,
  Circle,
  Repeat
} from 'lucide-react'

interface HabitCardProps {
  habit: Goal
  onHabitUpdated: () => void
  isUpdating: boolean
  onCompleteHabit: (habitId: string) => Promise<void>
  onToggleComplete: (habitId: string) => Promise<void>
}

export function HabitCard({ 
  habit, 
  onHabitUpdated, 
  isUpdating, 
  onCompleteHabit,
  onToggleComplete 
}: HabitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const getHabitTypeIcon = (type: HabitType) => {
    switch (type) {
      case 'daily': return Calendar
      case 'weekly': return Repeat
      case 'monthly': return Target
      default: return Zap
    }
  }

  const getHabitTypeLabel = (type: HabitType) => {
    switch (type) {
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      case 'monthly': return 'Monthly'
      case 'one_time': return 'One-time'
      default: return 'Custom'
    }
  }

  const getHabitTypeColor = (type: HabitType) => {
    switch (type) {
      case 'daily': return 'text-blue-500'
      case 'weekly': return 'text-green-500'
      case 'monthly': return 'text-purple-500'
      case 'one_time': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const handleComplete = async () => {
    if (habit.habit_type === 'one_time' || !habit.completed) {
      await onCompleteHabit(habit.id)
    } else {
      await onToggleComplete(habit.id)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setIsExpanded(false)
  }

  const handleEditComplete = () => {
    setIsEditing(false)
    onHabitUpdated()
  }

  const HabitTypeIcon = getHabitTypeIcon(habit.habit_type)

  if (isEditing) {
    return (
      <GoalEditForm 
        goal={habit} 
        onGoalUpdated={handleEditComplete}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <Card className={`transition-all duration-200 ${habit.completed ? 'opacity-75 bg-green-50 dark:bg-green-950/20' : ''} ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
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
                <HabitTypeIcon className={`h-4 w-4 ${getHabitTypeColor(habit.habit_type)}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg truncate ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {habit.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <HabitTypeIcon className="h-3 w-3" />
                    {getHabitTypeLabel(habit.habit_type)}
                  </span>
                  {habit.streak_count > 0 && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <Flame className="h-3 w-3" />
                      {habit.streak_count} day streak
                    </span>
                  )}
                  {habit.xp_earned > 0 && (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Zap className="h-3 w-3" />
                      {habit.xp_earned} XP
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick completion button */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleComplete()
                }}
                disabled={isUpdating}
                className={`h-8 w-8 p-0 ${habit.completed ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`}
              >
                {habit.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t bg-muted/25 p-4 space-y-4">
            {habit.description && (
              <div>
                <p className="text-muted-foreground">{habit.description}</p>
              </div>
            )}

            {/* Habit Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {habit.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>{habit.category}</span>
                </div>
              )}
              
              {habit.last_completed_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Last: {formatDate(habit.last_completed_date)}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>{habit.xp_value} XP potential</span>
              </div>
            </div>

            {/* Streak Information */}
            {habit.streak_count > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="font-medium text-orange-700 dark:text-orange-300">
                    {habit.streak_count} Day Streak! 🔥
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    Keep it up to build momentum!
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex gap-2 flex-1">
                <Button
                  variant={habit.completed ? "outline" : "default"}
                  onClick={handleComplete}
                  disabled={isUpdating}
                  className={`flex-1 ${habit.completed ? "" : "bg-green-600 hover:bg-green-700"}`}
                >
                  {habit.completed ? (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      Mark Incomplete
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Today
                    </>
                  )}
                </Button>
                
                <GoalActions 
                  goal={habit} 
                  onEdit={handleEdit}
                  onGoalUpdated={onHabitUpdated}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}