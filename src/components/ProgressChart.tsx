import React from 'react';
import { Session } from '../types';

interface ProgressChartProps {
  sessions: Session[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Voortgang</h3>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>Start met oefenen om je voortgang te zien!</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for chart
  const sortedSessions = [...sessions].sort((a, b) => a.date - b.date);
  const maxScore = Math.max(...sortedSessions.map(s => s.score), 100);
  const chartHeight = 200;
  const chartWidth = 400;
  const padding = 40;

  // Create SVG points for the line chart
  const points = sortedSessions.map((session, index) => {
    const x = padding + (index / Math.max(sortedSessions.length - 1, 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - (session.score / maxScore) * (chartHeight - 2 * padding);
    return { x, y, score: session.score, date: session.date };
  });

  const pathData = points.length > 1 
    ? `M ${points[0].x} ${points[0].y} ` + 
      points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Voortgang</h3>
      
      <div className="relative">
        <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map(value => {
            const y = chartHeight - padding - (value / Math.max(maxScore, 100)) * (chartHeight - 2 * padding);
            return (
              <g key={value}>
                <text 
                  x={padding - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="text-xs fill-gray-500"
                >
                  {value}
                </text>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={chartWidth - padding} 
                  y2={y} 
                  stroke="#e5e7eb" 
                  strokeWidth="1"
                />
              </g>
            );
          })}
          
          {/* Chart line */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="#0055A4"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#0055A4"
                stroke="#ffffff"
                strokeWidth="2"
                className="hover:r-6 transition-all cursor-pointer"
              />
              {/* Tooltip on hover - simplified for now */}
              <title>{`Sessie ${index + 1}: ${point.score} punten`}</title>
            </g>
          ))}
        </svg>
        
        {/* X-axis label */}
        <div className="mt-2 text-center text-xs text-gray-500">
          Sessies ({sessions.length} totaal)
        </div>
      </div>
      
      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length) : 0}
          </div>
          <div className="text-gray-600">Gemiddeld</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {sessions.length > 0 ? Math.max(...sessions.map(s => s.score)) : 0}
          </div>
          <div className="text-gray-600">Hoogste</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">
            {sessions.length > 0 ? sessions[sessions.length - 1].score : 0}
          </div>
          <div className="text-gray-600">Laatste</div>
        </div>
      </div>
    </div>
  );
};