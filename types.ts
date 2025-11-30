export type CellType = 'wall' | 'path' | 'start' | 'end';

export interface Point {
  x: number;
  y: number;
}

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
}

export type Grid = GridCell[][];

export interface SolverState {
  visited: Set<string>; // Set of "x,y" strings
  currentFrontier: Point[]; // Currently active cells being processed
  path: Point[]; // The final solution path
  steps: number; // Number of operations/ticks
  isFinished: boolean;
  name: string;
}

export enum AlgorithmType {
  CLASSIC = 'CLASSIC',
  QUANTUM = 'QUANTUM'
}