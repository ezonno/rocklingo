import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

type MascotMood = 'happy' | 'excited' | 'thinking' | 'sleeping' | 'surprised' | 'encouraging';
type MascotSize = 'sm' | 'md' | 'lg' | 'xl';

interface FrenchMascotProps {
  mood?: MascotMood;
  size?: MascotSize;
  message?: string;
  showMessage?: boolean;
  autoMessage?: boolean;
  animate?: boolean;
  onClick?: () => void;
  className?: string;
}

const mascotExpressions = {
  happy: '😸',
  excited: '😻',
  thinking: '🤔',
  sleeping: '😴',
  surprised: '😺',
  encouraging: '😽'
};

const mascotMessages = {
  happy: [
    "Bonjour! Klaar om Frans te leren?",
    "Je doet het geweldig!",
    "Wat leuk dat je er bent!",
    "Laten we samen oefenen!"
  ],
  excited: [
    "Fantastisch! Je leert zo snel!",
    "Magnifique! Dat was perfect!",
    "Wauw! Je wordt steeds beter!",
    "Tres bien! Ga zo door!"
  ],
  thinking: [
    "Hmm, denk even goed na...",
    "Neem je tijd, je kunt dit!",
    "Misschien kun je het opnieuw proberen?",
    "Denk aan wat we hebben geleerd..."
  ],
  sleeping: [
    "Zzz... misschien tijd voor een pauze?",
    "Even rusten is ook belangrijk!",
    "Slaap lekker! Tot later!",
    "Zzz... dromen over Franse woorden..."
  ],
  surprised: [
    "Oh! Dat was indrukwekkend!",
    "Wauw! Hoe deed je dat?",
    "Dat had ik niet verwacht!",
    "Verbazingwekkend!"
  ],
  encouraging: [
    "Probeer het nog eens, je kunt dit!",
    "Niet opgeven! Je bent zo dichtbij!",
    "Elke fout is een kans om te leren!",
    "Courage! Je wordt elke dag beter!"
  ]
};

const sizeClasses = {
  sm: 'w-16 h-16 text-4xl',
  md: 'w-24 h-24 text-6xl',
  lg: 'w-32 h-32 text-8xl',
  xl: 'w-40 h-40 text-9xl'
};

