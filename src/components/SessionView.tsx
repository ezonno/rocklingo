import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Question, QuestionAttempt, Session, Settings } from '../types';
import { QuestionBankService } from '../services/questionBank';
import { StorageService } from '../services/storage';
import { ScoringService } from '../services/scoring';
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

function SessionView({ user }: SessionViewProps) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questionAttempts, setQuestionAttempts] = useState<QuestionAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime] = useState(Date.now());
  const [settings] = useState<Settings>(StorageService.getSettings());

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const allQuestions = await QuestionBankService.getRandomQuestions(20);
      setQuestions(allQuestions);
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

  const handleAnswer = (correct: boolean, timeSpent: number) => {
    const question = questions[currentQuestionIndex];
    const questionType = getQuestionType(currentQuestionIndex);
    
    const scoreResult = ScoringService.calculateScore(
      correct,
      timeSpent,
      question.difficulty || 1,
      questionType
    );
    
    setSessionScore(sessionScore + scoreResult.totalPoints);
    if (correct) setCorrectAnswers(correctAnswers + 1);
    
    const attempt: QuestionAttempt = {
      questionId: question.id,
      correct,
      timeSpent,
      attemptCount: 1,
    };
    setQuestionAttempts([...questionAttempts, attempt]);
    
    // Update progress
    StorageService.updateProgress(question.id, correct);
    
    // Move to next question or end session
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      endSession();
    }
  };

  const handleSkip = () => {
    handleAnswer(false, 0);
  };

  const endSession = () => {
    const session: Session = {
      id: Date.now().toString(),
      date: sessionStartTime,
      duration: Math.floor((Date.now() - sessionStartTime) / 1000),
      score: sessionScore,
      questionsAnswered: questionAttempts.length,
      correctAnswers,
    };
    
    StorageService.addSession(session);
    
    // Update user stats
    const updatedUser = {
      ...user,
      totalSessions: user.totalSessions + 1,
      totalPoints: user.totalPoints + sessionScore,
    };
    StorageService.setUser(updatedUser);
    
    // Navigate to session summary
    navigate('/progress', { state: { lastSession: session } });
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

  const currentQuestion = questions[currentQuestionIndex];
  const questionType = getQuestionType(currentQuestionIndex);
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-french-blue">Oefensessie</h1>
              <p className="text-gray-600">Vraag {currentQuestionIndex + 1} van {questions.length}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{sessionScore} punten</p>
              <p className="text-sm text-gray-500">{correctAnswers} correct</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Streak indicator */}
          {ScoringService.getCurrentStreak() > 0 && (
            <div className="mt-2 text-center">
              <span className="text-sm text-orange-600 font-medium">
                🔥 {ScoringService.getCurrentStreak()} op rij!
              </span>
            </div>
          )}
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