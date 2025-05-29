import { describe, it, expect, beforeEach } from 'vitest';
import { ScoringService } from '../scoring';

describe('ScoringService', () => {
  beforeEach(() => {
    // Reset streak before each test
    ScoringService.resetStreak();
  });

  it('calculates score for correct answer', () => {
    const result = ScoringService.calculateScore(true, 10, 1, 'default');
    
    expect(result.basePoints).toBe(10);
    expect(result.speedBonus).toBe(3); // 10 seconds = 3 points
    expect(result.streakBonus).toBe(0); // First correct answer
    expect(result.difficultyMultiplier).toBe(1);
    expect(result.totalPoints).toBe(13);
  });

  it('returns zero score for incorrect answer', () => {
    const result = ScoringService.calculateScore(false, 10, 1, 'default');
    
    expect(result.totalPoints).toBe(0);
    expect(result.basePoints).toBe(0);
    expect(result.speedBonus).toBe(0);
    expect(result.streakBonus).toBe(0);
  });

  it('calculates speed bonus correctly', () => {
    expect(ScoringService.calculateScore(true, 3, 1).speedBonus).toBe(5); // < 5 sec
    expect(ScoringService.calculateScore(true, 7, 1).speedBonus).toBe(4); // < 10 sec
    expect(ScoringService.calculateScore(true, 12, 1).speedBonus).toBe(3); // < 15 sec
    expect(ScoringService.calculateScore(true, 18, 1).speedBonus).toBe(2); // < 20 sec
    expect(ScoringService.calculateScore(true, 25, 1).speedBonus).toBe(1); // < 30 sec
    expect(ScoringService.calculateScore(true, 35, 1).speedBonus).toBe(0); // >= 30 sec
  });

  it('applies difficulty multiplier', () => {
    // Reset streak to ensure clean test
    ScoringService.resetStreak();
    
    const easy = ScoringService.calculateScore(true, 10, 1);
    const medium = ScoringService.calculateScore(true, 10, 2);
    const hard = ScoringService.calculateScore(true, 10, 3);
    
    expect(easy.difficultyMultiplier).toBe(1);
    expect(medium.difficultyMultiplier).toBe(1.5);
    expect(hard.difficultyMultiplier).toBe(2);
    
    // The hard calculation gets a streak bonus because we've done 3 correct in a row
    expect(easy.totalPoints).toBe(13); // (10 + 3 + 0) * 1 = 13
    expect(medium.totalPoints).toBe(20); // (10 + 3 + 0) * 1.5 = 19.5 → 20
    expect(hard.totalPoints).toBe(30); // (10 + 3 + 2) * 2 = 30 (streak bonus kicks in)
  });

  it('calculates streak bonus', () => {
    // Build up a streak
    ScoringService.calculateScore(true, 10, 1); // Streak: 1
    ScoringService.calculateScore(true, 10, 1); // Streak: 2
    const thirdCorrect = ScoringService.calculateScore(true, 10, 1); // Streak: 3
    
    expect(thirdCorrect.streakBonus).toBe(2); // 3/3 = 1, * 2 = 2
    
    // Continue streak
    ScoringService.calculateScore(true, 10, 1); // Streak: 4
    ScoringService.calculateScore(true, 10, 1); // Streak: 5
    const sixthCorrect = ScoringService.calculateScore(true, 10, 1); // Streak: 6
    
    expect(sixthCorrect.streakBonus).toBe(4); // 6/3 = 2, * 2 = 4
  });

  it('resets streak on incorrect answer', () => {
    // Build up a streak
    ScoringService.calculateScore(true, 10, 1);
    ScoringService.calculateScore(true, 10, 1);
    ScoringService.calculateScore(true, 10, 1);
    
    expect(ScoringService.getCurrentStreak()).toBe(3);
    
    // Wrong answer resets streak
    ScoringService.calculateScore(false, 10, 1);
    
    expect(ScoringService.getCurrentStreak()).toBe(0);
    
    // Next correct answer starts new streak
    const result = ScoringService.calculateScore(true, 10, 1);
    expect(result.streakBonus).toBe(0);
    expect(ScoringService.getCurrentStreak()).toBe(1);
  });

  it('adjusts speed bonus for different question types', () => {
    const matching = ScoringService.calculateScore(true, 10, 1, 'matching');
    const spelling = ScoringService.calculateScore(true, 10, 1, 'spelling');
    const regular = ScoringService.calculateScore(true, 10, 1, 'default');
    
    // Matching takes longer, so speed bonus is halved
    expect(matching.speedBonus).toBe(1); // 3 * 0.5 = 1.5 → 1
    
    // Spelling includes memorization time, so speed bonus is reduced
    expect(spelling.speedBonus).toBe(2); // 3 * 0.7 = 2.1 → 2
    
    // Regular question gets full speed bonus
    expect(regular.speedBonus).toBe(3);
  });
});