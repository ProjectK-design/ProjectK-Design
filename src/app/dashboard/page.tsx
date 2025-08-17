'use client'

import { useState, useEffect, useMemo } from 'react'
import { GoalForm } from '@/components/goal-form'
import { HabitForm } from '@/components/habit-form'
import { GoalList } from '@/components/goal-list'
import { XPBar } from '@/components/xp-bar'
import { BurgerMenu } from '@/components/burger-menu'
import { GoalFiltersComponent, type GoalFilters } from '@/components/goal-filters'
import { AuthGuard } from '@/components/auth-guard'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Plus, Target, Repeat } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Goal } from '@/lib/database.types'

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<'goals' | 'habits'>('habits') // Default to habits
  const [formType, setFormType] = useState<'goal' | 'habit'>('habit')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [goals, setGoals] = useState<Goal[]>([])
  const [filters, setFilters] = useState<GoalFilters>({
    search: '',
    status: 'all',
    category: '',
    sortBy: 'created',
    sortOrder: 'desc'
  })
  const { user } = useAuth()

  const handleGoalCreated = () => {
    setShowForm(false)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleGoalUpdated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleCreateNew = (type: 'goal' | 'habit') => {
    setFormType(type)
    setShowForm(true)
  }

  // Filter goals vs habits based on view mode
  const filteredItems = useMemo(() => {
    if (viewMode === 'habits') {
      // Show items that are habits (not one-time goals)
      return goals.filter(goal => goal.habit_type && goal.habit_type !== 'one_time')
    } else {
      // Show items that are traditional goals (one-time or undefined habit_type)
      return goals.filter(goal => !goal.habit_type || goal.habit_type === 'one_time')
    }
  }, [goals, viewMode])

  // Extract unique categories from current view for filter dropdown
  const categories = useMemo(() => {
    const cats = filteredItems
      .map(item => item.category)
      .filter((category): category is string => Boolean(category))
    return [...new Set(cats)]
  }, [filteredItems])

  // Fetch goals to get categories for filtering
  useEffect(() => {
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

        const { data } = await query.order('created_at', { ascending: false })
        
        if (data) setGoals(data)
      } catch (error) {
        console.error('Error fetching goals for categories:', error)
      }
    }
    fetchGoals()
  }, [refreshTrigger, user])

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              <span className="text-xl font-bold">Project K</span>
            </div>
            <BurgerMenu />
          </div>
          
          {/* Main Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {viewMode === 'habits' ? (
                <Repeat className="h-8 w-8" />
              ) : (
                <Target className="h-8 w-8" />
              )}
              <h1 className="text-4xl font-bold">Project K</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {viewMode === 'habits' 
                ? 'Build lasting habits and track your daily progress' 
                : 'Track your goals and make progress every day'
              }
            </p>
            
            {/* View Mode Toggle */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant={viewMode === 'habits' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('habits')}
                className="flex items-center gap-2"
              >
                <Repeat className="h-4 w-4" />
                Habits
              </Button>
              <Button
                variant={viewMode === 'goals' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('goals')}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Goals
              </Button>
            </div>
          </div>
        </header>

        {/* XP Bar - Full Width */}
        <XPBar refreshTrigger={refreshTrigger} />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            {!showForm ? (
              <div className="sticky top-8 space-y-3">
                <Button 
                  onClick={() => handleCreateNew(viewMode === 'habits' ? 'habit' : 'goal')} 
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New {viewMode === 'habits' ? 'Habit' : 'Goal'}
                </Button>
                
                {/* Quick action for the other type */}
                <Button 
                  variant="outline"
                  onClick={() => handleCreateNew(viewMode === 'habits' ? 'goal' : 'habit')} 
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Or create {viewMode === 'habits' ? 'goal' : 'habit'}
                </Button>
              </div>
            ) : (
              <div className="sticky top-8">
                {formType === 'habit' ? (
                  <HabitForm onHabitCreated={handleGoalCreated} />
                ) : (
                  <GoalForm onGoalCreated={handleGoalCreated} />
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="w-full mt-4"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="lg:w-2/3">
            {/* Goal Filters */}
            <GoalFiltersComponent
              filters={filters}
              categories={categories}
              onFiltersChange={setFilters}
            />

            {/* Goal List with Filters */}
            <GoalList 
              refreshTrigger={refreshTrigger} 
              onGoalUpdated={handleGoalUpdated}
              filters={filters}
              viewMode={viewMode}
            />
          </div>
        </div>
        </div>
      </div>
    </AuthGuard>
  )
}