import React, { useState, useRef, useEffect } from 'react';
import { useTheme, getFrenchIcon } from './ThemeProvider';

type AnimationType = 'bounce' | 'pulse' | 'spin' | 'float' | 'wiggle' | 'glow' | 'shake';
type FrenchIconType = 'eiffelTower' | 'croissant' | 'baguette' | 'cheese' | 'wine' | 'flag' | 'rose' | 'art' | 'book' | 'star';

interface AnimatedIconProps {
  icon?: FrenchIconType;
  customIcon?: string;
  animation?: AnimationType;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  duration?: number; // in milliseconds
  delay?: number; // in milliseconds
  loop?: boolean;
  trigger?: 'hover' | 'click' | 'auto' | 'manual';
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeClasses = {
  sm: 'text-lg', // ~18px
  md: 'text-2xl', // ~24px
  lg: 'text-4xl', // ~36px
  xl: 'text-6xl', // ~60px
  xxl: 'text-8xl' // ~96px
};

const animationStyles: Record<AnimationType, React.CSSProperties> = {
  bounce: {
    animation: 'bounce 1s ease-in-out infinite'
  },
  pulse: {
    animation: 'pulse 2s ease-in-out infinite'
  },
  spin: {
    animation: 'spin 2s linear infinite'
  },
  float: {
    animation: 'float 3s ease-in-out infinite'
  },
  wiggle: {
    animation: 'wiggle 0.5s ease-in-out infinite'
  },
  glow: {
    animation: 'glow 2s ease-in-out infinite alternate'
  },
  shake: {
    animation: 'shake 0.5s ease-in-out infinite'
  }
};

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon = 'star',
  customIcon,
  animation = 'bounce',
  size = 'md',
  duration = 1000,
  delay = 0,
  loop = true,
  trigger = 'auto',
  isActive = true,
  onClick,
  className = ''
}) => {
  const { theme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(trigger === 'auto' && isActive);
  const [isHovered, setIsHovered] = useState(false);
  const iconRef = useRef<HTMLSpanElement>(null);

  const displayIcon = customIcon || getFrenchIcon(icon);

  // Handle animation triggers
  useEffect(() => {
    if (trigger === 'auto' && isActive) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, isActive, delay]);

  useEffect(() => {
    if (trigger === 'manual') {
      setIsAnimating(isActive);
    }
  }, [trigger, isActive]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (trigger === 'hover') {
      setIsAnimating(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (trigger === 'hover') {
      setIsAnimating(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsAnimating(true);
      if (!loop) {
        setTimeout(() => {
          setIsAnimating(false);
        }, duration);
      }
    }
    onClick?.();
  };

  // Generate CSS custom properties for animation duration
  const animationDuration = `${duration}ms`;
  const customStyles: React.CSSProperties = {
    ...animationStyles[animation],
    animationDuration: loop ? animationDuration : `${duration}ms`,
    animationIterationCount: loop ? 'infinite' : '1',
    animationDelay: `${delay}ms`,
    cursor: onClick ? 'pointer' : 'default',
    transition: theme.animations.transitions.normal,
    display: 'inline-block',
    userSelect: 'none'
  };

  // Add hover effects
  if (isHovered && !isAnimating) {
    customStyles.transform = 'scale(1.1)';
  }

  return (
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        
        @keyframes glow {
          0% { text-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
          100% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-15px); }
          70% { transform: translateY(-7px); }
          90% { transform: translateY(-3px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <span
        ref={iconRef}
        className={`inline-block ${sizeClasses[size]} ${className}`}
        style={isAnimating ? customStyles : { 
          cursor: onClick ? 'pointer' : 'default',
          transition: theme.animations.transitions.normal,
          display: 'inline-block',
          userSelect: 'none',
          ...(isHovered && { transform: 'scale(1.1)' })
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role={onClick ? 'button' : 'img'}
        aria-label={`French themed icon: ${icon}`}
        tabIndex={onClick ? 0 : -1}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {displayIcon}
      </span>
    </>
  );
};

// Predefined combinations for common use cases
export const CelebrationIcon: React.FC<Omit<AnimatedIconProps, 'animation' | 'icon'>> = (props) => (
  <AnimatedIcon {...props} icon="star" animation="bounce" />
);

export const WelcomeIcon: React.FC<Omit<AnimatedIconProps, 'animation' | 'icon'>> = (props) => (
  <AnimatedIcon {...props} icon="eiffelTower" animation="float" />
);

export const SuccessIcon: React.FC<Omit<AnimatedIconProps, 'animation' | 'icon'>> = (props) => (
  <AnimatedIcon {...props} icon="flag" animation="pulse" />
);

export const LoadingIcon: React.FC<Omit<AnimatedIconProps, 'animation' | 'icon'>> = (props) => (
  <AnimatedIcon {...props} icon="croissant" animation="spin" />
);

export const AttentionIcon: React.FC<Omit<AnimatedIconProps, 'animation' | 'icon'>> = (props) => (
  <AnimatedIcon {...props} icon="rose" animation="wiggle" />
);

// French-themed icon gallery for easy selection
export const FrenchIconGallery: React.FC<{
  onIconSelect?: (icon: FrenchIconType) => void;
  selectedIcon?: FrenchIconType;
}> = ({ onIconSelect, selectedIcon }) => {
  const iconList: FrenchIconType[] = [
    'eiffelTower', 'croissant', 'baguette', 'cheese', 'wine', 
    'flag', 'rose', 'art', 'book', 'star'
  ];

  const iconNames = {
    eiffelTower: 'Eiffel Tower',
    croissant: 'Croissant',
    baguette: 'Baguette',
    cheese: 'Cheese',
    wine: 'Wine',
    flag: 'French Flag',
    rose: 'Rose',
    art: 'Art',
    book: 'Book',
    star: 'Star'
  };

  return (
    <div className="grid grid-cols-5 gap-4 p-4 bg-white rounded-lg shadow-md">
      {iconList.map((iconType) => (
        <div
          key={iconType}
          className={`p-3 rounded-lg text-center cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
            selectedIcon === iconType ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50'
          }`}
          onClick={() => onIconSelect?.(iconType)}
        >
          <AnimatedIcon 
            icon={iconType} 
            trigger="hover" 
            animation="bounce" 
            size="lg"
          />
          <div className="text-xs mt-2 text-gray-600">
            {iconNames[iconType]}
          </div>
        </div>
      ))}
    </div>
  );
};