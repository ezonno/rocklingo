import { StorageService } from './storage';

export interface QuestionAttempt {
  questionId: string;
  correct: boolean;
  timeSpent: number; // in seconds
  attemptCount: number;
  points: number;
}

export interface GameSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number; // planned duration in seconds
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  attempts: QuestionAttempt[];
  categories: string[];
  isPaused: boolean;
  pausedTime: number; // total paused time in seconds
}

export class SessionManager {
  private static currentSession: GameSession | null = null;
  private static questionStartTime: number = 0;

  static startSession(duration: number, categories: string[]): GameSession {
    const session: GameSession = {
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      duration,
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      attempts: [],
      categories,
      isPaused: false,
      pausedTime: 0
    };

    this.currentSession = session;
    this.startQuestion();
    
    return session;
  }

  static getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  static startQuestion(): void {
    this.questionStartTime = Date.now();
  }

  static calculateQuestionPoints(
    correct: boolean, 
    timeSpent: number, 
    attemptCount: number, 
    difficulty: number,
    currentStreak: number
  ): number {
    if (!correct) return 0;

    let points = 10; // Base points for correct answer

    // Speed bonus (max 5 points)
    // Faster answers get more points, max bonus for answers under 3 seconds
    const speedBonus = Math.max(0, Math.min(5, Math.round(5 - (timeSpent / 3))));
    points += speedBonus;

    // Streak bonus (every 3 correct answers in a row)
    if (currentStreak > 0 && currentStreak % 3 === 0) {
      points += 2;
    }

    // Difficulty multiplier
    if (difficulty >= 2) {
      points = Math.round(points * 1.5);
    }

    // Penalty for multiple attempts
    if (attemptCount > 1) {
      points = Math.round(points * 0.8);
    }

    return points;
  }

  static recordAttempt(
    questionId: string, 
    correct: boolean, 
    attemptCount: number,
    difficulty: number = 1
  ): number {
    if (!this.currentSession) return 0;

    const timeSpent = Math.round((Date.now() - this.questionStartTime) / 1000);
    const currentStreak = this.getCurrentStreak();
    const points = this.calculateQuestionPoints(correct, timeSpent, attemptCount, difficulty, currentStreak);

    const attempt: QuestionAttempt = {
      questionId,
      correct,
      timeSpent,
      attemptCount,
      points
    };

    this.currentSession.attempts.push(attempt);
    this.currentSession.questionsAnswered++;
    
    if (correct) {
      this.currentSession.correctAnswers++;
      this.currentSession.score += points;
    }

    return points;
  }

  static getCurrentStreak(): number {
    if (!this.currentSession || this.currentSession.attempts.length === 0) return 0;

    let streak = 0;
    // Count backwards from the most recent attempt
    for (let i = this.currentSession.attempts.length - 1; i >= 0; i--) {
      if (this.currentSession.attempts[i].correct) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  static pauseSession(): void {
    if (this.currentSession) {
      this.currentSession.isPaused = true;
    }
  }

  static resumeSession(): void {
    if (this.currentSession) {
      this.currentSession.isPaused = false;
    }
  }

  static endSession(): GameSession | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = Date.now();
    this.currentSession.isPaused = false;

    // Save to storage
    this.saveSession(this.currentSession);

    const session = this.currentSession;
    this.currentSession = null;

    return session;
  }

  private static saveSession(session: GameSession): void {
    const sessions = StorageService.getSessions();
    
    // Convert GameSession to Session for storage
    const storageSession = {
      id: session.id,
      date: session.startTime,
      duration: session.endTime ? Math.round((session.endTime - session.startTime) / 1000) : 0,
      score: session.score,
      questionsAnswered: session.questionsAnswered,
      correctAnswers: session.correctAnswers
    };
    
    sessions.push(storageSession);
    StorageService.setSessions(sessions);

    // Update user stats
    const user = StorageService.getUser();
    if (user) {
      user.totalSessions++;
      user.totalPoints += session.score;
      StorageService.setUser(user);
    }
  }

  static getSessionStats(): {
    averageScore: number;
    bestScore: number;
    totalSessions: number;
    totalTimeSpent: number; // in minutes
  } {
    const sessions = StorageService.getSessions();
    
    if (sessions.length === 0) {
      return {
        averageScore: 0,
        bestScore: 0,
        totalSessions: 0,
        totalTimeSpent: 0
      };
    }

    const scores = sessions.map(s => s.score);
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const bestScore = Math.max(...scores);
    const totalTimeSpent = Math.round(sessions.reduce((sum, session) => {
      const duration = session.duration / 60; // duration is already in seconds, convert to minutes
      return sum + duration;
    }, 0));

    return {
      averageScore,
      bestScore,
      totalSessions: sessions.length,
      totalTimeSpent
    };
  }
}