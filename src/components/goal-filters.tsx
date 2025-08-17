'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Filter, X, CheckCircle, Clock, Target } from 'lucide-react'

export interface GoalFilters {
  search: string
  status: 'all' | 'active' | 'completed'
  category: string
  sortBy: 'created' | 'deadline' | 'progress' | 'xp'
  sortOrder: 'asc' | 'desc'
}

interface GoalFiltersProps {
  filters: GoalFilters
  categories: string[]
  onFiltersChange: (filters: GoalFilters) => void
}

export function GoalFiltersComponent({ filters, categories, onFiltersChange }: GoalFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof GoalFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      category: '',
      sortBy: 'created',
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.category || filters.sortBy !== 'created'

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search goals..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 pr-10"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('search', '')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <div className="h-2 w-2 bg-primary rounded-full" />
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Status
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.status === 'all' && <Target className="h-4 w-4" />}
                      {filters.status === 'active' && <Clock className="h-4 w-4" />}
                      {filters.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                      <span className="capitalize">{filters.status}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => updateFilter('status', 'all')}>
                      <Target className="h-4 w-4 mr-2" />
                      All Goals
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateFilter('status', 'active')}>
                      <Clock className="h-4 w-4 mr-2" />
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateFilter('status', 'completed')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Category
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {filters.category || 'All Categories'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => updateFilter('category', '')}>
                      All Categories
                    </DropdownMenuItem>
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category}
                        onClick={() => updateFilter('category', category)}
                      >
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Sort By
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {filters.sortBy === 'created' && 'Date Created'}
                      {filters.sortBy === 'deadline' && 'Deadline'}
                      {filters.sortBy === 'progress' && 'Progress'}
                      {filters.sortBy === 'xp' && 'XP Value'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => updateFilter('sortBy', 'created')}>
                      Date Created
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateFilter('sortBy', 'deadline')}>
                      Deadline
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateFilter('sortBy', 'progress')}>
                      Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateFilter('sortBy', 'xp')}>
                      XP Value
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Sort Order */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Order
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {filters.sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => updateFilter('sortOrder', 'desc')}>
                      Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateFilter('sortOrder', 'asc')}>
                      Oldest First
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}