# French Learning Application Development Plan

## Project Overview
A React-based French vocabulary learning application for a 13-year-old Dutch student, featuring interactive exercises, progress tracking, and gamification elements. The app will be hosted on GitHub Pages without requiring a backend.

## Educational Best Practices Research

### Effective Language Learning Techniques for Teenagers:
1. **Spaced Repetition**: Questions should revisit previously learned words at increasing intervals
2. **Multi-Modal Learning**: Combine visual, auditory, and kinesthetic elements
3. **Immediate Feedback**: Instant correction with explanations
4. **Progressive Difficulty**: Start easy and gradually increase complexity
5. **Gamification**: Points, streaks, and achievements to maintain motivation
6. **Context-Based Learning**: Words presented in meaningful contexts when possible
7. **Active Recall**: Prioritize production (writing) over recognition (multiple choice)

## Technical Architecture

### Core Technologies:
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- LocalStorage for data persistence
- GitHub Pages for hosting

### Key Libraries:
- `react-confetti` for celebration animations
- `react-circular-progressbar` for progress visualization
- `react-toastify` for notifications
- `howler.js` for audio feedback (optional)

## Feature Specifications

### Spec 1: Core Application Structure and Routing

```
Features:
- Welcome screen with name input
- Main menu with session options
- Session view with question flow
- Progress/statistics view
- Settings page

Components:
- App.tsx (main router)
- WelcomeScreen.tsx
- MainMenu.tsx
- SessionView.tsx
- ProgressView.tsx
- SettingsView.tsx

Data Structure:
{
  user: {
    name: string,
    createdAt: timestamp,
    totalSessions: number,
    totalPoints: number
  },
  sessions: [{
    id: string,
    date: timestamp,
    duration: number,
    score: number,
    questionsAnswered: number,
    correctAnswers: number
  }],
  settings: {
    sessionDuration: 15, // minutes
    questionTypes: {
      multipleChoice: true,
      translation: true,
      spelling: true,
      matching: true
    },
    difficulty: 'medium'
  }
}
```

### Spec 2: Question Bank System and File Reader

```
Features:
- JSON-based question bank format
- File upload capability for custom questions
- Default question set included
- Category-based organization

Question Format:
{
  version: "1.0",
  categories: [{
    id: "animals",
    name: "Dieren",
    icon: "🐾",
    questions: [{
      id: "q1",
      dutch: "hond",
      french: "chien",
      gender: "m", // for French nouns
      category: "animals",
      difficulty: 1,
      image?: "dog.svg", // optional
      context?: "J'ai un ___ noir" // optional context sentence
    }]
  }]
}

Components:
- QuestionBank.ts (service)
- FileUploader.tsx
- QuestionManager.tsx
```

### Spec 3: Question Types Implementation

```
1. Multiple Choice Questions
   - Show Dutch word
   - 4 French options (1 correct, 3 distractors)
   - Visual feedback on selection

2. Translation Input
   - Show Dutch word
   - Text input for French translation
   - Accept variations (le/la/un/une)
   - Show hints after 2 wrong attempts

3. Reverse Translation
   - Show French word with article
   - Input Dutch translation
   - Case-insensitive checking

4. Spelling Challenge
   - Audio pronunciation of French word
   - Student types the spelling
   - Show word briefly then hide

5. Matching Game
   - 6 words (3 Dutch, 3 French)
   - Drag and drop or click to match
   - Timer-based bonus points

Components:
- QuestionTypes/MultipleChoice.tsx
- QuestionTypes/TranslationInput.tsx
- QuestionTypes/SpellingChallenge.tsx
- QuestionTypes/MatchingGame.tsx
- QuestionTypes/BaseQuestion.tsx (shared logic)
```

### Spec 4: Session Management and Scoring

```
Features:
- 15-minute countdown timer
- Pause/resume capability
- Progress bar showing time remaining
- Dynamic scoring based on:
  - Correct answer: +10 points
  - Speed bonus: +1-5 points
  - Streak bonus: +2 points per 3 correct
  - Difficulty multiplier: x1.5 for hard questions

Session Flow:
1. Select categories
2. Start timer
3. Random question selection
4. Immediate feedback
5. Next question
6. Session summary
7. Save to localStorage

Components:
- SessionTimer.tsx
- ScoreTracker.tsx
- SessionSummary.tsx
- StreakIndicator.tsx
```

