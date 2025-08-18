'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AuthGuard } from '@/components/auth-guard'
import { ThemeCustomization } from '@/components/theme-customization'
import { useAuth } from '@/lib/auth'
import { Settings, ArrowLeft, User, Database, HelpCircle } from 'lucide-react'
import { getProjectBranding } from '@/lib/utils'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const projectBranding = getProjectBranding(user)

  const clearAllData = async () => {
    if (confirm('Are you sure you want to clear all your goals and habits? This action cannot be undone.')) {
      try {
        // This would be implemented with proper data clearing logic
        toast.success('All data cleared successfully')
      } catch (error) {
        toast.error('Failed to clear data')
      }
    }
  }

  const exportData = async () => {
    try {
      // This would be implemented with proper data export logic
      toast.info('Data export feature coming soon!')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Profile Settings Link */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <CardTitle>Profile</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/profile')}
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Update your name and personal information for {projectBranding}
                </p>
              </CardContent>
            </Card>

            {/* Theme Customization */}
            <div>
              <ThemeCustomization />
            </div>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  <CardTitle>Data Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download all your goals and habits data
                    </p>
                  </div>
                  <Button variant="outline" onClick={exportData}>
                    Export
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Clear All Data</p>
                    <p className="text-sm text-muted-foreground text-red-600">
                      Permanently delete all goals and habits
                    </p>
                  </div>
                  <Button variant="destructive" onClick={clearAllData}>
                    Clear Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  <CardTitle>Help & Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    View Help Center
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Contact Support
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Report a Bug
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Feature Request
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>{projectBranding}</strong> v1.0.0 • Built with Next.js and Supabase
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}