import { Grid, Point, GridCell } from '../types';

export const MAZE_SIZE = 29; // Must be odd for recursive backtracker

// Helper to create empty grid
export const createEmptyGrid = (size: number): Grid => {
  const grid: Grid = [];
  for (let y = 0; y < size; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < size; x++) {
      row.push({ x, y, type: 'wall' });
    }
    grid.push(row);
  }
  return grid;
};

// Recursive Backtracker for Maze Generation
export const generateMaze = (width: number, height: number): Grid => {
  const grid = createEmptyGrid(width);
  const stack: Point[] = [];
  
  // Start at 1,1
  const start: Point = { x: 1, y: 1 };
  grid[start.y][start.x].type = 'path';
  stack.push(start);

  const directions = [
    { x: 0, y: -2 }, // North
    { x: 2, y: 0 },  // East
    { x: 0, y: 2 },  // South
    { x: -2, y: 0 }  // West
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    
    // Shuffle directions
    const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
    let moved = false;

    for (const dir of shuffledDirs) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;

      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && grid[ny][nx].type === 'wall') {
        grid[ny][nx].type = 'path';
        grid[current.y + dir.y / 2][current.x + dir.x / 2].type = 'path'; // Carve wall between
        stack.push({ x: nx, y: ny });
        moved = true;
        break;
      }
    }

    if (!moved) {
      stack.pop();
    }
  }

  // Set Start and End
  grid[1][1].type = 'start';
  grid[height - 2][width - 2].type = 'end';

  return grid;
};

// Backtrace path from end to start using parent map
export const reconstructPath = (parentMap: Map<string, string>, end: Point): Point[] => {
  const path: Point[] = [];
  let currKey = `${end.x},${end.y}`;
  
  while (parentMap.has(currKey)) {
    const [x, y] = currKey.split(',').map(Number);
    path.unshift({ x, y });
    currKey = parentMap.get(currKey)!;
  }
  // Add start
  if (path.length > 0) {
      const [x, y] = currKey.split(',').map(Number);
      path.unshift({x, y});
  }
  
  return path;
};
