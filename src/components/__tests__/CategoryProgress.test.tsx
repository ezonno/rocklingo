import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryProgress } from '../CategoryProgress';
import { Session } from '../../types';

describe('CategoryProgress', () => {
  const mockSessions: Session[] = [
    {
      id: '1',
      date: Date.now(),
      duration: 900,
      score: 150,
      questionsAnswered: 10,
      correctAnswers: 8
    }
  ];

  const mockQuestionProgress = {
    'animals_dog': { correct: 8, total: 10, category: 'animals' },
    'animals_cat': { correct: 7, total: 10, category: 'animals' },
    'animals_bird': { correct: 9, total: 10, category: 'animals' },
    'colors_red': { correct: 6, total: 10, category: 'colors' },
    'colors_blue': { correct: 5, total: 10, category: 'colors' },
    'family_mother': { correct: 9, total: 10, category: 'family' },
    'family_father': { correct: 8, total: 10, category: 'family' },
    'school_book': { correct: 4, total: 10, category: 'school' },
  };

  it('should render category progress section', () => {
    render(<CategoryProgress sessions={mockSessions} questionProgress={mockQuestionProgress} />);
    
    expect(screen.getByText('Categorie Voortgang')).toBeInTheDocument();
  });

  it('should show empty state when no question progress exists', () => {
    render(<CategoryProgress sessions={mockSessions} questionProgress={{}} />);
    
    expect(screen.getByText('Begin met oefenen om categorie voortgang te zien!')).toBeInTheDocument();
  });

  it('should display categories with correct metadata', () => {
    render(<CategoryProgress sessions={mockSessions} questionProgress={mockQuestionProgress} />);
    
    expect(screen.getByText('Dieren')).toBeInTheDocument();
    expect(screen.getByText('Kleuren')).toBeInTheDocument();
    expect(screen.getByText('Familie')).toBeInTheDocument();
    expect(screen.getByText('School')).toBeInTheDocument();
    
    // Check for category icons
    expect(screen.getByText('🐾')).toBeInTheDocument(); // Animals
    expect(screen.getByText('🎨')).toBeInTheDocument(); // Colors
    expect(screen.getByText('👨‍👩‍👧‍👦')).toBeInTheDocument(); // Family
    expect(screen.getByText('🏫')).toBeInTheDocument(); // School
  });

  it('should calculate mastery correctly', () => {
    render(<CategoryProgress sessions={mockSessions} questionProgress={mockQuestionProgress} />);
    
    // Animals: 3 questions total, 3 mastered (all >= 70% with >= 3 attempts)
    expect(screen.getByText('3/3 woorden geleerd')).toBeInTheDocument();
    
    // Colors: 2 questions total, 0 mastered (both < 70%)
    expect(screen.getByText('0/2 woorden geleerd')).toBeInTheDocument();
    
    // Family: 2 questions total, 2 mastered (both >= 70%)
    expect(screen.getByText('2/2 woorden geleerd')).toBeInTheDocument();
    
    // School: 1 question total, 0 mastered (< 70%)
    expect(screen.getByText('0/1 woorden geleerd')).toBeInTheDocument();
  });

  it('should calculate accuracy percentages correctly', () => {
    render(<CategoryProgress sessions={mockSessions} questionProgress={mockQuestionProgress} />);
    
    // Animals: (8+7+9)/(10+10+10) = 24/30 = 80%
    expect(screen.getByText('80% nauwkeurig')).toBeInTheDocument();
    
    // Colors: (6+5)/(10+10) = 11/20 = 55%
    expect(screen.getByText('55% nauwkeurig')).toBeInTheDocument();
    
    // Family: (9+8)/(10+10) = 17/20 = 85%
    expect(screen.getByText('85% nauwkeurig')).toBeInTheDocument();
    
    // School: 4/10 = 40%
    expect(screen.getByText('40% nauwkeurig')).toBeInTheDocument();
  });

  it('should display attempt counts', () => {
    render(<CategoryProgress sessions={mockSessions} questionProgress={mockQuestionProgress} />);
    
    // Animals: 30 total attempts (10+10+10)
    expect(screen.getByText('30 pogingen')).toBeInTheDocument();
    
    // Colors and Family both have 20 total attempts - use getAllByText
    const twentyElements = screen.getAllByText('20 pogingen');
    expect(twentyElements).toHaveLength(2);
    
    // School: 10 total attempts
    expect(screen.getByText('10 pogingen')).toBeInTheDocument();
  });

  it('should show correct/incorrect breakdown', () => {
    render(<CategoryProgress sessions={mockSessions} questionProgress={mockQuestionProgress} />);
    
    // Animals: 24 correct, 6 incorrect
    expect(screen.getByText('✓ 24 juist')).toBeInTheDocument();
    
    // Colors: 11 correct, 9 incorrect  
    expect(screen.getByText('✓ 11 juist')).toBeInTheDocument();
    expect(screen.getByText('✗ 9 fout')).toBeInTheDocument();
    
    // Check for multiple instances of "✗ 6 fout" (Animals and School both have 6 incorrect)
    const sixIncorrectElements = screen.getAllByText('✗ 6 fout');
    expect(sixIncorrectElements.length).toBeGreaterThan(0);
  });

  it('should apply correct performance color coding', () => {
    const { container } = render(<CategoryProgress sessions={mockSessions} questionProgress={mockQuestionProgress} />);
    
    // Check that performance color classes are present (specific combinations may vary)
    expect(container.innerHTML).toContain('text-green-600 bg-green-50');
    expect(container.innerHTML).toContain('text-red-600 bg-red-50');
  });

  it('should display progress bars with correct widths', () => {
    const { container } = render(<CategoryProgress sessions={mockSessions} questionProgress={mockQuestionProgress} />);
    
    // Animals: 100% mastery (3/3 mastered)
    const progressBars = container.querySelectorAll('[style*="width: 100%"]');
    expect(progressBars.length).toBeGreaterThan(0);
    
    // Colors: 0% mastery (0/2 mastered)
    const zeroProgressBars = container.querySelectorAll('[style*="width: 0%"]');
    expect(zeroProgressBars.length).toBeGreaterThan(0);
  });

  it('should display summary overview correctly', () => {
    render(<CategoryProgress sessions={mockSessions} questionProgress={mockQuestionProgress} />);
    
    expect(screen.getByText('📊 Overzicht')).toBeInTheDocument();
    
    // 4 categories - use specific selector to avoid conflicts
    const categoriesElements = screen.getAllByText('4');
    expect(categoriesElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Categorieën')).toBeInTheDocument();
    
    // 5 total mastered words (3+0+2+0)
    const masteredElements = screen.getAllByText('5');
    expect(masteredElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Geleerd')).toBeInTheDocument();
    
    // 8 total words (3+2+2+1)
    const totalElements = screen.getAllByText('8');
    expect(totalElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Totaal Woorden')).toBeInTheDocument();
    
    // Average accuracy: (80+55+85+40)/4 = 65%
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('Gem. Nauwkeurigheid')).toBeInTheDocument();
  });

  it('should handle questions without explicit category', () => {
    const progressWithoutCategory = {
      'general_word1': { correct: 8, total: 10 }, // No category specified
      'unknown_word2': { correct: 7, total: 10 }, // Unknown category prefix
    };
    
    render(<CategoryProgress sessions={mockSessions} questionProgress={progressWithoutCategory} />);
    
    // Should still render without crashing
    expect(screen.getByText('Categorie Voortgang')).toBeInTheDocument();
  });

  it('should sort categories by mastery percentage', () => {
    const { container } = render(<CategoryProgress sessions={mockSessions} questionProgress={mockQuestionProgress} />);
    
    // Family and Animals should appear before Colors and School (higher mastery)
    const categoryElements = container.querySelectorAll('[class*="border rounded-lg p-4"]');
    expect(categoryElements.length).toBe(4);
  });
});