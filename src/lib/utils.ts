import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { User } from '@supabase/supabase-js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate personalized project branding based on user data
 * Returns "Project You" for unauthenticated users or "Project [FirstLetter]" for authenticated users
 */
export function getProjectBranding(user: User | null): string {
  if (!user) {
    return "Project You"
  }
  
  // Try to get first name from user metadata first
  const firstName = user.user_metadata?.first_name
  if (firstName && typeof firstName === 'string' && firstName.length > 0) {
    return `Project ${firstName.charAt(0).toUpperCase()}`
  }
  
  // Fallback to email-based extraction
  const email = user.email
  if (email) {
    const emailUsername = email.split('@')[0]
    if (emailUsername.length > 0) {
      return `Project ${emailUsername.charAt(0).toUpperCase()}`
    }
  }
  
  // Ultimate fallback
  return "Project You"
}

/**
 * Get personalized greeting for the user
 * Returns "Welcome" for unauthenticated users or "Welcome back, [FirstName]!" for authenticated users
 */
export function getPersonalizedGreeting(user: User | null): string {
  if (!user) {
    return "Welcome"
  }
  
  const firstName = user.user_metadata?.first_name
  if (firstName && typeof firstName === 'string' && firstName.length > 0) {
    return `Welcome back, ${firstName}!`
  }
  
  // Fallback to email username
  const email = user.email
  if (email) {
    const emailUsername = email.split('@')[0]
    if (emailUsername.length > 0) {
      return `Welcome back, ${emailUsername}!`
    }
  }
  
  return "Welcome back!"
}

/**
 * Get user's display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) {
    return "Guest"
  }
  
  const firstName = user.user_metadata?.first_name
  const lastName = user.user_metadata?.last_name
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  } else if (firstName) {
    return firstName
  }
  
  // Fallback to email username
  const email = user.email
  if (email) {
    return email.split('@')[0]
  }
  
  return "User"
}
