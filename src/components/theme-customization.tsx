'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import { Palette, Check } from 'lucide-react'
import { getProjectBranding } from '@/lib/utils'

interface ThemeCustomizationProps {
  onComplete?: () => void
}

interface AccentColor {
  name: string
  value: string
  cssVar: string
  textColor: string
}

const accentColors: AccentColor[] = [
  { name: 'Blue', value: 'hsl(221.2, 83.2%, 53.3%)', cssVar: '221.2 83.2% 53.3%', textColor: 'white' },
  { name: 'Green', value: 'hsl(142.1, 76.2%, 36.3%)', cssVar: '142.1 76.2% 36.3%', textColor: 'white' },
  { name: 'Purple', value: 'hsl(262.1, 83.3%, 57.8%)', cssVar: '262.1 83.3% 57.8%', textColor: 'white' },
  { name: 'Pink', value: 'hsl(330, 81%, 60%)', cssVar: '330 81% 60%', textColor: 'white' },
  { name: 'Orange', value: 'hsl(24.6, 95%, 53.1%)', cssVar: '24.6 95% 53.1%', textColor: 'white' },
  { name: 'Red', value: 'hsl(0, 84.2%, 60.2%)', cssVar: '0 84.2% 60.2%', textColor: 'white' },
  { name: 'Teal', value: 'hsl(173, 80%, 40%)', cssVar: '173 80% 40%', textColor: 'white' },
  { name: 'Indigo', value: 'hsl(229, 84%, 68%)', cssVar: '229 84% 68%', textColor: 'white' },
]

export function ThemeCustomization({ onComplete }: ThemeCustomizationProps) {
  const { user } = useAuth()
  const [selectedColor, setSelectedColor] = useState<AccentColor>(accentColors[0])
  const projectBranding = getProjectBranding(user)

  useEffect(() => {
    // Load saved color preference
    const savedColor = localStorage.getItem(`accent_color_${user?.id}`)
    if (savedColor) {
      const found = accentColors.find(color => color.name === savedColor)
      if (found) {
        setSelectedColor(found)
        applyAccentColor(found)
      }
    }
  }, [user]) // applyAccentColor is stable and doesn't need to be in deps

  const applyAccentColor = (color: AccentColor) => {
    const root = document.documentElement
    root.style.setProperty('--primary', color.cssVar)
    
    // Also update some complementary colors for better theming
    const hsl = color.cssVar.split(' ')
    const h = parseFloat(hsl[0])
    const s = parseFloat(hsl[1].replace('%', ''))
    const l = parseFloat(hsl[2].replace('%', ''))
    
    // Create a lighter version for hover states
    root.style.setProperty('--primary-foreground', `${h} ${Math.min(s + 10, 100)}% ${Math.min(l + 20, 90)}%`)
    
    // Save preference
    if (user) {
      localStorage.setItem(`accent_color_${user.id}`, color.name)
    }
  }

  const handleColorSelect = (color: AccentColor) => {
    setSelectedColor(color)
    applyAccentColor(color)
  }

  const handleSave = () => {
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <CardTitle>Customize Your Theme</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Choose an accent color that matches your style for {projectBranding}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Grid */}
        <div className="grid grid-cols-4 gap-3">
          {accentColors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleColorSelect(color)}
              className="group relative aspect-square rounded-lg border-2 hover:scale-105 transition-transform"
              style={{ 
                backgroundColor: color.value,
                borderColor: selectedColor.name === color.name ? color.value : 'transparent'
              }}
            >
              {selectedColor.name === color.name && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-6 w-6" style={{ color: color.textColor }} />
                </div>
              )}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium bg-background border rounded px-2 py-1 whitespace-nowrap">
                  {color.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h4 className="font-medium">Preview</h4>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold">{projectBranding}</h5>
                <p className="text-sm text-muted-foreground">Your personalized goal tracker</p>
              </div>
              <Button size="sm" style={{ backgroundColor: selectedColor.value, color: selectedColor.textColor }}>
                Sample Button
              </Button>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300" 
                  style={{ backgroundColor: selectedColor.value, width: '60%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sample progress bar</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {onComplete && (
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Save Theme
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}