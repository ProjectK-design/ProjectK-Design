'use client'

import { useState } from 'react'
import { GoalForm } from '@/components/goal-form'
import { GoalList } from '@/components/goal-list'
import { XPBar } from '@/components/xp-bar'
import { BurgerMenu } from '@/components/burger-menu'
import { Button } from '@/components/ui/button'
import { Plus, Target } from 'lucide-react'

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleGoalCreated = () => {
    setShowForm(false)
    setRefreshTrigger(prev => prev + 1)
  }

  return (
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
              <Target className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Project K</h1>
            </div>
            <p className="text-muted-foreground text-lg">Track your goals and make progress every day</p>
          </div>
        </header>

        {/* XP Bar - Full Width */}
        <XPBar refreshTrigger={refreshTrigger} />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            {!showForm ? (
              <div className="sticky top-8">
                <Button 
                  onClick={() => setShowForm(true)} 
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Goal
                </Button>
              </div>
            ) : (
              <div className="sticky top-8">
                <GoalForm onGoalCreated={handleGoalCreated} />
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
            <GoalList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  )
}
