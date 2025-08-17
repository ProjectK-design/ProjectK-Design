'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Target, TrendingUp, CheckCircle, Zap, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-8 w-8 animate-pulse" />
            <h1 className="text-3xl font-bold">Project K</h1>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Logo and Title */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <Target className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Project K
              </h1>
            </div>
            
            {/* Hero Tagline */}
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
              Transform Your Dreams Into Achievements
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              The smart goal tracking platform that gamifies your progress. Set quantifiable targets, 
              track incremental progress, and level up as you achieve your objectives.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={() => router.push('/login')}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Why Choose Project K?</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Smart Goal Setting</h4>
                  <p className="text-muted-foreground">
                    Create quantifiable goals with targets, deadlines, and categories. 
                    Track progress with precision and clarity.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-green-500/10 rounded-full">
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Progress Tracking</h4>
                  <p className="text-muted-foreground">
                    Log incremental progress toward your goals. Visualize your journey 
                    with intuitive progress bars and insights.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-yellow-500/10 rounded-full">
                      <Zap className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Gamification</h4>
                  <p className="text-muted-foreground">
                    Earn XP points for completing goals. Level up your motivation 
                    with our engaging reward system.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-12">Start Achieving More Today</h3>
            
            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold mb-1">Organized Goal Management</h4>
                  <p className="text-muted-foreground text-sm">
                    Keep all your objectives in one place with powerful filtering and search
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold mb-1">Real-time Updates</h4>
                  <p className="text-muted-foreground text-sm">
                    Watch your progress update instantly as you log achievements
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold mb-1">Category Organization</h4>
                  <p className="text-muted-foreground text-sm">
                    Group goals by life areas: fitness, career, learning, and more
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold mb-1">Motivational XP System</h4>
                  <p className="text-muted-foreground text-sm">
                    Stay motivated with experience points and progress visualization
                  </p>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="bg-primary/5 rounded-2xl p-8">
              <h4 className="text-2xl font-bold mb-4">Ready to Transform Your Goals?</h4>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of achievers who use Project K to turn their aspirations into reality. 
                Start your journey today—it&apos;s completely free.
              </p>
              <Button 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={() => router.push('/login')}
              >
                Start Your Journey
                <Target className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t bg-muted/30 py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">Project K - Goal Tracking Made Simple</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with Next.js, React, and Supabase. Designed for achievers.
            </p>
          </div>
        </footer>
      </div>
    )
  }

  // Fallback - should not reach here
  return null
}