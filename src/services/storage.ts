import { User, Session, Settings, QuestionBank } from '../types';

const STORAGE_KEYS = {
  USER: 'user',
  SESSIONS: 'sessions',
  SETTINGS: 'settings',
  CUSTOM_QUESTIONS: 'custom_questions',
  PROGRESS: 'question_progress',
  ACHIEVEMENTS: 'achievements',
} as const;

export class StorageService {
  static getUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getSessions(): Session[] {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  }

  static setSessions(sessions: Session[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  static addSession(session: Session): void {
    const sessions = this.getSessions();
    sessions.push(session);
    this.setSessions(sessions);
  }

  static getSettings(): Settings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      sessionDuration: 15,
      questionTypes: {
        multipleChoice: true,
        translation: true,
        spelling: true,
        matching: true,
      },
      difficulty: 'medium',
      accentKeypad: {
        enabled: true,
        defaultVisible: 'auto',
        position: 'auto',
      },
    };
  }

  static setSettings(settings: Settings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static getCustomQuestions(): QuestionBank | null {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    return data ? JSON.parse(data) : null;
  }

  static setCustomQuestions(questions: QuestionBank): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(questions));
  }

  static getProgress(): Record<string, { mastered: boolean; attempts: number; lastSeen: number }> {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : {};
  }

  static getQuestionProgress(): Record<string, { correct: number; total: number; category?: string }> {
    const data = localStorage.getItem('question_detailed_progress');
    return data ? JSON.parse(data) : {};
  }

  static updateProgress(questionId: string, correct: boolean): void {
    const progress = this.getProgress();
    const current = progress[questionId] || { mastered: false, attempts: 0, lastSeen: 0 };
    
    progress[questionId] = {
      mastered: current.mastered || (correct && current.attempts >= 2),
      attempts: current.attempts + 1,
      lastSeen: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    
    // Also update detailed progress for Phase 4 analytics
    this.updateQuestionProgress(questionId, correct);
  }

  static updateQuestionProgress(questionId: string, correct: boolean, category?: string): void {
    const detailedProgress = this.getQuestionProgress();
    const current = detailedProgress[questionId] || { correct: 0, total: 0, category };
    
    detailedProgress[questionId] = {
      correct: current.correct + (correct ? 1 : 0),
      total: current.total + 1,
      category: category || current.category
    };

    localStorage.setItem('question_detailed_progress', JSON.stringify(detailedProgress));
  }

  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}