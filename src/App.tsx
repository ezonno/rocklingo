import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import MainMenu from './components/MainMenu';
import SessionView from './components/SessionView';
import ProgressView from './components/ProgressView';
import SettingsView from './components/SettingsView';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <Router basename="/rocklingo">
      <div className="min-h-screen bg-gray-50">
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
  );
}

export default App;