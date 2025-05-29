import { Link } from 'react-router-dom';
import { User } from '../types';
import { useTheme } from './ThemeProvider';
import { FrenchMascot } from './FrenchMascot';
import { AnimatedIcon } from './AnimatedIcon';
import { ConfettiCelebration } from './ConfettiCelebration';
import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';

interface MainMenuProps {
  user: User;
}

function MainMenu({ user }: MainMenuProps) {
  const { theme, frenchElements } = useTheme();
  const [showWelcomeConfetti, setShowWelcomeConfetti] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Calculate streak
    const sessions = StorageService.getSessions();
    const today = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    // Check consecutive days with sessions
    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasSessionThisDay = sessions.some(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });
      
      if (hasSessionThisDay) {
        currentStreak++;
        checkDate.setTime(checkDate.getTime() - dayInMs);
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
    
    // Show welcome confetti for returning users with achievements
    if (user.totalPoints > 0 && !sessionStorage.getItem('welcomeShown')) {
      setShowWelcomeConfetti(true);
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }, [user]);

  const menuItems = [
    {
      title: 'Start Sessie',
      description: 'Begin een nieuwe oefensessie',
      icon: 'book',
      frenchIcon: frenchElements.icons.book,
      link: '/session',
      gradient: `linear-gradient(135deg, ${theme.colors.primary}, #0077BE)`,
      animation: 'bounce'
    },
    {
      title: 'Voortgang',
      description: 'Bekijk je statistieken',
      icon: 'art',
      frenchIcon: frenchElements.icons.art,
      link: '/progress',
      gradient: `linear-gradient(135deg, ${theme.colors.success}, #059669)`,
      animation: 'pulse'
    },
    {
      title: 'Instellingen',
      description: 'Pas je voorkeuren aan',
      icon: 'star',
      frenchIcon: frenchElements.icons.star,
      link: '/settings',
      gradient: `linear-gradient(135deg, ${theme.colors.gray[600]}, ${theme.colors.gray[700]})`,
      animation: 'float'
    },
  ];

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Mascot */}
        <header className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <FrenchMascot 
              size="lg" 
              mood="happy" 
              message={`Bonjour ${user.name}! Klaar voor een nieuwe les?`}
              className="mr-6"
            />
            <div className="text-left">
              <h1 className="text-4xl font-bold mb-2" style={{ color: theme.colors.primary }}>
                <AnimatedIcon icon="flag" size="lg" trigger="auto" className="mr-3" />
                Bonjour, {user.name}!
              </h1>
              <p className="text-gray-600 text-lg flex items-center">
                <AnimatedIcon icon="eiffelTower" size="sm" className="mr-2" />
                Wat wil je vandaag doen?
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <AnimatedIcon icon="star" animation="glow" size="lg" />
                <div className="text-left">
                  <p className="text-sm text-gray-500">Totaal Punten</p>
                  <p className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
                    {user.totalPoints}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <AnimatedIcon icon="book" animation="pulse" size="lg" />
                <div className="text-left">
                  <p className="text-sm text-gray-500">Sessies</p>
                  <p className="text-2xl font-bold" style={{ color: theme.colors.success }}>
                    {user.totalSessions}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <AnimatedIcon icon="rose" animation="float" size="lg" />
                <div className="text-left">
                  <p className="text-sm text-gray-500">Streak</p>
                  <p className="text-2xl font-bold" style={{ color: theme.colors.secondary }}>
                    {streak} {streak === 1 ? 'dag' : 'dagen'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {menuItems.map((item, index) => (
            <Link
              key={item.link}
              to={item.link}
              className="group relative overflow-hidden text-white rounded-2xl p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl block"
              style={{ 
                background: item.gradient,
                animationDelay: `${index * 150}ms`
              }}
            >
              {/* Background Pattern */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{ background: frenchElements.patterns.stripes }}
              />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="mb-4">
                  <AnimatedIcon 
                    icon={item.icon as any}
                    animation={item.animation as any}
                    size="xxl"
                    trigger="hover"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-2 group-hover:scale-110 transition-transform duration-200">
                  {item.title}
                </h2>
                <p className="text-white/80 group-hover:text-white transition-colors duration-200">
                  {item.description}
                </p>
              </div>
              
              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </Link>
          ))}
        </div>

        {/* Achievement Section */}
        {user.totalPoints > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <AnimatedIcon icon="flag" animation="wiggle" size="xl" />
              <div className="text-left">
                <p className="text-sm text-gray-500 flex items-center">
                  <AnimatedIcon icon="eiffelTower" size="sm" className="mr-1" />
                  Niveau: Apprenant
                </p>
                <p className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
                  Très bien!
                </p>
                <p className="text-sm text-gray-600">Je maakt geweldige voortgang!</p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Confetti */}
        <ConfettiCelebration
          isActive={showWelcomeConfetti}
          trigger="session"
          customMessage="Welkom terug! Tijd om te leren! 🎓"
          onComplete={() => setShowWelcomeConfetti(false)}
          intensity="medium"
        />
      </div>
    </div>
  );
}

export default MainMenu;