import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Question, Settings } from '../types';
import { QuestionBankService } from '../services/questionBank';
import { StorageService } from '../services/storage';
import { SessionManager, GameSession } from '../services/sessionManager';
import { SessionTimer } from './SessionTimer';
import { ScoreTracker } from './ScoreTracker';
import { SessionSummary } from './SessionSummary';
import {
  MultipleChoice,
  TranslationInput,
  ReverseTranslation,
  SpellingChallenge,
  MatchingGame,
} from './QuestionTypes';

interface SessionViewProps {
  user: User;
}

type QuestionTypeKey = 'multipleChoice' | 'translation' | 'spelling' | 'matching';

function SessionView({ }: SessionViewProps) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [settings] = useState<Settings>(StorageService.getSettings());
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completedSession, setCompletedSession] = useState<GameSession | null>(null);
  const [lastQuestionPoints, setLastQuestionPoints] = useState<number>(0);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const allQuestions = await QuestionBankService.getRandomQuestions(50); // More questions for timed session
      setQuestions(allQuestions);
      
      // Start session with timer
      const duration = settings.sessionDuration * 60; // Convert minutes to seconds
      const categories = ['all']; // Could be made configurable
      const session = SessionManager.startSession(duration, categories);
      setGameSession(session);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setIsLoading(false);
    }
  };

  const getQuestionType = (index: number): QuestionTypeKey => {
    const types: QuestionTypeKey[] = [];
    if (settings.questionTypes.multipleChoice) types.push('multipleChoice');
    if (settings.questionTypes.translation) types.push('translation');
    if (settings.questionTypes.spelling) types.push('spelling');
    if (settings.questionTypes.matching) types.push('matching');
    
    if (types.length === 0) return 'multipleChoice'; // Fallback
    
    // Rotate through available types
    return types[index % types.length];
  };

  const handleAnswer = (correct: boolean, _timeSpent: number, attemptCount: number = 1) => {
    if (!gameSession) return;
    
    const question = questions[currentQuestionIndex];
    
    // Record attempt and get points
    const points = SessionManager.recordAttempt(
      question.id,
      correct,
      attemptCount,
      question.difficulty || 1
    );
    
    setLastQuestionPoints(points);
    
    // Update progress tracking
    StorageService.updateProgress(question.id, correct);
    
    // Move to next question after a brief delay to show points
    setTimeout(() => {
      setLastQuestionPoints(0);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        SessionManager.startQuestion(); // Start timing next question
      } else {
        endSession();
      }
    }, 1500);
  };

  const handleSkip = () => {
    handleAnswer(false, 0);
  };

  const endSession = () => {
    const session = SessionManager.endSession();
    if (session) {
      setCompletedSession(session);
      setShowSummary(true);
    }
  };

  const handleTimeUp = () => {
    endSession();
  };

  const handleTogglePause = () => {
    if (isPaused) {
      SessionManager.resumeSession();
    } else {
      SessionManager.pauseSession();
    }
    setIsPaused(!isPaused);
  };

  const handleStartNewSession = () => {
    setShowSummary(false);
    setCompletedSession(null);
    setCurrentQuestionIndex(0);
    loadQuestions(); // Restart with new questions
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg text-gray-600">Vragen laden...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-french-blue mb-4">Geen vragen beschikbaar</h1>
            <p className="text-gray-600 mb-8">
              Er zijn geen vragen geladen. Probeer het later opnieuw.
            </p>
            <Link
              to="/menu"
              className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Terug naar menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show session summary if session is completed
  if (showSummary && completedSession) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <SessionSummary
            session={completedSession}
            onStartNew={handleStartNewSession}
            onBackToMenu={handleBackToMenu}
          />
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-lg text-gray-600">Sessie starten...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionType = getQuestionType(currentQuestionIndex);
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentStreak = SessionManager.getCurrentStreak();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Timer */}
        <div className="mb-6">
          <SessionTimer
            duration={gameSession.duration}
            onTimeUp={handleTimeUp}
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
          />
        </div>

        {/* Score Tracker */}
        <div className="mb-6">
          <ScoreTracker
            score={gameSession.score}
            streak={currentStreak}
            questionsAnswered={gameSession.questionsAnswered}
            correctAnswers={gameSession.correctAnswers}
            lastQuestionPoints={lastQuestionPoints}
          />
        </div>

        {/* Question Progress */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Vraag {currentQuestionIndex + 1} van {questions.length}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% voltooid</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question component */}
        <div className="mb-6">
          {questionType === 'multipleChoice' && (
            <MultipleChoice
              question={currentQuestion}
              onAnswer={handleAnswer}
              onSkip={handleSkip}
            />
          )}
          {questionType === 'translation' && (
            Math.random() > 0.5 ? (
              <TranslationInput
                question={currentQuestion}
                onAnswer={handleAnswer}
                onSkip={handleSkip}
              />
            ) : (
              <ReverseTranslation
                question={currentQuestion}
                onAnswer={handleAnswer}
                onSkip={handleSkip}
              />
            )
          )}
          {questionType === 'spelling' && (
            <SpellingChallenge
              question={currentQuestion}
              onAnswer={handleAnswer}
              onSkip={handleSkip}
            />
          )}
          {questionType === 'matching' && (
            <MatchingGame
              question={currentQuestion}
              onAnswer={handleAnswer}
              onSkip={handleSkip}
            />
          )}
        </div>

        {/* Exit button */}
        <div className="text-center">
          <button
            onClick={endSession}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Sessie beëindigen
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionView;