'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Goal, GoalUpdate } from '@/lib/database.types'

type GoalFormData = {
  title: string
  description?: string
  target_value: number
  unit: string
  category?: string
  deadline?: string
}

interface GoalEditFormProps {
  goal: Goal
  onGoalUpdated: () => void
  onCancel: () => void
}

export function GoalEditForm({ goal, onGoalUpdated, onCancel }: GoalEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalFormData>({
    defaultValues: {
      title: goal.title,
      description: goal.description || '',
      target_value: goal.target_value,
      unit: goal.unit,
      category: goal.category || '',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
    }
  })

  const onSubmit = async (data: GoalFormData) => {
    setIsLoading(true)
    
    try {
      const goalData: GoalUpdate = {
        title: data.title,
        description: data.description || null,
        target_value: data.target_value,
        unit: data.unit,
        category: data.category || null,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      }

      const { error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', goal.id)

      if (error) throw error

      toast.success('Goal updated successfully!')
      onGoalUpdated()
    } catch (error) {
      console.error('Error updating goal:', error)
      toast.error('Failed to update goal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Edit Goal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Run 100 miles"
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
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_value">Target</Label>
              <Input
                id="target_value"
                type="number"
                step="0.01"
                {...register('target_value', { valueAsNumber: true })}
                placeholder="100"
              />
              {errors.target_value && (
                <p className="text-sm text-red-500 mt-1">{errors.target_value.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                {...register('unit')}
                placeholder="miles"
              />
              {errors.unit && (
                <p className="text-sm text-red-500 mt-1">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="e.g., Health, Learning, etc."
            />
          </div>

          <div>
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              {...register('deadline')}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Goal'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}