'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { GoalInsert, HabitType } from '@/lib/database.types'
import { ChevronDown, Calendar, Repeat, Target, Zap, type LucideIcon } from 'lucide-react'

interface HabitFormData {
  title: string
  description?: string
  category?: string
  xp_value: number
  habit_type: HabitType
}

interface HabitFormProps {
  onHabitCreated?: () => void
}

const habitTypes: { value: HabitType; label: string; description: string; icon: LucideIcon }[] = [
  {
    value: 'daily',
    label: 'Daily',
    description: 'Complete every day',
    icon: Calendar
  },
  {
    value: 'weekly',
    label: 'Weekly',
    description: 'Complete once per week',
    icon: Repeat
  },
  {
    value: 'monthly',
    label: 'Monthly',
    description: 'Complete once per month',
    icon: Target
  },
  {
    value: 'one_time',
    label: 'One-time',
    description: 'Complete once',
    icon: Zap
  }
]

export function HabitForm({ onHabitCreated }: HabitFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedHabitType, setSelectedHabitType] = useState<HabitType>('daily')
  const { user } = useAuth()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HabitFormData>({
    defaultValues: {
      habit_type: 'daily',
      xp_value: 10
    }
  })

  const onSubmit = async (data: HabitFormData) => {
    setIsLoading(true)
    
    try {
      // For habits, we use target_value of 1 (just complete it)
      const habitData: GoalInsert = {
        title: data.title,
        description: data.description || null,
        target_value: 1,
        current_value: 0,
        unit: 'completion',
        category: data.category || null,
        deadline: null, // Habits don't have deadlines
        xp_value: Number(data.xp_value) || 10,
        user_id: user?.id || null,
        habit_type: data.habit_type,
        recurrence_pattern: null, // Can be expanded later for custom patterns
        calendar_event_id: null,
        auto_created_from_calendar: false,
        streak_count: 0,
        last_completed_date: null
      }

      console.log('Creating habit:', habitData)

      const { error } = await supabase
        .from('goals')
        .insert([habitData])

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      toast.success('Habit created successfully!')
      reset({
        title: '',
        description: '',
        category: '',
        xp_value: 10,
        habit_type: 'daily'
      })
      setSelectedHabitType('daily')
      onHabitCreated?.()
    } catch (error) {
      console.error('Error creating habit:', error)
      toast.error('Failed to create habit')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedType = habitTypes.find(type => type.value === selectedHabitType)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Create New Habit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Habit Name</Label>
            <Input
              id="title"
              {...register('title', { required: 'Habit name is required' })}
              placeholder="e.g., Morning workout, Read 30 minutes"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Optional description..."
              rows={2}
            />
          </div>

          <div>
            <Label>Frequency</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    {selectedType && <selectedType.icon className="h-4 w-4" />}
                    <span>{selectedType?.label}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {habitTypes.map((type) => (
                  <DropdownMenuItem
                    key={type.value}
                    onClick={() => setSelectedHabitType(type.value)}
                    className="flex items-center gap-2"
                  >
                    <type.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Health, Learning..."
              />
            </div>

            <div>
              <Label htmlFor="xp_value">XP Value</Label>
              <Input
                id="xp_value"
                type="number"
                min="1"
                max="100"
                {...register('xp_value', { 
                  valueAsNumber: true,
                  min: { value: 1, message: 'XP must be at least 1' },
                  max: { value: 100, message: 'XP cannot exceed 100' }
                })}
              />
              {errors.xp_value && (
                <p className="text-sm text-red-500 mt-1">{errors.xp_value.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Habit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}