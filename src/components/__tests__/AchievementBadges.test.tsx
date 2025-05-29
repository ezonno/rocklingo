import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AchievementBadges } from '../AchievementBadges';
import { Session } from '../../types';

describe('AchievementBadges', () => {
  const mockQuestionProgress = {
    'q1': { correct: 8, total: 10 }, // 80% - mastered
    'q2': { correct: 7, total: 10 }, // 70% - mastered
    'q3': { correct: 9, total: 10 }, // 90% - mastered
    'q4': { correct: 6, total: 10 }, // 60% - not mastered
  };

  it('should render achievements section', () => {
    render(<AchievementBadges sessions={[]} questionProgress={{}} />);
    
    expect(screen.getByText(/Prestaties \(0\/\d+\)/)).toBeInTheDocument();
  });

  it('should show empty state when no sessions exist', () => {
    render(<AchievementBadges sessions={[]} questionProgress={{}} />);
    
    expect(screen.getByText('Begin met oefenen om prestaties te behalen!')).toBeInTheDocument();
  });

  it('should unlock "First Steps" achievement after first session', () => {
    const sessions: Session[] = [
      {
        id: '1',
        date: Date.now(),
        duration: 900,
        score: 150,
        questionsAnswered: 10,
        correctAnswers: 8
      }
    ];

    render(<AchievementBadges sessions={sessions} questionProgress={mockQuestionProgress} />);
    
    expect(screen.getByText('Eerste Stappen')).toBeInTheDocument();
    expect(screen.getByText('Voltooi je eerste oefensessie')).toBeInTheDocument();
    expect(screen.getByText('🏆 Behaald')).toBeInTheDocument();
  });

  it('should unlock "Perfect!" achievement for 100% accuracy', () => {
    const sessions: Session[] = [
      {
        id: '1',
        date: Date.now(),
        duration: 900,
        score: 150,
        questionsAnswered: 10,
        correctAnswers: 10 // 100% accuracy
      }
    ];

    render(<AchievementBadges sessions={sessions} questionProgress={mockQuestionProgress} />);
    
    expect(screen.getByText('Perfect!')).toBeInTheDocument();
    expect(screen.getByText('Behaal 100% nauwkeurigheid in een sessie')).toBeInTheDocument();
  });

  it('should unlock "High Score" achievement for 200+ points', () => {
    const sessions: Session[] = [
      {
        id: '1',
        date: Date.now(),
        duration: 900,
        score: 250, // High score
        questionsAnswered: 10,
        correctAnswers: 8
      }
    ];

    render(<AchievementBadges sessions={sessions} questionProgress={mockQuestionProgress} />);
    
    expect(screen.getByText('Hoge Score')).toBeInTheDocument();
    expect(screen.getByText('Behaal 200+ punten in één sessie')).toBeInTheDocument();
  });

  it('should unlock "Word Expert" achievement for 10+ mastered words', () => {
    const largeQuestionProgress: { [key: string]: { correct: number; total: number } } = {};
    // Create 15 mastered words (>= 70% accuracy)
    for (let i = 1; i <= 15; i++) {
      largeQuestionProgress[`q${i}`] = { correct: 8, total: 10 }; // 80%
    }

    const sessions: Session[] = [
      { id: '1', date: Date.now(), duration: 900, score: 150, questionsAnswered: 10, correctAnswers: 8 }
    ];

    render(<AchievementBadges sessions={sessions} questionProgress={largeQuestionProgress} />);
    
    expect(screen.getByText('Woordenkenner')).toBeInTheDocument();
    expect(screen.getByText('Leer 10 woorden (70%+ nauwkeurigheid)')).toBeInTheDocument();
  });

  it('should show progress bars for locked achievements when showProgress is true', () => {
    const sessions: Session[] = [
      { id: '1', date: Date.now(), duration: 900, score: 150, questionsAnswered: 10, correctAnswers: 8 }
    ];

    render(<AchievementBadges sessions={sessions} questionProgress={mockQuestionProgress} showProgress={true} />);
    
    expect(screen.getByText('🔒 Te Behalen')).toBeInTheDocument();
    
    // Should show progress elements (progress bars have specific structure)
    const progressBars = document.querySelectorAll('.bg-blue-500');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should not show progress bars when showProgress is false', () => {
    const sessions: Session[] = [
      { id: '1', date: Date.now(), duration: 900, score: 150, questionsAnswered: 10, correctAnswers: 8 }
    ];

    render(<AchievementBadges sessions={sessions} questionProgress={mockQuestionProgress} showProgress={false} />);
    
    // Progress bars should not be rendered
    const progressBars = document.querySelectorAll('.bg-blue-500');
    expect(progressBars.length).toBe(0);
  });

  it('should display correct achievement count in header', () => {
    const sessions: Session[] = [
      {
        id: '1',
        date: Date.now(),
        duration: 900,
        score: 250, // High score achievement
        questionsAnswered: 10,
        correctAnswers: 10 // Perfect achievement
      }
    ];

    render(<AchievementBadges sessions={sessions} questionProgress={mockQuestionProgress} />);
    
    // Should show at least 3 achievements: First Steps, Perfect!, High Score
    expect(screen.getByText(/Prestaties \(3\/\d+\)/)).toBeInTheDocument();
  });

  it('should unlock "Speed Demon" achievement for fast answers', () => {
    const sessions: Session[] = [
      {
        id: '1',
        date: Date.now(),
        duration: 20, // Very short duration
        score: 150,
        questionsAnswered: 10, // Average of 2 seconds per question
        correctAnswers: 8
      }
    ];

    render(<AchievementBadges sessions={sessions} questionProgress={mockQuestionProgress} />);
    
    expect(screen.getByText('Snelheidsduivel')).toBeInTheDocument();
    expect(screen.getByText('Gemiddeld <3 seconden per vraag in een sessie')).toBeInTheDocument();
  });

  it('should show correct progress for marathon achievement', () => {
    const sessions: Session[] = [];
    // Create 10 sessions
    for (let i = 1; i <= 10; i++) {
      sessions.push({
        id: `${i}`,
        date: Date.now() - (i * 86400000),
        duration: 900,
        score: 150,
        questionsAnswered: 10,
        correctAnswers: 8
      });
    }

    render(<AchievementBadges sessions={sessions} questionProgress={mockQuestionProgress} showProgress={true} />);
    
    expect(screen.getByText('Marathon')).toBeInTheDocument();
    expect(screen.getByText('Voltooi 25 oefensessies')).toBeInTheDocument();
    
    // Should show progress: 10/25 (use getAllByText due to multiple instances)
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('25').length).toBeGreaterThan(0);
  });
});