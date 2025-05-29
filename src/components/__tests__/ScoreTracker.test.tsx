import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreTracker } from '../ScoreTracker';

describe('ScoreTracker', () => {
  it('should display all score metrics correctly', () => {
    const { container } = render(
      <ScoreTracker
        score={150}
        streak={5}
        questionsAnswered={10}
        correctAnswers={8}
      />
    );

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument();
    
    // For streak, look for the number in the content
    expect(container.textContent).toContain('5');
  });

  it('should show fire emoji for active streak', () => {
    const { container } = render(
      <ScoreTracker
        score={100}
        streak={3}
        questionsAnswered={5}
        correctAnswers={3}
      />
    );

    // Check that both emoji and number are present in the content
    expect(container.textContent).toContain('🔥');
    expect(container.textContent).toContain('3');
  });

  it('should not show fire emoji for zero streak', () => {
    render(
      <ScoreTracker
        score={100}
        streak={0}
        questionsAnswered={5}
        correctAnswers={3}
      />
    );

    expect(screen.queryByText('🔥')).not.toBeInTheDocument();
  });

  it('should show streak bonus indicator for streak multiples of 3', () => {
    render(
      <ScoreTracker
        score={100}
        streak={6}
        questionsAnswered={8}
        correctAnswers={6}
      />
    );

    expect(screen.getByText(/Reeks Bonus/)).toBeInTheDocument();
  });

  it('should not show streak bonus for non-multiples of 3', () => {
    render(
      <ScoreTracker
        score={100}
        streak={4}
        questionsAnswered={8}
        correctAnswers={6}
      />
    );

    expect(screen.queryByText(/Reeks Bonus/)).not.toBeInTheDocument();
  });

  it('should calculate accuracy correctly for zero questions', () => {
    render(
      <ScoreTracker
        score={0}
        streak={0}
        questionsAnswered={0}
        correctAnswers={0}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should show last question points with animation', () => {
    render(
      <ScoreTracker
        score={150}
        streak={2}
        questionsAnswered={10}
        correctAnswers={8}
        lastQuestionPoints={15}
      />
    );

    const pointsDisplay = screen.getByText('+15');
    expect(pointsDisplay).toBeInTheDocument();
    expect(pointsDisplay).toHaveClass('animate-bounce');
  });

  it('should not show last question points for zero points', () => {
    render(
      <ScoreTracker
        score={150}
        streak={2}
        questionsAnswered={10}
        correctAnswers={8}
        lastQuestionPoints={0}
      />
    );

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('should use correct color classes for different metrics', () => {
    const { container } = render(
      <ScoreTracker
        score={150}
        streak={3}
        questionsAnswered={10}
        correctAnswers={8}
      />
    );

    // Check that score has blue color
    const scoreElement = screen.getByText('150');
    expect(scoreElement).toHaveClass('text-blue-600');

    // Check that accuracy has green color
    const accuracyElement = screen.getByText('80%');
    expect(accuracyElement).toHaveClass('text-green-600');

    // Check that progress has purple color
    const progressElement = screen.getByText('8/10');
    expect(progressElement).toHaveClass('text-purple-600');
    
    // Check that streak section contains orange color class
    expect(container.innerHTML).toContain('text-orange-600');
  });
});