export const FrenchMascot: React.FC<FrenchMascotProps> = ({
  mood = 'happy',
  size = 'md',
  message,
  showMessage = true,
  autoMessage = true,
  animate = true,
  onClick,
  className = ''
}) => {
  const { theme, frenchElements } = useTheme();
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-generate messages based on mood
  useEffect(() => {
    if (autoMessage && showMessage) {
      const messages = mascotMessages[mood];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCurrentMessage(message || randomMessage);
    } else if (message) {
      setCurrentMessage(message);
    }
  }, [mood, message, autoMessage, showMessage]);

  // Animation trigger
  useEffect(() => {
    if (animate) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [animate, mood]);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    onClick?.();
  };

  const mascotStyles: React.CSSProperties = {
    transition: theme.animations.transitions.normal,
    cursor: onClick ? 'pointer' : 'default',
    userSelect: 'none'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes mascotBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        
        @keyframes mascotPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes messageSlideIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes speechBubblePop {
          0% { transform: scale(0) rotate(-5deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>

      {/* Mascot Character */}
      <div
        className={`
          ${sizeClasses[size]} 
          flex items-center justify-center 
          bg-gradient-to-br from-blue-50 to-blue-100 
          rounded-full border-4 border-blue-200
          shadow-lg relative overflow-hidden
          ${onClick ? 'hover:shadow-xl hover:scale-105' : ''}
          ${isAnimating ? 'animate-bounce' : 'hover:animate-pulse'}
        `}
        style={mascotStyles}
        onClick={handleClick}
        role={onClick ? 'button' : 'img'}
        aria-label="French learning mascot cat"
        tabIndex={onClick ? 0 : -1}
      >
        {/* French flag background pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(90deg, 
              ${theme.colors.primary} 33%, 
              ${theme.colors.white} 33% 66%, 
              ${theme.colors.error} 66%
            )`
          }}
        />
        
        {/* Mascot face */}
        <div className="relative z-10 flex flex-col items-center">
          <div 
            className={`
              ${isAnimating ? 'animate-pulse' : ''}
              ${mood === 'sleeping' ? 'animate-pulse' : ''}
            `}
            style={{ 
              animation: animate && mood === 'excited' ? 'mascotBounce 0.6s ease-in-out infinite' : undefined
            }}
          >
            {mascotExpressions[mood]}
          </div>
          
          {/* French beret */}
          <div className="absolute -top-2 -right-1 text-xs">
            🎩
          </div>
          
          {/* French flag mini badge */}
          <div className="absolute -bottom-1 -right-1 text-xs">
            {frenchElements.icons.flag}
          </div>
        </div>
      </div>

      {/* Speech Bubble with Message */}
      {showMessage && currentMessage && (
        <div 
          className="absolute top-0 left-full ml-4 max-w-xs z-20"
          style={{
            animation: 'speechBubblePop 0.5s ease-out'
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-3 relative border-2 border-blue-200">
            {/* Speech bubble arrow */}
            <div className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2">
              <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white"></div>
              <div className="absolute w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-blue-200 -left-0.5"></div>
            </div>
            
            <p 
              className="text-sm text-gray-700 font-medium"
              style={{ animation: 'messageSlideIn 0.3s ease-out 0.2s both' }}
            >
              {currentMessage}
            </p>
            
            {/* French accent decorations */}
            <div className="absolute -top-1 -right-1 text-xs">
              {frenchElements.icons.star}
            </div>
          </div>
        </div>
      )}

      {/* Floating hearts animation for excited mood */}
      {mood === 'excited' && animate && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute text-red-400 animate-ping"
              style={{
                top: `${20 + i * 15}%`,
                left: `${80 + i * 5}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s'
              }}
            >
              ❤️
            </div>
          ))}
        </div>
      )}

      {/* Thinking bubbles for thinking mood */}
      {mood === 'thinking' && animate && (
        <div className="absolute -top-2 -right-2 pointer-events-none">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Predefined mascot variants for common scenarios
export const WelcomeMascot: React.FC<Omit<FrenchMascotProps, 'mood'>> = (props) => (
  <FrenchMascot {...props} mood="happy" />
);

export const SuccessMascot: React.FC<Omit<FrenchMascotProps, 'mood'>> = (props) => (
  <FrenchMascot {...props} mood="excited" />
);

export const ThinkingMascot: React.FC<Omit<FrenchMascotProps, 'mood'>> = (props) => (
  <FrenchMascot {...props} mood="thinking" />
);

export const EncouragingMascot: React.FC<Omit<FrenchMascotProps, 'mood'>> = (props) => (
  <FrenchMascot {...props} mood="encouraging" />
);

export const SleepingMascot: React.FC<Omit<FrenchMascotProps, 'mood'>> = (props) => (
  <FrenchMascot {...props} mood="sleeping" />
);

// Interactive mascot that responds to user actions
export const InteractiveMascot: React.FC<{
  userScore?: number;
  isCorrect?: boolean;
  isActive?: boolean;
  size?: MascotSize;
}> = ({ userScore = 0, isCorrect, isActive = true, size = 'md' }) => {
  const [mood, setMood] = useState<MascotMood>('happy');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setMood('sleeping');
      return;
    }

    if (isCorrect === true) {
      setMood('excited');
      setAnimate(true);
    } else if (isCorrect === false) {
      setMood('encouraging');
      setAnimate(true);
    } else if (userScore > 200) {
      setMood('excited');
    } else if (userScore > 100) {
      setMood('happy');
    } else {
      setMood('encouraging');
    }

    const timer = setTimeout(() => setAnimate(false), 3000);
    return () => clearTimeout(timer);
  }, [userScore, isCorrect, isActive]);

  return (
    <FrenchMascot 
      mood={mood}
      size={size}
      animate={animate}
      autoMessage={true}
      showMessage={true}
    />
  );
};