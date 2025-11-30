import React from 'react';
import { SolverState } from '../types';
import { Clock, Footprints, Zap } from 'lucide-react';

interface StatsPanelProps {
  classicState: SolverState;
  quantumState: SolverState;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ classicState, quantumState }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
      {/* Classic Stats */}
      <div className="bg-slate-900/50 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-2">
        <h3 className="text-amber-500 font-bold flex items-center gap-2 mb-2">
          <span className="text-lg">🤖</span> Clásica (Secuencial)
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-slate-400 flex items-center gap-1"><Clock size={14}/> Iteraciones</span>
            <span className="text-2xl font-mono font-bold text-white">{classicState.steps}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 flex items-center gap-1"><Footprints size={14}/> Celdas Exploradas</span>
            <span className="text-2xl font-mono font-bold text-amber-400">{classicState.visited.size}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2 italic">
          Prueba caminos uno por uno. Si choca con una pared, debe retroceder (backtracking).
        </p>
      </div>

      {/* Quantum Stats */}
      <div className="bg-slate-900/50 border border-cyan-500/30 rounded-xl p-4 flex flex-col gap-2">
        <h3 className="text-cyan-400 font-bold flex items-center gap-2 mb-2">
          <span className="text-lg">⚛️</span> Cuántica (Paralela)
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-slate-400 flex items-center gap-1"><Clock size={14}/> Iteraciones (Tiempo)</span>
            <span className="text-2xl font-mono font-bold text-white">{quantumState.steps}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 flex items-center gap-1"><Zap size={14}/> Superposición</span>
            <span className="text-2xl font-mono font-bold text-cyan-400">{quantumState.visited.size}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2 italic">
          Explora todas las rutas posibles simultáneamente en superposición. Encuentra la salida en tiempo mínimo.
        </p>
      </div>
    </div>
  );
};

export default StatsPanel;