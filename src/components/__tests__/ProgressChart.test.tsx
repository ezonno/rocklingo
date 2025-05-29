import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressChart } from '../ProgressChart';
import { Session } from '../../types';

describe('ProgressChart', () => {
  const mockSessions: Session[] = [
    {
      id: '1',
      date: Date.now() - 86400000 * 2, // 2 days ago
      duration: 900,
      score: 150,
      questionsAnswered: 10,
      correctAnswers: 8
    },
    {
      id: '2',
      date: Date.now() - 86400000, // 1 day ago
      duration: 900,
      score: 180,
      questionsAnswered: 12,
      correctAnswers: 10
    },
    {
      id: '3',
      date: Date.now(),
      duration: 900,
      score: 220,
      questionsAnswered: 15,
      correctAnswers: 13
    }
  ];

  it('should render empty state when no sessions exist', () => {
    render(<ProgressChart sessions={[]} />);
    
    expect(screen.getByText('Score Voortgang')).toBeInTheDocument();
    expect(screen.getByText('Start met oefenen om je voortgang te zien!')).toBeInTheDocument();
  });

  it('should render chart with session data', () => {
    render(<ProgressChart sessions={mockSessions} />);
    
    expect(screen.getByText('Score Voortgang')).toBeInTheDocument();
    expect(screen.getByText('Sessies (3 totaal)')).toBeInTheDocument();
  });

  it('should display summary statistics correctly', () => {
    render(<ProgressChart sessions={mockSessions} />);
    
    // Average score: (150 + 180 + 220) / 3 = 183.33 -> 183
    expect(screen.getByText('183')).toBeInTheDocument();
    expect(screen.getByText('Gemiddeld')).toBeInTheDocument();
    
    // Best score: 220
    expect(screen.getByText('220')).toBeInTheDocument();
    expect(screen.getByText('Hoogste')).toBeInTheDocument();
    
    // Last score: 220 (most recent session)
    expect(screen.getByText('Laatste')).toBeInTheDocument();
  });

  it('should render SVG chart elements', () => {
    const { container } = render(<ProgressChart sessions={mockSessions} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    
    // Check for data points (circles)
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(3); // One for each session
    
    // Check for chart line (path)
    const path = container.querySelector('path[stroke="#0055A4"]');
    expect(path).toBeInTheDocument();
  });

  it('should show correct session count in x-axis label', () => {
    render(<ProgressChart sessions={mockSessions} />);
    
    expect(screen.getByText('Sessies (3 totaal)')).toBeInTheDocument();
  });

  it('should handle single session correctly', () => {
    const singleSession = [mockSessions[0]];
    render(<ProgressChart sessions={singleSession} />);
    
    expect(screen.getByText('Score Voortgang')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument(); // Average, best, and last are all the same
    expect(screen.getByText('Sessies (1 totaal)')).toBeInTheDocument();
  });

  it('should display y-axis labels', () => {
    render(<ProgressChart sessions={mockSessions} />);
    
    // Check for y-axis value labels
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});