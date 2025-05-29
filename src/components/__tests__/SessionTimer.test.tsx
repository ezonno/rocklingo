import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SessionTimer } from '../SessionTimer';

describe('SessionTimer', () => {
  let mockOnTimeUp: ReturnType<typeof vi.fn>;
  let mockOnTogglePause: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnTimeUp = vi.fn();
    mockOnTogglePause = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should display initial time correctly', () => {
    render(
      <SessionTimer
        duration={120}
        onTimeUp={mockOnTimeUp}
        isPaused={false}
        onTogglePause={mockOnTogglePause}
      />
    );

    expect(screen.getByText('2:00')).toBeInTheDocument();
  });

  it('should countdown when not paused', () => {
    render(
      <SessionTimer
        duration={120}
        onTimeUp={mockOnTimeUp}
        isPaused={false}
        onTogglePause={mockOnTogglePause}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('1:59')).toBeInTheDocument();
  });

  it('should not countdown when paused', () => {
    render(
      <SessionTimer
        duration={120}
        onTimeUp={mockOnTimeUp}
        isPaused={true}
        onTogglePause={mockOnTogglePause}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('2:00')).toBeInTheDocument();
  });

  it('should call onTimeUp when time reaches zero', () => {
    render(
      <SessionTimer
        duration={2}
        onTimeUp={mockOnTimeUp}
        isPaused={false}
        onTogglePause={mockOnTogglePause}
      />
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockOnTimeUp).toHaveBeenCalled();
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('should show pause button when not paused', () => {
    render(
      <SessionTimer
        duration={120}
        onTimeUp={mockOnTimeUp}
        isPaused={false}
        onTogglePause={mockOnTogglePause}
      />
    );

    expect(screen.getByText('⏸️ Pauze')).toBeInTheDocument();
  });

  it('should show resume button when paused', () => {
    render(
      <SessionTimer
        duration={120}
        onTimeUp={mockOnTimeUp}
        isPaused={true}
        onTogglePause={mockOnTogglePause}
      />
    );

    expect(screen.getByText('▶️ Hervat')).toBeInTheDocument();
  });

  it('should call onTogglePause when pause/resume button is clicked', () => {
    render(
      <SessionTimer
        duration={120}
        onTimeUp={mockOnTimeUp}
        isPaused={false}
        onTogglePause={mockOnTogglePause}
      />
    );

    fireEvent.click(screen.getByText('⏸️ Pauze'));
    expect(mockOnTogglePause).toHaveBeenCalled();
  });

  it('should show low time warning in last minute', () => {
    render(
      <SessionTimer
        duration={60}
        onTimeUp={mockOnTimeUp}
        isPaused={false}
        onTogglePause={mockOnTogglePause}
      />
    );

    // Should show warning emoji
    expect(screen.getByText('⏰')).toBeInTheDocument();
    
    // Time display should be red
    const timeDisplay = screen.getByText('1:00');
    expect(timeDisplay).toHaveClass('text-red-500');
  });

  it('should update progress bar correctly', () => {
    const { container } = render(
      <SessionTimer
        duration={100}
        onTimeUp={mockOnTimeUp}
        isPaused={false}
        onTogglePause={mockOnTogglePause}
      />
    );

    // Find progress bar
    const progressBar = container.querySelector('.h-full.rounded-full.transition-all');
    expect(progressBar).toHaveStyle({ width: '0%' });

    act(() => {
      vi.advanceTimersByTime(50000); // 50 seconds
    });

    // Progress should be 50%
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('should format time correctly', () => {
    render(
      <SessionTimer
        duration={3661}
        onTimeUp={mockOnTimeUp}
        isPaused={false}
        onTogglePause={mockOnTogglePause}
      />
    );

    expect(screen.getByText('61:01')).toBeInTheDocument();
  });
});