### Spec 5: Progress Tracking and Analytics

```
Features:
- Line chart showing score progression
- Statistics dashboard:
  - Average score
  - Best score
  - Total time practiced
  - Words mastered
  - Current streak
- Category performance breakdown
- Achievement badges

Achievements:
- First Session
- 7-Day Streak
- 100 Words Mastered
- Perfect Session
- Speed Demon (fast answers)

Components:
- ProgressChart.tsx
- StatsGrid.tsx
- AchievementBadges.tsx
- CategoryProgress.tsx
```

### Spec 6: Visual Design and Interactive Elements

```
Design System:
- Color Palette:
  - Primary: French Blue (#0055A4)
  - Secondary: Dutch Orange (#FF6B35)
  - Success: Green (#10B981)
  - Error: Red (#EF4444)
  - Background: Light Gray (#F9FAFB)

Interactive Elements:
- Animated French icons (Eiffel Tower, croissant, etc.)
- Confetti on achievements
- Progress animations
- Hover effects on buttons
- Smooth transitions between questions

French-Themed Graphics:
- SVG illustrations for categories
- Animated mascot (French cat character)
- Background patterns with French motifs
- Achievement badge designs

Components:
- ThemeProvider.tsx
- AnimatedIcon.tsx
- FrenchMascot.tsx
- ConfettiCelebration.tsx
```

### Spec 7: Data Persistence and Settings

```
LocalStorage Schema:
- user_profile
- session_history
- question_progress (tracks mastery per word)
- user_settings
- achievements

Settings Options:
- Session duration (5, 10, 15, 20 minutes)
- Enable/disable question types
- Difficulty level
- Sound effects on/off
- Animation preferences
- Reset progress option

Components:
- SettingsManager.tsx
- DataExport.tsx (export progress as JSON)
- DataImport.tsx
- ResetConfirmation.tsx
```

## Default Question Bank Content

### Categories to Include:
1. **School Supplies** (Fournitures scolaires)
2. **Animals** (Animaux)
3. **Family** (Famille)
4. **Colors** (Couleurs)
5. **Numbers** (Nombres)
6. **Days/Months** (Jours/Mois)
7. **Food** (Nourriture)
8. **Body Parts** (Parties du corps)
9. **Common Verbs** (Verbes communs)
10. **Classroom Phrases** (Phrases de classe)

## Implementation Phases

### Phase 1: Core Setup (Specs 1-2)
- React app initialization
- Basic routing
- Welcome screen
- Question bank structure
- File reading capability

### Phase 2: Question System (Spec 3)
- Implement all question types
- Basic scoring logic
- Question flow management

### Phase 3: Session Management (Spec 4)
- Timer implementation
- Score calculation
- Session storage

### Phase 4: Progress Features (Spec 5)
- Statistics tracking
- Progress visualization
- Achievement system

### Phase 5: Polish (Specs 6-7)
- Visual enhancements
- Animations
- Settings management
- Final testing

## Sample Code Structure

```typescript
// types/index.ts
export interface Question {
  id: string;
  dutch: string;
  french: string;
  gender?: 'm' | 'f';
  category: string;
  difficulty: number;
  image?: string;
  audioUrl?: string;
}

export interface Session {
  id: string;
  startTime: number;
  endTime?: number;
  score: number;
  questions: QuestionAttempt[];
}

export interface QuestionAttempt {
  questionId: string;
  correct: boolean;
  timeSpent: number;
  attemptCount: number;
}
```

## Deployment Instructions

1. Build the app: `npm run build`
2. Install gh-pages: `npm install --save-dev gh-pages`
3. Add to package.json:
   ```json
   "homepage": "https://[username].github.io/[repo-name]",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
4. Deploy: `npm run deploy`

## Additional Considerations

### Accessibility:
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode option
- Font size adjustment

### Future Enhancements:
- Audio pronunciation for French words
- Verb conjugation practice
- Sentence building exercises
- Peer competition mode
- Export progress reports for teachers
- Mobile app version

This plan provides a solid foundation for building an engaging, educational French learning application that will help your daughter improve her vocabulary while having fun!