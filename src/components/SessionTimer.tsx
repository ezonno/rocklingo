import React, { useState, useEffect } from 'react';

interface SessionTimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  duration,
  onTimeUp,
  isPaused,
  onTogglePause
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeLeft, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((duration - timeLeft) / duration) * 100;
  const isLowTime = timeLeft <= 60; // Last minute warning

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
      {/* Progress Bar */}
      <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            isLowTime ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Time Display */}
      <div className={`text-xl font-bold min-w-[4rem] ${
        isLowTime ? 'text-red-500' : 'text-gray-700'
      }`}>
        {formatTime(timeLeft)}
      </div>

      {/* Pause/Resume Button */}
      <button
        onClick={onTogglePause}
        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
          isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'
        }`}
      >
        {isPaused ? '▶️ Hervat' : '⏸️ Pauze'}
      </button>

      {/* Visual Indicator */}
      {isLowTime && (
        <div className="animate-pulse">
          ⏰
        </div>
      )}
    </div>
  );
};