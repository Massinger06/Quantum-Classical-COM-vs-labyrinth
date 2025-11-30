import React, { useState, useEffect, useCallback, useRef } from 'react';
import MazeGrid from './components/MazeGrid';
import StatsPanel from './components/StatsPanel';
import { generateMaze, reconstructPath, MAZE_SIZE } from './utils/mazeGenerator';
import { Grid, Point, AlgorithmType, SolverState } from './types';
import { Play, RotateCcw, Pause } from 'lucide-react';

const INITIAL_STATE: SolverState = {
  visited: new Set(),
  currentFrontier: [],
  path: [],
  steps: 0,
  isFinished: false,
  name: '',
};

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Solvers State
  const [classicState, setClassicState] = useState<SolverState>({ ...INITIAL_STATE, name: 'Classic' });
  const [quantumState, setQuantumState] = useState<SolverState>({ ...INITIAL_STATE, name: 'Quantum' });

  // Refs for simulation data to avoid closure staleness in intervals
  const classicRef = useRef<{
    queue: Point[];
    visited: Set<string>;
    parentMap: Map<string, string>; // child -> parent
    finished: boolean;
  }>({ queue: [], visited: new Set(), parentMap: new Map(), finished: false });

  const quantumRef = useRef<{
    frontier: Point[]; // Current active wave
    visited: Set<string>;
    parentMap: Map<string, string>;
    finished: boolean;
  }>({ frontier: [], visited: new Set(), parentMap: new Map(), finished: false });

  // Initialize Maze
  const initMaze = useCallback(() => {
    const newGrid = generateMaze(MAZE_SIZE, MAZE_SIZE);
    setGrid(newGrid);
    resetSolvers();
  }, []);

  const resetSolvers = () => {
    setIsRunning(false);
    setIsPaused(false);
    setClassicState({ ...INITIAL_STATE, name: 'Classic' });
    setQuantumState({ ...INITIAL_STATE, name: 'Quantum' });

    // Reset Refs
    classicRef.current = { queue: [], visited: new Set(), parentMap: new Map(), finished: false };
    quantumRef.current = { frontier: [], visited: new Set(), parentMap: new Map(), finished: false };
  };

  useEffect(() => {
    initMaze();
  }, [initMaze]);

  const startSimulation = () => {
    if (isRunning && !isPaused) return; // Already running
    
    // Find Start and End
    const startPoint: Point = { x: 1, y: 1 };
    
    // Initialize Classic Queue if starting fresh
    if (!isRunning && !isPaused) {
      classicRef.current.queue = [startPoint];
      classicRef.current.visited.add(`${startPoint.x},${startPoint.y}`);

      // Initialize Quantum Frontier if starting fresh
      quantumRef.current.frontier = [startPoint];
      quantumRef.current.visited.add(`${startPoint.x},${startPoint.y}`);
    }

    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseSimulation = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const resetSimulation = () => {
    initMaze();
  };

  // Simulation Loop
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      // --- CLASSIC UPDATE (Sequential DFS visualization) ---
      // We simulate a sequential search. Process ONE node per tick.
      // Using pop() makes it a Stack (DFS), creating a "snake" like movement
      // that visually contrasts with the Quantum "wave".
      if (!classicRef.current.finished && classicRef.current.queue.length > 0) {
        // Pop ONE element (DFS)
        const current = classicRef.current.queue.pop()!;
        const endPoint = { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 };

        // Check if reached end
        if (current.x === endPoint.x && current.y === endPoint.y) {
          classicRef.current.finished = true;
          const finalPath = reconstructPath(classicRef.current.parentMap, endPoint);
          setClassicState(prev => ({
             ...prev, 
             isFinished: true, 
             path: finalPath,
             currentFrontier: [] 
          }));
        } else {
          // Add neighbors
          const dirs = [{x:0, y:-1}, {x:1, y:0}, {x:0, y:1}, {x:-1, y:0}];
          // Randomize directions to make the "search" look more natural/confused
          const shuffledDirs = [...dirs].sort(() => Math.random() - 0.5);

          for (const d of shuffledDirs) {
            const nx = current.x + d.x;
            const ny = current.y + d.y;
            const key = `${nx},${ny}`;
            
            if (
                nx >= 0 && nx < MAZE_SIZE && 
                ny >= 0 && ny < MAZE_SIZE && 
                grid[ny][nx].type !== 'wall' && 
                !classicRef.current.visited.has(key)
            ) {
              classicRef.current.visited.add(key);
              classicRef.current.parentMap.set(key, `${current.x},${current.y}`);
              classicRef.current.queue.push({ x: nx, y: ny });
            }
          }

          // Update State UI
          setClassicState(prev => ({
            ...prev,
            visited: new Set(classicRef.current.visited),
            currentFrontier: [current], // Classic has "one head"
            steps: prev.steps + 1
          }));
        }
      }

      // --- QUANTUM UPDATE (Parallel Wave) ---
      // Process ALL nodes in the current frontier per tick.
      if (!quantumRef.current.finished && quantumRef.current.frontier.length > 0) {
        const nextFrontier: Point[] = [];
        const endPoint = { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 };
        let foundEnd = false;

        // Process ENTIRE frontier
        for (const current of quantumRef.current.frontier) {
          if (current.x === endPoint.x && current.y === endPoint.y) {
            foundEnd = true;
            break;
          }

          const dirs = [{x:0, y:-1}, {x:1, y:0}, {x:0, y:1}, {x:-1, y:0}];
          for (const d of dirs) {
            const nx = current.x + d.x;
            const ny = current.y + d.y;
            const key = `${nx},${ny}`;
            
            if (
                nx >= 0 && nx < MAZE_SIZE && 
                ny >= 0 && ny < MAZE_SIZE && 
                grid[ny][nx].type !== 'wall' && 
                !quantumRef.current.visited.has(key)
            ) {
              quantumRef.current.visited.add(key);
              quantumRef.current.parentMap.set(key, `${current.x},${current.y}`);
              nextFrontier.push({ x: nx, y: ny });
            }
          }
        }

        if (foundEnd) {
          quantumRef.current.finished = true;
          const finalPath = reconstructPath(quantumRef.current.parentMap, endPoint);
          setQuantumState(prev => ({
             ...prev, 
             isFinished: true, 
             path: finalPath,
             currentFrontier: [] 
          }));
        } else {
          quantumRef.current.frontier = nextFrontier;
           // Update State UI
           setQuantumState(prev => ({
            ...prev,
            visited: new Set(quantumRef.current.visited),
            currentFrontier: nextFrontier, // Visualizes the "wave"
            steps: prev.steps + 1
          }));
        }
      }

      // Stop if both done
      if (classicRef.current.finished && quantumRef.current.finished) {
        setIsRunning(false);
      }

    }, 40); // Slightly faster tick speed

    return () => clearInterval(interval);
  }, [isRunning, isPaused, grid]);


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 lg:p-8 font-sans">
      
      {/* Header */}
      <header className="mb-8 text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-400">
          Clásica vs Cuántica
        </h1>
        <p className="text-slate-400 text-lg">
          Visualización de la ventaja del paralelismo cuántico en la búsqueda de caminos.
        </p>
      </header>

      {/* Controls */}
      <div className="flex gap-4 mb-8">
        {!isRunning ? (
          <button 
            onClick={startSimulation}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
          >
            <Play size={20} fill="currentColor" />
            {isPaused ? 'Reanudar' : 'Iniciar Simulación'}
          </button>
        ) : (
           <button 
            onClick={pauseSimulation}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold transition-all"
          >
            <Pause size={20} fill="currentColor" />
            Pausar
          </button>
        )}
        
        <button 
          onClick={resetSimulation}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full font-bold border border-slate-700 transition-all hover:text-white"
        >
          <RotateCcw size={20} />
          Nuevo Laberinto
        </button>
      </div>

      {/* Grids Container */}
      <div className="flex flex-col xl:flex-row gap-12 items-start justify-center w-full mb-12">
        <MazeGrid 
          grid={grid}
          visited={classicState.visited}
          path={classicState.path}
          currentFrontier={classicState.currentFrontier}
          type={AlgorithmType.CLASSIC}
          title="Computadora Clásica"
        />
        
        <MazeGrid 
          grid={grid}
          visited={quantumState.visited}
          path={quantumState.path}
          currentFrontier={quantumState.currentFrontier}
          type={AlgorithmType.QUANTUM}
          title="Computadora Cuántica"
        />
      </div>

      {/* Stats */}
      <StatsPanel 
        classicState={classicState} 
        quantumState={quantumState} 
      />

      {/* Educational Footer */}
      <div className="mt-16 max-w-3xl text-center text-slate-500 text-sm pb-8">
        <h4 className="uppercase tracking-widest font-bold mb-2 text-slate-400">Concepto</h4>
        <p>
          En este modelo simplificado, la <strong>Computadora Clásica</strong> explora el laberinto nodo por nodo (DFS). Cada paso en el contador representa una visita secuencial. 
          La <strong>Computadora Cuántica</strong> aprovecha la superposición para explorar todos los caminos posibles simultáneamente (Wavefront). 
          Aquí, cada "paso" representa una expansión de la función de onda, cubriendo múltiples nodos a la vez.
        </p>
      </div>

    </div>
  );
};

export default App;
