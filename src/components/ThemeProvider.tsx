import React, { createContext, useContext, ReactNode } from 'react';

// French-themed color palette as specified in README
export const colors = {
  primary: '#0055A4', // French Blue
  secondary: '#FF6B35', // Dutch Orange
  success: '#10B981', // Green
  error: '#EF4444', // Red
  background: '#F9FAFB', // Light Gray
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
} as const;

// Animation configurations
export const animations = {
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out'
  },
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
    confetti: 3000
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
} as const;

// French-themed design tokens
export const theme = {
  colors,
  animations,
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }
} as const;

// French cultural elements for theming
export const frenchElements = {
  icons: {
    eiffelTower: '🗼',
    croissant: '🥐',
    baguette: '🥖',
    cheese: '🧀',
    wine: '🍷',
    flag: '🇫🇷',
    rose: '🌹',
    art: '🎨',
    book: '📖',
    star: '⭐'
  },
  colors: {
    tricolore: [colors.primary, colors.white, colors.error], // French flag colors
    pastels: ['#E8F4FD', '#FFF2E8', '#F0FDF4', '#FEF2F2'], // Soft versions
    accents: ['#FFD700', '#E6E6FA', '#F0E68C', '#DDA0DD'] // Gold, lavender, khaki, plum
  },
  patterns: {
    fleurDeLis: '⚜️',
    hearts: '♥️',
    diamonds: '♦️',
    stripes: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,85,164,0.1) 10px, rgba(0,85,164,0.1) 20px)'
  }
} as const;

interface ThemeContextType {
  theme: typeof theme;
  frenchElements: typeof frenchElements;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply dark mode styles to document if needed
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const contextValue: ThemeContextType = {
    theme,
    frenchElements,
    isDarkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div 
        className="min-h-screen transition-colors duration-300"
        style={{ 
          backgroundColor: isDarkMode ? theme.colors.gray[900] : theme.colors.background,
          color: isDarkMode ? theme.colors.gray[100] : theme.colors.gray[900]
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility functions for theme usage
export const getColorFromTheme = (colorPath: string): string => {
  const parts = colorPath.split('.');
  let color: any = colors;
  
  for (const part of parts) {
    color = color[part];
    if (color === undefined) {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return colors.primary;
    }
  }
  
  return color;
};

export const getFrenchIcon = (name: keyof typeof frenchElements.icons): string => {
  return frenchElements.icons[name] || frenchElements.icons.star;
};

// CSS-in-JS style helpers
export const createButtonStyles = (variant: 'primary' | 'secondary' | 'success' | 'error' = 'primary') => ({
  backgroundColor: colors[variant],
  color: colors.white,
  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
  borderRadius: theme.borderRadius.lg,
  border: 'none',
  cursor: 'pointer',
  transition: theme.animations.transitions.normal,
  boxShadow: theme.shadows.md,
  fontWeight: '600',
  ':hover': {
    opacity: 0.9,
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows.lg
  },
  ':active': {
    transform: 'translateY(0)',
    boxShadow: theme.shadows.sm
  }
});

export const createCardStyles = () => ({
  backgroundColor: colors.white,
  borderRadius: theme.borderRadius.xl,
  boxShadow: theme.shadows.md,
  padding: theme.spacing.xl,
  transition: theme.animations.transitions.normal,
  ':hover': {
    boxShadow: theme.shadows.lg,
    transform: 'translateY(-2px)'
  }
});