import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionManager } from '../sessionManager';
import { StorageService } from '../storage';

// Mock StorageService
vi.mock('../storage', () => ({
  StorageService: {
    getSessions: vi.fn(() => []),
    setSessions: vi.fn(),
    getUser: vi.fn(() => ({ name: 'Test', totalSessions: 0, totalPoints: 0, createdAt: Date.now() })),
    setUser: vi.fn(),
  }
}));

describe('SessionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset any current session
    SessionManager.endSession();
  });

  describe('Session Lifecycle', () => {
    it('should start a new session with correct properties', () => {
      const duration = 900; // 15 minutes
      const categories = ['grammar', 'vocabulary'];
      
      const session = SessionManager.startSession(duration, categories);
      
      expect(session).toMatchObject({
        duration,
        categories,
        score: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        isPaused: false,
        pausedTime: 0
      });
      expect(session.id).toMatch(/session_\d+/);
      expect(session.startTime).toBeGreaterThan(0);
      expect(session.attempts).toEqual([]);
    });

    it('should return current session when one is active', () => {
      const session = SessionManager.startSession(900, ['test']);
      const currentSession = SessionManager.getCurrentSession();
      
      expect(currentSession).toBe(session);
    });

    it('should end session and save it', () => {
      SessionManager.startSession(900, ['test']);
      
      // Add some data to the session
      SessionManager.recordAttempt('q1', true, 1, 1);
      
      const endedSession = SessionManager.endSession();
      
      expect(endedSession).toBeTruthy();
      expect(endedSession!.endTime).toBeGreaterThan(0);
      expect(StorageService.setSessions).toHaveBeenCalled();
      expect(SessionManager.getCurrentSession()).toBeNull();
    });
  });

  describe('Score Calculation', () => {
    it('should calculate correct base points', () => {
      const points = SessionManager.calculateQuestionPoints(true, 5, 1, 1, 0);
      expect(points).toBeGreaterThanOrEqual(10); // Base points
    });

    it('should return 0 points for incorrect answers', () => {
      const points = SessionManager.calculateQuestionPoints(false, 5, 1, 1, 0);
      expect(points).toBe(0);
    });

    it('should apply speed bonus for fast answers', () => {
      const fastPoints = SessionManager.calculateQuestionPoints(true, 1, 1, 1, 0);
      const slowPoints = SessionManager.calculateQuestionPoints(true, 10, 1, 1, 0);
      
      expect(fastPoints).toBeGreaterThan(slowPoints);
    });

    it('should apply streak bonus every 3 correct answers', () => {
      const noStreakPoints = SessionManager.calculateQuestionPoints(true, 5, 1, 1, 2);
      const streakPoints = SessionManager.calculateQuestionPoints(true, 5, 1, 1, 3);
      
      expect(streakPoints).toBeGreaterThan(noStreakPoints);
    });

    it('should apply difficulty multiplier', () => {
      const easyPoints = SessionManager.calculateQuestionPoints(true, 5, 1, 1, 0);
      const hardPoints = SessionManager.calculateQuestionPoints(true, 5, 1, 2, 0);
      
      expect(hardPoints).toBeGreaterThan(easyPoints);
    });

    it('should penalize multiple attempts', () => {
      const firstAttempt = SessionManager.calculateQuestionPoints(true, 5, 1, 1, 0);
      const secondAttempt = SessionManager.calculateQuestionPoints(true, 5, 2, 1, 0);
      
      expect(secondAttempt).toBeLessThan(firstAttempt);
    });
  });

  describe('Session Recording', () => {
    it('should record attempts and update session stats', () => {
      SessionManager.startSession(900, ['test']);
      
      SessionManager.recordAttempt('q1', true, 1, 1);
      SessionManager.recordAttempt('q2', false, 1, 1);
      
      const currentSession = SessionManager.getCurrentSession();
      
      expect(currentSession!.questionsAnswered).toBe(2);
      expect(currentSession!.correctAnswers).toBe(1);
      expect(currentSession!.score).toBeGreaterThan(0);
      expect(currentSession!.attempts).toHaveLength(2);
    });

    it('should calculate current streak correctly', () => {
      SessionManager.startSession(900, ['test']);
      
      // Start with correct answers
      SessionManager.recordAttempt('q1', true, 1, 1);
      SessionManager.recordAttempt('q2', true, 1, 1);
      expect(SessionManager.getCurrentStreak()).toBe(2);
      
      // Break streak with wrong answer
      SessionManager.recordAttempt('q3', false, 1, 1);
      expect(SessionManager.getCurrentStreak()).toBe(0);
      
      // Start new streak
      SessionManager.recordAttempt('q4', true, 1, 1);
      expect(SessionManager.getCurrentStreak()).toBe(1);
    });
  });

  describe('Pause/Resume', () => {
    it('should pause and resume sessions', () => {
      const session = SessionManager.startSession(900, ['test']);
      
      expect(session.isPaused).toBe(false);
      
      SessionManager.pauseSession();
      const pausedSession = SessionManager.getCurrentSession();
      expect(pausedSession!.isPaused).toBe(true);
      
      SessionManager.resumeSession();
      const resumedSession = SessionManager.getCurrentSession();
      expect(resumedSession!.isPaused).toBe(false);
    });
  });

  describe('Session Statistics', () => {
    it('should return empty stats when no sessions exist', () => {
      const stats = SessionManager.getSessionStats();
      
      expect(stats).toEqual({
        averageScore: 0,
        bestScore: 0,
        totalSessions: 0,
        totalTimeSpent: 0
      });
    });

    it('should calculate stats from stored sessions', () => {
      const mockSessions = [
        { score: 100, startTime: Date.now(), endTime: Date.now() + 60000, duration: 60 },
        { score: 200, startTime: Date.now(), endTime: Date.now() + 120000, duration: 120 },
        { score: 150, startTime: Date.now(), endTime: Date.now() + 90000, duration: 90 }
      ];
      
      vi.mocked(StorageService.getSessions).mockReturnValue(mockSessions as any);
      
      const stats = SessionManager.getSessionStats();
      
      expect(stats.averageScore).toBe(150);
      expect(stats.bestScore).toBe(200);
      expect(stats.totalSessions).toBe(3);
      expect(stats.totalTimeSpent).toBeGreaterThan(0);
    });
  });
});