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
import { GoalInsert } from '@/lib/database.types'

type GoalFormData = {
  title: string
  description?: string
  target_value: number
  unit: string
  category?: string
  deadline?: string
}

interface GoalFormProps {
  onGoalCreated?: () => void
}

export function GoalForm({ onGoalCreated }: GoalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>()

  const onSubmit = async (data: GoalFormData) => {
    setIsLoading(true)
    
    try {
      const goalData: GoalInsert = {
        title: data.title,
        description: data.description || null,
        target_value: data.target_value,
        unit: data.unit,
        category: data.category || null,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      }

      const { error } = await supabase
        .from('goals')
        .insert([goalData])

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      toast.success('Goal created successfully!')
      reset()
      onGoalCreated?.()
    } catch (error) {
      console.error('Error creating goal:', error)
      toast.error('Failed to create goal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create New Goal</CardTitle>
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Goal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}