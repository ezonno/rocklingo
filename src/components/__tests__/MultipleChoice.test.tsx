import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MultipleChoice } from '../QuestionTypes/MultipleChoice';
import { Question } from '../../types';

// Mock the QuestionBankService
vi.mock('../../services/questionBank', () => ({
  QuestionBankService: {
    getCategories: vi.fn().mockResolvedValue([
      {
        id: 'test',
        name: 'Test',
        icon: '🧪',
        questions: [
          { id: 'q1', dutch: 'hond', french: 'chien', category: 'test', difficulty: 1 },
          { id: 'q2', dutch: 'kat', french: 'chat', category: 'test', difficulty: 1 },
          { id: 'q3', dutch: 'boek', french: 'livre', category: 'test', difficulty: 1 },
          { id: 'q4', dutch: 'huis', french: 'maison', category: 'test', difficulty: 1 },
        ],
      },
    ]),
    getDistractors: vi.fn().mockReturnValue(['chat', 'livre', 'maison']),
  },
}));

describe('MultipleChoice', () => {
  const mockQuestion: Question = {
    id: 'q1',
    dutch: 'hond',
    french: 'chien',
    category: 'test',
    difficulty: 1,
  };

  const mockOnAnswer = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Dutch word', async () => {
    await act(async () => {
      render(
        <MultipleChoice
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          onSkip={mockOnSkip}
        />
      );
    });

    expect(screen.getByText('hond')).toBeInTheDocument();
  });

  it('shows multiple choice options', async () => {
    render(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        onSkip={mockOnSkip}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('chien')).toBeInTheDocument();
      // Should show distractors as well
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
    });
  });

  it('handles correct answer', async () => {
    render(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        onSkip={mockOnSkip}
      />
    );

    await waitFor(() => {
      const correctButton = screen.getByText('chien');
      fireEvent.click(correctButton);
    });

    // Should show success feedback
    await waitFor(() => {
      expect(screen.getByText(/Correct/i)).toBeInTheDocument();
    });

    // Should call onAnswer with correct = true
    await waitFor(() => {
      expect(mockOnAnswer).toHaveBeenCalledWith(true, expect.any(Number));
    }, { timeout: 2000 });
  });

  it('handles incorrect answer', async () => {
    render(
      <MultipleChoice
        question={mockQuestion}
        onAnswer={mockOnAnswer}
        onSkip={mockOnSkip}
      />
    );

    // Wait for options to be rendered
    await waitFor(() => {
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
    });

    // Click on incorrect answer
    const buttons = screen.getAllByRole('button');
    const incorrectButton = buttons.find(btn => 
      btn.textContent !== 'chien' && 
      btn.textContent !== 'Sla over' &&
      btn.textContent // ensure it has text
    );
    
    if (incorrectButton) {
      fireEvent.click(incorrectButton);
      
      // Wait for feedback to appear
      await waitFor(() => {
        const feedbackText = screen.getByText((content) => {
          return content.includes('Fout') && content.includes('Het juiste antwoord is');
        });
        expect(feedbackText).toBeInTheDocument();
      });
    }

    // Should call onAnswer with correct = false
    await waitFor(() => {
      expect(mockOnAnswer).toHaveBeenCalledWith(false, expect.any(Number));
    }, { timeout: 3000 });
  });

  it('handles skip button', async () => {
    await act(async () => {
      render(
        <MultipleChoice
          question={mockQuestion}
          onAnswer={mockOnAnswer}
          onSkip={mockOnSkip}
        />
      );
    });

    const skipButton = screen.getByText('Sla over');
    fireEvent.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalled();
  });
});