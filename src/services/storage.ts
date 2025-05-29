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

  static addSession(session: Session): void {
    const sessions = this.getSessions();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
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

  static updateProgress(questionId: string, correct: boolean): void {
    const progress = this.getProgress();
    const current = progress[questionId] || { mastered: false, attempts: 0, lastSeen: 0 };
    
    progress[questionId] = {
      mastered: current.mastered || (correct && current.attempts >= 2),
      attempts: current.attempts + 1,
      lastSeen: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  }

  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}