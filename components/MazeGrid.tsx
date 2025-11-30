import React from 'react';
import { Grid, Point, AlgorithmType } from '../types';

interface MazeGridProps {
  grid: Grid;
  visited: Set<string>;
  path: Point[];
  currentFrontier: Point[];
  type: AlgorithmType;
  title: string;
}

const MazeGrid: React.FC<MazeGridProps> = ({ grid, visited, path, currentFrontier, type, title }) => {
  const isClassic = type === AlgorithmType.CLASSIC;
  
  // Theme configuration based on algorithm type
  const theme = {
    visited: isClassic ? 'bg-amber-500/30' : 'bg-cyan-500/30',
    frontier: isClassic ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]',
    path: isClassic ? 'bg-white' : 'bg-white shadow-[0_0_10px_white]',
    border: isClassic ? 'border-amber-500/50' : 'border-cyan-500/50',
    text: isClassic ? 'text-amber-500' : 'text-cyan-400',
    icon: isClassic ? '🤖' : '⚛️',
  };

  const pathSet = new Set(path.map(p => `${p.x},${p.y}`));
  const frontierSet = new Set(currentFrontier.map(p => `${p.x},${p.y}`));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`flex items-center gap-2 text-xl font-bold ${theme.text}`}>
        <span className="text-2xl">{theme.icon}</span>
        <h2>{title}</h2>
      </div>
      
      <div 
        className={`relative p-1 rounded-lg bg-slate-900 border-2 ${theme.border} shadow-2xl transition-shadow duration-500`}
        style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
            gap: '1px',
        }}
      >
        {grid.map((row, y) => (
          row.map((cell, x) => {
            const key = `${x},${y}`;
            const isWall = cell.type === 'wall';
            const isStart = cell.type === 'start';
            const isEnd = cell.type === 'end';
            
            const isVisited = visited.has(key);
            const isFrontier = frontierSet.has(key);
            const isPath = pathSet.has(key);

            let cellClass = 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 transition-colors duration-300 rounded-[1px]';

            if (isWall) {
              cellClass += ' bg-slate-800';
            } else if (isStart) {
              cellClass += ' bg-green-500 z-10';
            } else if (isEnd) {
              cellClass += ' bg-red-600 z-10';
            } else if (isPath) {
              cellClass += ` ${theme.path} z-20 animate-pulse`;
            } else if (isFrontier) {
              cellClass += ` ${theme.frontier} z-10 scale-110`;
            } else if (isVisited) {
              cellClass += ` ${theme.visited}`;
            } else {
              cellClass += ' bg-slate-950'; // Default path color
            }

            return (
              <div 
                key={key} 
                className={cellClass}
                title={`(${x},${y})`}
              />
            );
          })
        ))}
      </div>
    </div>
  );
};

export default MazeGrid;