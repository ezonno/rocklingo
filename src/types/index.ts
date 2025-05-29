export interface User {
  name: string;
  createdAt: number;
  totalSessions: number;
  totalPoints: number;
}

export interface Session {
  id: string;
  date: number;
  duration: number;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export interface Settings {
  sessionDuration: number; // minutes
  questionTypes: {
    multipleChoice: boolean;
    translation: boolean;
    spelling: boolean;
    matching: boolean;
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Question {
  id: string;
  dutch: string;
  french: string;
  gender?: 'm' | 'f';
  category: string;
  difficulty: number;
  image?: string;
  context?: string;
  audioUrl?: string;
}

export interface QuestionAttempt {
  questionId: string;
  correct: boolean;
  timeSpent: number;
  attemptCount: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  questions: Question[];
}

export interface QuestionBank {
  version: string;
  categories: Category[];
}