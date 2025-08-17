# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project K is a goal tracking application built with Next.js 15, React 19, TypeScript, and Supabase. Users can create quantifiable goals with targets, track progress incrementally, and mark goals as complete.

## Development Commands

- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## Database Setup

The app uses Supabase as the backend. The database schema is defined in `supabase-schema.sql` and includes:
- A `goals` table with automatic `updated_at` triggers
- Indexes for performance on `created_at` and `completed` fields

Environment variables required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Architecture

### Data Flow
- All database operations go through the Supabase client (`src/lib/supabase.ts`)
- TypeScript types are generated from Supabase schema (`src/lib/database.types.ts`)
- Components use `react-hook-form` for form state and `sonner` for notifications

### Component Architecture
- **Goal Management**: Core components are `GoalForm`, `GoalList`, `GoalActions`, and `GoalEditForm`
- **UI Components**: Uses shadcn/ui (New York variant) with Radix UI primitives
- **State Management**: Local state with refresh triggers for re-fetching data
- **Progress Updates**: Real-time progress tracking with optimistic UI updates

### Styling System
- **Tailwind CSS 4** with CSS variables for theming
- **shadcn/ui** components configured in `components.json`
- **Path aliases**: `@/components`, `@/lib`, `@/hooks` configured in `tsconfig.json`
- **Icons**: Lucide React icon library
- **Fonts**: Geist Sans and Geist Mono from Google Fonts

### Key Patterns
- Client components use `'use client'` directive for interactivity
- Database operations include error handling and user feedback via toasts
- Progress calculations ensure values don't exceed 100% and handle edge cases
- Form validation uses react-hook-form with proper TypeScript typing

## Deployment

The app is deployed on Vercel with:
- Automatic builds from the main branch
- Environment variables configured in Vercel dashboard
- Production URL: https://project-qrsgqe1tg-kierans-projects-7c2efff2.vercel.app

## Important Files

- `src/app/page.tsx` - Main application page with goal creation and listing
- `src/lib/supabase.ts` - Supabase client configuration with fallback handling
- `src/lib/database.types.ts` - TypeScript definitions for database schema
- `supabase-schema.sql` - Database schema and triggers
- `src/app/providers.tsx` - App-level providers (currently toasts, theme provider ready to add)