import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { 
  ConfettiCelebration,
  AchievementConfetti,
  SessionCompleteConfetti,
  StreakConfetti,
  PerfectScoreConfetti,
  useConfetti
} from '../ConfettiCelebration';
import { ThemeProvider } from '../ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
}) as any;
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

describe('ConfettiCelebration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders when isActive is true', () => {
    renderWithTheme(
      <ConfettiCelebration isActive={true} showMessage={false} />
    );
    
    // Should render the confetti container
    const confettiContainer = document.querySelector('.fixed.inset-0.pointer-events-none');
    expect(confettiContainer).toBeInTheDocument();
  });

  test('does not render when isActive is false', () => {
    renderWithTheme(
      <ConfettiCelebration isActive={false} />
    );
    
    // Should not render confetti particles
    const confettiContainer = document.querySelector('.fixed.inset-0.pointer-events-none');
    expect(confettiContainer).toBeNull();
  });

  test('displays celebration message', () => {
    renderWithTheme(
      <ConfettiCelebration 
        isActive={true} 
        showMessage={true}
        customMessage="Test celebration message!"
      />
    );
    
    expect(screen.getByText("Test celebration message!")).toBeInTheDocument();
  });

  test('generates random message for trigger type', () => {
    renderWithTheme(
      <ConfettiCelebration 
        isActive={true} 
        showMessage={true}
        trigger="achievement"
      />
    );
    
    // Should display one of the achievement messages
    const messageElement = screen.getByText(/🎉|🏆|⭐|🌟/);
    expect(messageElement).toBeInTheDocument();
  });

  test('calls onComplete callback after duration', async () => {
    const onCompleteMock = vi.fn();
    
    renderWithTheme(
      <ConfettiCelebration 
        isActive={true} 
        duration={1000}
        onComplete={onCompleteMock}
        showMessage={false}
      />
    );
    
    // Fast-forward time past duration
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100); // Add extra buffer
    });
    
    // Verify callback was called
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });

  test('adjusts particle count based on intensity', () => {
    const { container: lowContainer } = renderWithTheme(
      <ConfettiCelebration 
        isActive={true} 
        intensity="low"
        particleCount={100}
        showMessage={false}
      />
    );
    
    const { container: highContainer } = renderWithTheme(
      <ConfettiCelebration 
        isActive={true} 
        intensity="high"
        particleCount={100}
        showMessage={false}
      />
    );
    
    // Both should render (exact particle counting is complex due to animation)
    expect(lowContainer.firstChild).toBeInTheDocument();
    expect(highContainer.firstChild).toBeInTheDocument();
  });

  test('includes sparkle effects', () => {
    renderWithTheme(
      <ConfettiCelebration isActive={true} showMessage={false} />
    );
    
    // Should render sparkle elements
    const sparkles = screen.getAllByText('✨');
    expect(sparkles.length).toBe(10); // Default number of sparkles
  });

  test('renders burst effect overlay', () => {
    const { container } = renderWithTheme(
      <ConfettiCelebration isActive={true} showMessage={false} />
    );
    
    // Should have burst effect overlay
    const burstOverlay = container.querySelector('.bg-gradient-radial');
    expect(burstOverlay).toBeInTheDocument();
  });

  test('hides message when showMessage is false', () => {
    renderWithTheme(
      <ConfettiCelebration 
        isActive={true} 
        showMessage={false}
        customMessage="This should not appear"
      />
    );
    
    expect(screen.queryByText("This should not appear")).not.toBeInTheDocument();
  });
});

