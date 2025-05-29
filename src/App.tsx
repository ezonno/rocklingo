import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import MainMenu from './components/MainMenu';
import SessionView from './components/SessionView';
import ProgressView from './components/ProgressView';
import SettingsView from './components/SettingsView';
import { ThemeProvider } from './components/ThemeProvider';
import { StorageService } from './services/storage';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = StorageService.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleUserCreate = (name: string) => {
    const newUser: User = {
      name,
      createdAt: Date.now(),
      totalSessions: 0,
      totalPoints: 0,
    };
    setUser(newUser);
    StorageService.setUser(newUser);
  };

  return (
    <ThemeProvider>
      <Router basename="/rocklingo">
        <div className="min-h-screen transition-all duration-300">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/menu" /> : <WelcomeScreen onUserCreate={handleUserCreate} />} 
            />
            <Route 
              path="/menu" 
              element={user ? <MainMenu user={user} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/session" 
              element={user ? <SessionView user={user} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/progress" 
              element={user ? <ProgressView user={user} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/settings" 
              element={user ? <SettingsView /> : <Navigate to="/" />} 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;