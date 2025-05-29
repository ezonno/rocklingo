import React, { useEffect, useState, useRef } from 'react';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  emoji?: string;
  life: number;
  maxLife: number;
}

interface ConfettiCelebrationProps {
  isActive: boolean;
  duration?: number; // in milliseconds
  particleCount?: number;
  onComplete?: () => void;
  trigger?: 'achievement' | 'session' | 'streak' | 'perfect';
  intensity?: 'low' | 'medium' | 'high';
  showMessage?: boolean;
  customMessage?: string;
}

const celebrationMessages = {
  achievement: [
    "🎉 Nieuwe prestatie behaald!",
    "🏆 Fantastisch! Je hebt een badge verdiend!",
    "⭐ Magnifique! Dat was geweldig!",
    "🌟 Très bien! Je bent een ster!"
  ],
  session: [
    "🎊 Sessie voltooid!",
    "👏 Goed gedaan! Weer een stap verder!",
    "🎯 Perfect! Je hebt het gehaald!",
    "🎈 Bravo! Tot de volgende keer!"
  ],
  streak: [
    "🔥 Geweldige reeks!",
    "⚡ Je bent on fire!",
    "💫 Indrukwekkend! Ga zo door!",
    "🚀 Je vliegt door de vragen heen!"
  ],
  perfect: [
    "🎭 Parfait! 100% correct!",
    "💎 Perfecte score! Ongelofelijk!",
    "🌈 Absoluut perfect! Chapeau!",
    "✨ Flawless! Je bent geweldig!"
  ]
};

const frenchEmojis = ['🇫🇷', '🥐', '🗼', '🎨', '🧀', '🍷', '🌹', '⚜️'];
const colorPalette = ['#0055A4', '#FF6B35', '#10B981', '#EF4444', '#FFD700', '#E6E6FA', '#F0E68C'];

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  isActive,
  duration = 3000,
  particleCount = 50,
  onComplete,
  trigger = 'achievement',
  intensity = 'medium',
  showMessage = true,
  customMessage
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [message, setMessage] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);

  // Adjust particle count based on intensity
  const actualParticleCount = {
    low: Math.floor(particleCount * 0.5),
    medium: particleCount,
    high: Math.floor(particleCount * 1.5)
  }[intensity];

  // Generate random message
  useEffect(() => {
    if (isActive && showMessage) {
      const messages = celebrationMessages[trigger];
      const randomMessage = customMessage || messages[Math.floor(Math.random() * messages.length)];
      setMessage(randomMessage);
    }
  }, [isActive, trigger, customMessage, showMessage]);

  // Create particle
  const createParticle = (id: number): ConfettiParticle => {
    const isEmoji = Math.random() < 0.3; // 30% chance for emoji
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;

    return {
      id,
      x: Math.random() * containerWidth,
      y: -10,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 2 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      size: Math.random() * 8 + 4,
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      emoji: isEmoji ? frenchEmojis[Math.floor(Math.random() * frenchEmojis.length)] : undefined,
      life: 0,
      maxLife: duration / 16 // assuming 60fps
    };
  };

  // Initialize confetti
  useEffect(() => {
    if (isActive) {
      setShowCelebration(true);
      startTimeRef.current = Date.now();
      
      const newParticles = Array.from({ length: actualParticleCount }, (_, i) => 
        createParticle(i)
      );
      setParticles(newParticles);

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        
        if (elapsed >= duration) {
          setParticles([]);
          setShowCelebration(false);
          onComplete?.();
          return;
        }

        setParticles(currentParticles => 
          currentParticles
            .map(particle => ({
              ...particle,
              x: particle.x + particle.vx,
              y: particle.y + particle.vy,
              vy: particle.vy + 0.3, // gravity
              rotation: particle.rotation + particle.rotationSpeed,
              life: particle.life + 1
            }))
            .filter(particle => 
              particle.life < particle.maxLife &&
              particle.y < (containerRef.current?.offsetHeight || window.innerHeight) + 50
            )
        );

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      setShowCelebration(false);
      setParticles([]);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, duration, actualParticleCount, onComplete]);

  if (!showCelebration) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      {/* CSS for animations */}
      <style>{`
        @keyframes messageGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
          50% { text-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6); }
        }
        
        @keyframes messageSlideDown {
          0% { transform: translateY(-100px) scale(0.8); opacity: 0; }
          20% { transform: translateY(20px) scale(1.1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        @keyframes confettiShimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Confetti Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg)`,
            fontSize: particle.emoji ? `${particle.size * 1.5}px` : undefined,
            width: particle.emoji ? undefined : `${particle.size}px`,
            height: particle.emoji ? undefined : `${particle.size}px`,
            backgroundColor: particle.emoji ? undefined : particle.color,
            borderRadius: particle.emoji ? undefined : '50%',
            animation: 'confettiShimmer 2s ease-in-out infinite',
            opacity: Math.max(0, 1 - (particle.life / particle.maxLife))
          }}
        >
          {particle.emoji || ''}
        </div>
      ))}

      {/* Celebration Message */}
      {showMessage && message && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div 
            className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-2xl border-4 border-yellow-300"
            style={{
              animation: 'messageSlideDown 0.8s ease-out'
            }}
          >
            <h2 
              className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-center"
              style={{
                animation: 'messageGlow 2s ease-in-out infinite'
              }}
            >
              {message}
            </h2>
          </div>
        </div>
      )}

      {/* Burst effect overlay */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-yellow-200 via-transparent to-transparent opacity-20 animate-ping"
        style={{
          animationDuration: '1s',
          animationIterationCount: '3'
        }}
      />

      {/* Sparkle effects */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute text-yellow-400 animate-ping"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
            fontSize: `${Math.random() * 20 + 10}px`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 2 + 1}s`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

// Predefined celebration variants
export const AchievementConfetti: React.FC<Omit<ConfettiCelebrationProps, 'trigger'>> = (props) => (
  <ConfettiCelebration {...props} trigger="achievement" intensity="high" />
);

export const SessionCompleteConfetti: React.FC<Omit<ConfettiCelebrationProps, 'trigger'>> = (props) => (
  <ConfettiCelebration {...props} trigger="session" intensity="medium" />
);

export const StreakConfetti: React.FC<Omit<ConfettiCelebrationProps, 'trigger'>> = (props) => (
  <ConfettiCelebration {...props} trigger="streak" intensity="medium" />
);

export const PerfectScoreConfetti: React.FC<Omit<ConfettiCelebrationProps, 'trigger'>> = (props) => (
  <ConfettiCelebration {...props} trigger="perfect" intensity="high" duration={4000} />
);

// Hook for easy confetti triggering
export const useConfetti = () => {
  const [isActive, setIsActive] = useState(false);

  const triggerConfetti = (_type: ConfettiCelebrationProps['trigger'] = 'achievement') => {
    setIsActive(true);
  };

  const stopConfetti = () => {
    setIsActive(false);
  };

  return {
    isActive,
    triggerConfetti,
    stopConfetti,
    ConfettiComponent: (props: Partial<ConfettiCelebrationProps>) => (
      <ConfettiCelebration 
        {...props} 
        isActive={isActive} 
        onComplete={() => {
          setIsActive(false);
          props.onComplete?.();
        }}
      />
    )
  };
};