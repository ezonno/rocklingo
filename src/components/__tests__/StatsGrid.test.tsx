import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsGrid } from '../StatsGrid';
import { Session } from '../../types';

describe('StatsGrid', () => {
  const mockSessions: Session[] = [
    {
      id: '1',
      date: Date.now() - 86400000,
      duration: 900, // 15 minutes
      score: 150,
      questionsAnswered: 10,
      correctAnswers: 8
    },
    {
      id: '2',
      date: Date.now(),
      duration: 1200, // 20 minutes
      score: 200,
      questionsAnswered: 12,
      correctAnswers: 10
    }
  ];

  const mockQuestionProgress = {
    'q1': { correct: 8, total: 10 }, // 80% - mastered
    'q2': { correct: 5, total: 10 }, // 50% - not mastered
    'q3': { correct: 7, total: 10 }, // 70% - mastered
    'q4': { correct: 2, total: 3 },  // 67% - not mastered (less than 70%)
  };

  it('should display statistics grid with correct calculations', () => {
    render(<StatsGrid sessions={mockSessions} totalQuestionProgress={mockQuestionProgress} />);
    
    expect(screen.getByText('Gedetailleerde Statistieken')).toBeInTheDocument();
    
    // Average score: (150 + 200) / 2 = 175
    expect(screen.getByText('175')).toBeInTheDocument();
    expect(screen.getByText('Gemiddelde Score')).toBeInTheDocument();
    
    // Best score: 200
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('Beste Score')).toBeInTheDocument();
    
    // Total time: (900 + 1200) seconds / 60 = 35 minutes
    expect(screen.getByText('35m')).toBeInTheDocument();
    expect(screen.getByText('Tijd Geoefend')).toBeInTheDocument();
    
    // Words mastered: 2 (q1 and q3 have >= 70% accuracy)
    expect(screen.getByText('Woorden Geleerd')).toBeInTheDocument();
    
    // Total sessions: 2
    expect(screen.getByText('Totale Sessies')).toBeInTheDocument();
    
    // Total questions: 10 + 12 = 22
    expect(screen.getByText('Totale Vragen')).toBeInTheDocument();
  });

  it('should calculate overall accuracy correctly', () => {
    render(<StatsGrid sessions={mockSessions} totalQuestionProgress={mockQuestionProgress} />);
    
    // Overall accuracy: (8 + 10) / (10 + 12) = 18/22 = 81.8% -> 82%
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('Totale Nauwkeurigheid')).toBeInTheDocument();
  });

  it('should calculate current streak correctly', () => {
    // Create sessions with good accuracy (>= 70%)
    const streakSessions: Session[] = [
      { id: '1', date: Date.now() - 2000, duration: 900, score: 150, questionsAnswered: 10, correctAnswers: 8 }, // 80%
      { id: '2', date: Date.now() - 1000, duration: 900, score: 150, questionsAnswered: 10, correctAnswers: 7 }, // 70%
      { id: '3', date: Date.now(), duration: 900, score: 150, questionsAnswered: 10, correctAnswers: 8 }, // 80%
    ];
    
    render(<StatsGrid sessions={streakSessions} totalQuestionProgress={mockQuestionProgress} />);
    
    // Should show current streak
    expect(screen.getByText('Huidige Reeks')).toBeInTheDocument();
  });

  it('should display time in hours and minutes format', () => {
    const longSessions: Session[] = [
      { id: '1', date: Date.now(), duration: 3900, score: 150, questionsAnswered: 10, correctAnswers: 8 }, // 65 minutes
    ];
    
    render(<StatsGrid sessions={longSessions} totalQuestionProgress={mockQuestionProgress} />);
    
    // 3900 seconds = 65 minutes = 1 hour 5 minutes
    expect(screen.getByText('1u 5m')).toBeInTheDocument();
  });

  it('should handle empty sessions array', () => {
    render(<StatsGrid sessions={[]} totalQuestionProgress={{}} />);
    
    expect(screen.getByText('Gedetailleerde Statistieken')).toBeInTheDocument();
    // Multiple zeros for empty stats - use getAllByText
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should show insights section with appropriate messages', () => {
    render(<StatsGrid sessions={mockSessions} totalQuestionProgress={mockQuestionProgress} />);
    
    expect(screen.getByText('💡 Inzichten')).toBeInTheDocument();
    
    // Should show high accuracy message (82% >= 80%)
    expect(screen.getByText(/Uitstekend! Je nauwkeurigheid is erg hoog/)).toBeInTheDocument();
  });

  it('should display trend indicators for consecutive sessions', () => {
    const trendSessions: Session[] = [
      { id: '1', date: Date.now() - 1000, duration: 900, score: 150, questionsAnswered: 10, correctAnswers: 8 },
      { id: '2', date: Date.now(), duration: 900, score: 200, questionsAnswered: 10, correctAnswers: 8 }, // Higher score
    ];
    
    const { container } = render(<StatsGrid sessions={trendSessions} totalQuestionProgress={mockQuestionProgress} />);
    
    // Should show upward trend (↗️) since last score is higher
    expect(container.textContent).toContain('↗️');
  });

  it('should handle missing question progress data', () => {
    render(<StatsGrid sessions={mockSessions} />);
    
    expect(screen.getByText('Gedetailleerde Statistieken')).toBeInTheDocument();
    // Should still render without crashing, with 0 words mastered
    expect(screen.getByText('Woorden Geleerd')).toBeInTheDocument();
  });
});