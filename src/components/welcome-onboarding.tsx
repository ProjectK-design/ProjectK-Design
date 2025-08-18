'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import { Target, Trophy, Zap, CheckCircle, ArrowRight, X } from 'lucide-react'
import { getProjectBranding } from '@/lib/utils'

interface WelcomeOnboardingProps {
  onComplete: () => void
}

export function WelcomeOnboarding({ onComplete }: WelcomeOnboardingProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const projectBranding = getProjectBranding(user)
  const firstName = user?.user_metadata?.first_name

  const steps = [
    {
      title: `Welcome to ${projectBranding}!`,
      content: (
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold">
            {firstName ? `Welcome, ${firstName}!` : 'Welcome!'}
          </h3>
          <p className="text-muted-foreground">
            You&apos;ve successfully joined {projectBranding}. Let&apos;s get you started on your journey to achieving your goals and building lasting habits.
          </p>
        </div>
      )
    },
    {
      title: 'Track Your Progress',
      content: (
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold">Set Meaningful Goals</h3>
          <p className="text-muted-foreground">
            Create quantifiable goals with specific targets, deadlines, and categories. Track your incremental progress and celebrate each milestone.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-3 bg-muted/50 rounded-lg">
              <Target className="h-6 w-6 mb-2 text-primary mx-auto" />
              <p className="text-sm font-medium">Goals</p>
              <p className="text-xs text-muted-foreground">One-time objectives</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <Target className="h-6 w-6 mb-2 text-purple-500 mx-auto" />
              <p className="text-sm font-medium">Habits</p>
              <p className="text-xs text-muted-foreground">Daily routines</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Level Up with XP',
      content: (
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold">Gamified Progress</h3>
          <p className="text-muted-foreground">
            Earn XP points for completing goals and maintaining habits. Watch your progress bar fill up as you accomplish more and stay motivated with our reward system.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your XP Progress</span>
              <span className="text-sm text-muted-foreground">0 / 100 XP</span>
            </div>
            <div className="h-2 bg-muted rounded-full">
              <div className="h-2 bg-primary rounded-full" style={{ width: '0%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Complete your first goal to start earning XP!
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'You&apos;re All Set!',
      content: (
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold">Ready to Begin</h3>
          <p className="text-muted-foreground">
            You&apos;re now ready to start your journey with {projectBranding}. Create your first goal or habit to get started!
          </p>
          <div className="bg-primary/5 rounded-lg p-4 mt-6">
            <p className="text-sm font-medium mb-2">Pro Tips:</p>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Start with 1-2 small, achievable goals</li>
              <li>• Be specific with your targets and deadlines</li>
              <li>• Use categories to organize your goals</li>
              <li>• Check in daily to track your progress</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const skipOnboarding = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={skipOnboarding}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center">{steps[currentStep].title}</CardTitle>
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps[currentStep].content}
          
          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="ghost" 
              onClick={skipOnboarding}
              className="text-muted-foreground"
            >
              Skip
            </Button>
            <Button onClick={nextStep} className="flex items-center gap-2">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}