# Calendar → Goal Automation Flow

## 🎯 Vision
Transform Project K into a personal habit tracker that automatically creates and completes goals based on iOS Calendar events.

## 📅 Calendar Integration Strategy

### Phase 1: Google Calendar Integration (Easiest to implement)
Since iOS Calendar can sync with Google Calendar, we'll start here:

1. **Setup Google Calendar API**
   - OAuth 2.0 authentication
   - Read calendar events
   - Real-time webhook notifications

2. **Calendar Event → Habit Mapping**
   ```
   Calendar Event: "Morning Workout 🏋️" (Daily, 7AM)
   → Auto-creates: Daily habit "Morning Workout" (10 XP)
   
   Calendar Event: "Meditation 🧘" (Daily, 8PM)
   → Auto-creates: Daily habit "Meditation" (15 XP)
   
   Calendar Event: "Read Book 📚" (Weekly, Sunday)
   → Auto-creates: Weekly habit "Read Book" (25 XP)
   ```

### Phase 2: Advanced Pattern Recognition
3. **Smart Event Detection**
   - Keywords: "workout", "gym", "run", "meditation", "read", "study"
   - Emojis: 🏋️, 🧘, 📚, 💧, 🥗, 😴
   - Time patterns: Recurring events get habit treatment
   - Categories: Auto-categorize based on keywords

4. **Automatic Completion**
   - Event marked as "completed" → Habit automatically marked complete
   - Partial completion tracking (if event is shortened)
   - Streak calculation and rewards

## 🔄 User Flow

### Setup Flow:
1. **Connect Calendar**
   - User clicks "Connect Google Calendar"
   - OAuth authentication
   - Select calendars to sync

2. **Configure Sync Rules**
   - Set keyword patterns ("workout", "gym", "meditation")
   - Choose categories and XP values
   - Enable/disable auto-creation

3. **Review Auto-Created Habits**
   - Show preview of detected habits
   - Allow editing before creation
   - Set recurrence patterns

### Daily Flow:
1. **Morning Sync**
   - Check calendar for today's events
   - Create daily habit instances
   - Send notification: "3 habits ready for today!"

2. **Real-time Updates**
   - Event completed → Habit marked complete
   - Event skipped → Track missed days
   - Event rescheduled → Update habit timing

3. **Evening Review**
   - Show daily progress
   - Calculate XP earned
   - Update streaks

## 📊 Habit Tracking Features

### Daily Habits
- ✅ Daily check-offs with streaks
- 📈 Progress visualization (7-day, 30-day views)
- 🏆 Streak rewards and achievements
- 📱 Push notifications for habit reminders

### Weekly/Monthly Habits
- 📅 Flexible scheduling within the period
- 🎯 Target-based tracking (e.g., "3 workouts this week")
- 📊 Completion rate analytics

### Habit Analytics
- 🔥 Current streak vs longest streak
- 📈 Completion rate over time
- 🏅 Personal records and milestones
- 📅 Calendar heatmap view

## 🛠️ Technical Implementation

### Backend (Supabase Functions)
```typescript
// Calendar sync function (runs every hour)
export async function syncCalendarEvents() {
  1. Fetch recent calendar events for each user
  2. Match events against sync rules
  3. Create/update habits and completions
  4. Send notifications for new habits
}

// Habit completion function
export async function completeHabitFromCalendar(eventId: string) {
  1. Find linked habit
  2. Mark today's instance as complete
  3. Calculate XP and update streak
  4. Trigger achievement checks
}
```

### Frontend Components
- 📅 Calendar connection setup
- ⚙️ Sync rules configuration
- 📋 Habit dashboard with streaks
- 📊 Progress analytics
- 🔔 Notification preferences

## 🚀 MVP Features (Week 1)

1. **Google Calendar OAuth** - Connect user's calendar
2. **Basic Sync Rules** - Keyword-based habit detection
3. **Daily Habits** - Simple check-off interface
4. **Streak Tracking** - Current and longest streaks
5. **Auto-completion** - Mark habits complete when calendar events finish

## 📈 Advanced Features (Future)

1. **iOS Calendar Direct Integration** - CalDAV support
2. **AI-Powered Event Classification** - Smart habit suggestions
3. **Habit Suggestions** - Recommend new habits based on calendar patterns
4. **Social Features** - Share streaks with friends
5. **Habit Templates** - Pre-built habit collections