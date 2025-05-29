import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { FrenchMascot } from './FrenchMascot';
import { AnimatedIcon } from './AnimatedIcon';
import { ConfettiCelebration } from './ConfettiCelebration';

interface WelcomeScreenProps {
  onUserCreate: (name: string) => void;
}

function WelcomeScreen({ onUserCreate }: WelcomeScreenProps) {
  const { theme, frenchElements } = useTheme();
  const [name, setName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Welcome animation
    const timer = setTimeout(() => setShowConfetti(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsCreating(true);
      setShowConfetti(true);
      
      // Add a delay for the celebration effect
      setTimeout(() => {
        onUserCreate(name.trim());
      }, 2000);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${theme.colors.primary}, #0077BE, ${theme.colors.secondary})`
      }}
    >
      {/* Background French Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ background: frenchElements.patterns.stripes }}
      />
      
      {/* Floating French Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float text-6xl opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {Object.values(frenchElements.icons)[i % Object.values(frenchElements.icons).length]}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 relative z-10 backdrop-blur-sm bg-opacity-95">
        {/* Header with Logo and Mascot */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <AnimatedIcon 
              icon="eiffelTower" 
              animation="float" 
              size="xxl" 
              className="mr-4"
            />
            <div>
              <h1 className="text-5xl font-bold mb-2" style={{ color: theme.colors.primary }}>
                RockLingo
              </h1>
              <div className="flex items-center justify-center gap-2">
                <AnimatedIcon icon="flag" size="md" />
                <span className="text-xl font-medium text-gray-600">
                  Français pour tous!
                </span>
                <AnimatedIcon icon="flag" size="md" />
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 text-lg mb-4">
            Leer Frans op een leuke en interactieve manier!
          </p>
          
          {/* French Mascot Welcome */}
          <div className="flex justify-center">
            <FrenchMascot 
              size="lg" 
              mood="excited" 
              message="Salut! Klaar om Frans te leren?"
              showMessage={true}
            />
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <AnimatedIcon icon="book" animation="bounce" size="lg" className="mb-2" />
            <p className="text-xs text-gray-600">Interactieve Lessen</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <AnimatedIcon icon="art" animation="pulse" size="lg" className="mb-2" />
            <p className="text-xs text-gray-600">Voortgang Bijhouden</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <AnimatedIcon icon="star" animation="glow" size="lg" className="mb-2" />
            <p className="text-xs text-gray-600">Leuke Achievements</p>
          </div>
        </div>

        {/* Name Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              <AnimatedIcon icon="rose" size="sm" className="mr-1" />
              Wat is je naam?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              style={{ 
                borderColor: name ? theme.colors.primary : undefined,
                boxShadow: name ? `0 0 0 3px ${theme.colors.primary}20` : undefined 
              }}
              placeholder="Voer je naam in..."
              autoFocus
              required
              disabled={isCreating}
            />
          </div>

          <button
            type="submit"
            disabled={isCreating || !name.trim()}
            className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{ 
              backgroundColor: theme.colors.primary,
              color: theme.colors.white
            }}
          >
            {isCreating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Voorbereiden...
              </div>
            ) : (
              <>
                <AnimatedIcon icon="croissant" trigger="hover" size="sm" className="mr-2" />
                Start je avontuur!
                <AnimatedIcon icon="eiffelTower" trigger="hover" size="sm" className="ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Features List */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-medium text-gray-800 mb-3 text-center">
            <AnimatedIcon icon="star" size="sm" className="mr-1" />
            Wat kun je verwachten?
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center">
              <AnimatedIcon icon="baguette" size="sm" className="mr-2" />
              <span>Franse woordenschat en grammatica</span>
            </div>
            <div className="flex items-center">
              <AnimatedIcon icon="cheese" size="sm" className="mr-2" />
              <span>Verschillende oefentypen</span>
            </div>
            <div className="flex items-center">
              <AnimatedIcon icon="wine" size="sm" className="mr-2" />
              <span>Persoonlijke voortgang bijhouden</span>
            </div>
            <div className="flex items-center">
              <AnimatedIcon icon="art" size="sm" className="mr-2" />
              <span>Leuke Franse cultuur elementen</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center">
            <AnimatedIcon icon="flag" size="sm" className="mr-1" />
            Speciaal voor Nederlandse studenten
            <AnimatedIcon icon="flag" size="sm" className="ml-1" />
          </p>
        </div>
      </div>

      {/* Welcome Confetti */}
      <ConfettiCelebration
        isActive={showConfetti}
        trigger="achievement"
        customMessage={isCreating ? `Bienvenue ${name}! 🎉` : "Welkom bij RockLingo! 🇫🇷"}
        onComplete={() => setShowConfetti(false)}
        intensity="high"
        duration={isCreating ? 2000 : 3000}
      />

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default WelcomeScreen;