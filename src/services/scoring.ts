export interface ScoreResult {
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  difficultyMultiplier: number;
  totalPoints: number;
}

export class ScoringService {
  private static currentStreak = 0;
  
  static calculateScore(
    correct: boolean,
    timeSpent: number,
    difficulty: number = 1,
    questionType: string = 'default'
  ): ScoreResult {
    if (!correct) {
      this.currentStreak = 0;
      return {
        basePoints: 0,
        speedBonus: 0,
        streakBonus: 0,
        difficultyMultiplier: 1,
        totalPoints: 0,
      };
    }
    
    // Base points for correct answer
    const basePoints = 10;
    
    // Speed bonus (max 5 points)
    let speedBonus = 0;
    if (timeSpent < 5) speedBonus = 5;
    else if (timeSpent < 10) speedBonus = 4;
    else if (timeSpent < 15) speedBonus = 3;
    else if (timeSpent < 20) speedBonus = 2;
    else if (timeSpent < 30) speedBonus = 1;
    
    // Adjust speed bonus for question type
    if (questionType === 'matching') {
      speedBonus = Math.floor(speedBonus * 0.5); // Matching takes longer
    } else if (questionType === 'spelling') {
      speedBonus = Math.floor(speedBonus * 0.7); // Spelling includes memorization time
    }
    
    // Streak bonus
    this.currentStreak++;
    const streakBonus = Math.floor(this.currentStreak / 3) * 2; // +2 points per 3 correct
    
    // Difficulty multiplier
    const difficultyMultiplier = 1 + (difficulty - 1) * 0.5; // 1x, 1.5x, 2x
    
    // Calculate total
    const totalBeforeMultiplier = basePoints + speedBonus + streakBonus;
    const totalPoints = Math.round(totalBeforeMultiplier * difficultyMultiplier);
    
    return {
      basePoints,
      speedBonus,
      streakBonus,
      difficultyMultiplier,
      totalPoints,
    };
  }
  
  static resetStreak(): void {
    this.currentStreak = 0;
  }
  
  static getCurrentStreak(): number {
    return this.currentStreak;
  }
}