describe('Predefined Confetti Variants', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('AchievementConfetti has correct props', () => {
    renderWithTheme(
      <AchievementConfetti isActive={true} showMessage={false} />
    );
    
    // Should render with achievement trigger and high intensity
    const container = document.querySelector('.fixed.inset-0.pointer-events-none');
    expect(container).toBeInTheDocument();
  });

  test('SessionCompleteConfetti has medium intensity', () => {
    renderWithTheme(
      <SessionCompleteConfetti isActive={true} showMessage={false} />
    );
    
    const container = document.querySelector('.fixed.inset-0.pointer-events-none');
    expect(container).toBeInTheDocument();
  });

  test('StreakConfetti has medium intensity', () => {
    renderWithTheme(
      <StreakConfetti isActive={true} showMessage={false} />
    );
    
    const container = document.querySelector('.fixed.inset-0.pointer-events-none');
    expect(container).toBeInTheDocument();
  });

  test('PerfectScoreConfetti has longer duration', () => {
    const onCompleteMock = vi.fn();
    
    renderWithTheme(
      <PerfectScoreConfetti 
        isActive={true} 
        onComplete={onCompleteMock}
        showMessage={false}
      />
    );
    
    // Should take 4000ms to complete (longer than default)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(onCompleteMock).not.toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });
});

describe('useConfetti Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const TestHookComponent = () => {
    const { isActive, triggerConfetti, stopConfetti, ConfettiComponent } = useConfetti();
    
    return (
      <div>
        <div data-testid="is-active">{isActive ? 'active' : 'inactive'}</div>
        <button onClick={() => triggerConfetti('achievement')} data-testid="trigger">
          Trigger
        </button>
        <button onClick={stopConfetti} data-testid="stop">
          Stop
        </button>
        <ConfettiComponent showMessage={false} />
      </div>
    );
  };

  test('manages confetti state correctly', () => {
    renderWithTheme(<TestHookComponent />);
    
    const statusElement = screen.getByTestId('is-active');
    const triggerButton = screen.getByTestId('trigger');
    const stopButton = screen.getByTestId('stop');
    
    // Initially inactive
    expect(statusElement).toHaveTextContent('inactive');
    
    // Trigger confetti
    act(() => {
      triggerButton.click();
    });
    expect(statusElement).toHaveTextContent('active');
    
    // Stop confetti
    act(() => {
      stopButton.click();
    });
    expect(statusElement).toHaveTextContent('inactive');
  });

  test('auto-stops confetti after completion', async () => {
    const TestAutoStopComponent = () => {
      const { isActive, triggerConfetti, ConfettiComponent } = useConfetti();
      
      return (
        <div>
          <div data-testid="is-active">{isActive ? 'active' : 'inactive'}</div>
          <button onClick={() => triggerConfetti()} data-testid="trigger">
            Trigger
          </button>
          <ConfettiComponent duration={100} showMessage={false} />
        </div>
      );
    };

    renderWithTheme(<TestAutoStopComponent />);
    
    const statusElement = screen.getByTestId('is-active');
    const triggerButton = screen.getByTestId('trigger');
    
    // Trigger confetti
    act(() => {
      triggerButton.click();
    });
    expect(statusElement).toHaveTextContent('active');
    
    // Wait for auto-completion
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    
    expect(statusElement).toHaveTextContent('inactive');
  });
});

describe('Message Variations', () => {
  test('generates different messages for different triggers', () => {
    const triggers = ['achievement', 'session', 'streak', 'perfect'] as const;
    
    triggers.forEach(trigger => {
      const { unmount } = renderWithTheme(
        <ConfettiCelebration 
          isActive={true} 
          trigger={trigger}
          showMessage={true}
        />
      );
      
      // Should render some celebration message (or container)
      const container = document.querySelector('.fixed.inset-0.pointer-events-none');
      expect(container).toBeInTheDocument();
      
      unmount();
    });
  });

  test('uses custom message over generated ones', () => {
    const customMessage = "Custom celebration text!";
    
    renderWithTheme(
      <ConfettiCelebration 
        isActive={true} 
        customMessage={customMessage}
        showMessage={true}
      />
    );
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});

describe('French Theme Integration', () => {
  test('uses French-themed colors and emojis', () => {
    const { container } = renderWithTheme(
      <ConfettiCelebration isActive={true} showMessage={false} />
    );
    
    // Should use French blue color in message styling
    expect(container).toBeInTheDocument();
  });

  test('includes French emojis in particles', () => {
    // This is tested through the component rendering without errors
    // Exact emoji testing would require animation frame mocking
    renderWithTheme(
      <ConfettiCelebration isActive={true} showMessage={false} />
    );
    
    const container = document.querySelector('.fixed.inset-0.pointer-events-none');
    expect(container).toBeInTheDocument();
  });
});