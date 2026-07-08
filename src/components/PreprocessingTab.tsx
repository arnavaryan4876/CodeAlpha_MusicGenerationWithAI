import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FileSpreadsheet, RotateCcw, AlertCircle, Sparkles, Sliders } from 'lucide-react';
import { PreprocessingState } from '../types';

interface PreprocessingTabProps {
  state: PreprocessingState;
  setState: React.Dispatch<React.SetStateAction<PreprocessingState>>;
}

export default function PreprocessingTab({ state, setState }: PreprocessingTabProps) {
  const [logScale, setLogScale] = useState(false);
  const [pdfView, setPdfView] = useState(false);
  const [activeHoverBar, setActiveHoverBar] = useState<number | null>(null);
  
  // Local active timer for simulated progress
  useEffect(() => {
    if (!state.isConverting) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.completedFiles >= prev.totalFiles) {
          return {
            ...prev,
            isConverting: false,
            completedFiles: prev.totalFiles,
            progress: 100,
            throughput: 0,
            logs: [
              ...prev.logs,
              `[SUCCESS] Fully completed batch conversion of ${prev.totalFiles} files.`,
              `[INFO] Ingested tensor cache fully synchronized with Model Lab.`
            ]
          };
        }

        const addedFiles = Math.floor(Math.random() * 4) + 1;
        const nextCompleted = Math.min(prev.completedFiles + addedFiles, prev.totalFiles);
        const nextProgress = (nextCompleted / prev.totalFiles) * 100;
        
        // Randomly add conversion log items
        const fileNum = nextCompleted;
        const newLogs = [...prev.logs];
        if (Math.random() > 0.65) {
          const notesCount = Math.floor(200 + Math.random() * 600);
          const chordsCount = Math.floor(5 + Math.random() * 30);
          newLogs.push(`[SUCCESS] Parsed file ${fileNum}: ${notesCount} notes, ${chordsCount} chords found.`);
          if (prev.transpose) {
            newLogs.push(`[PROCESS] Normalizing file ${fileNum} to C-Major key signature...`);
          }
          if (prev.quantize) {
            newLogs.push(`[PROCESS] Applying 16th note quantization (step=0.25) to file ${fileNum}...`);
          }
        }

        return {
          ...prev,
          completedFiles: nextCompleted,
          progress: nextProgress,
          throughput: +(40 + Math.random() * 5).toFixed(1),
          logs: newLogs.slice(-100) // Keep reasonable log count
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [state.isConverting, setState]);

  // Terminal scroll container ref for auto-scrolling
  const terminalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [state.logs]);

  // Histogram data representation
  const histogramBars = [
    { freq: 'C1', height: 10, val: 120 },
    { freq: 'D1', height: 15, val: 180 },
    { freq: 'E1', height: 25, val: 310 },
    { freq: 'F1', height: 40, val: 480 },
    { freq: 'G1', height: 65, val: 780 },
    { freq: 'A1', height: 90, val: 1020 },
    { freq: 'C4', height: 100, val: 1240 },
    { freq: 'E4', height: 85, val: 980 },
    { freq: 'G4', height: 55, val: 640 },
    { freq: 'B4', height: 35, val: 420 },
    { freq: 'C6', height: 20, val: 240 },
    { freq: 'E6', height: 12, val: 150 },
    { freq: 'G6', height: 8, val: 90 },
    { freq: 'C7', height: 15, val: 170 },
    { freq: 'E7', height: 45, val: 510 },
    { freq: 'G7', height: 75, val: 890 },
    { freq: 'C8', height: 50, val: 580 },
    { freq: 'E8', height: 15, val: 160 }
  ];

  // Adjust height based on scale selection
  const getBarHeight = (baseHeight: number) => {
    if (logScale) {
      // Logarithmic representation mockup
      return Math.max(12, Math.log10(baseHeight) * 45);
    }
    return baseHeight;
  };

  const togglePauseResume = () => {
    setState(prev => ({
      ...prev,
      isConverting: !prev.isConverting,
      throughput: prev.isConverting ? 0 : 42.5,
      logs: [
        ...prev.logs,
        prev.isConverting
          ? '[INFO] Preprocessing batch stream SUSPENDED by user.'
          : '[INFO] Preprocessing batch stream RESUMED.'
      ]
    }));
  };

  const triggerTransformations = () => {
    setState(prev => ({
      ...prev,
      logs: [
        ...prev.logs,
        `[CONFIG] Applied transformations parameter update!`,
        `[CONFIG] Quantization: ${prev.quantize ? 'ENABLED (16th)' : 'DISABLED'}`,
        `[CONFIG] Transpose to C-Major: ${prev.transpose ? 'ENABLED' : 'DISABLED'}`,
        `[CONFIG] Velocity Norm: ${prev.velocityNorm ? 'ENABLED [0, 1]' : 'DISABLED'}`,
        `[CONFIG] Resolution TPB set to: ${prev.resolution} Ticks`
      ]
    }));
    alert('Global transformation settings successfully applied to active MIDI parser stream!');
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Progress */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-6 rounded-xl flex flex-col justify-between h-48 border-l-4 border-l-[#5de6ff]">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-white font-sans tracking-tight">Batch Processing: MIDI to Tensors</h2>
              <button
                onClick={togglePauseResume}
                className={`px-3 py-1 text-xs font-mono rounded-full border transition-all cursor-pointer ${
                  state.isConverting
                    ? 'bg-[#5de6ff]/10 text-[#5de6ff] border-[#5de6ff]/20 hover:bg-[#5de6ff]/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                }`}
              >
                {state.isConverting ? 'CONVERTING' : 'PAUSED'}
              </button>
            </div>
            <p className="text-xs text-[#cbc3d7]/60 font-mono">
              Queue ID: 882-FX-44 | Source: /datasets/maestro-v3/midi
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono text-[#cbc3d7]/80">
              <span>
                Progress: {state.completedFiles.toLocaleString()} / {state.totalFiles.toLocaleString()} files
              </span>
              <span className="text-[#5de6ff] font-bold">{state.progress.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-[#353534]/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5de6ff] to-[#d0bcff] transition-all duration-500 ease-out glow-secondary"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Throughput Metric Box */}
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="text-[#5de6ff] mb-2">
            <Sliders className="w-8 h-8 animate-pulse" />
          </div>
          <p className="text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest font-mono mb-1">Throughput</p>
          <p className="text-4xl font-extrabold text-white font-sans tracking-tight">
            {state.throughput} <span className="text-sm font-bold text-[#5de6ff]">it/s</span>
          </p>
          
          {/* Neon bar animation */}
          <div className="mt-4 flex gap-1 h-8 items-end justify-center w-full">
            {[0.4, 0.65, 1.0, 0.8, 0.45, 0.7, 0.9, 0.3].map((height, i) => (
              <div
                key={i}
                style={{
                  height: state.isConverting ? `${height * 100}%` : '20%',
                  transition: 'height 0.3s ease'
                }}
                className={`w-1 rounded-full ${
                  state.isConverting ? 'bg-[#5de6ff]' : 'bg-[#5de6ff]/30'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Lab Area: Bento Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sequence Histogram */}
        <div className="lg:col-span-8 glass-panel rounded-xl p-6 flex flex-col min-h-[400px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white font-sans tracking-tight">Sequence Histogram</h3>
              <p className="text-xs text-[#cbc3d7]/60 font-sans">Distribution of Note Densities across dataset</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPdfView(!pdfView)}
                className={`px-3 py-1.5 rounded border text-xs font-mono cursor-pointer transition-all ${
                  pdfView
                    ? 'bg-[#d0bcff]/20 text-[#d0bcff] border-[#d0bcff]/40'
                    : 'bg-[#353534] text-[#cbc3d7] border-white/5 hover:bg-white/10'
                }`}
              >
                PDF View
              </button>
              <button
                onClick={() => setLogScale(!logScale)}
                className={`px-3 py-1.5 rounded border text-xs font-mono cursor-pointer transition-all ${
                  logScale
                    ? 'bg-[#5de6ff]/20 text-[#5de6ff] border-[#5de6ff]/40'
                    : 'bg-[#353534] text-[#cbc3d7] border-white/5 hover:bg-white/10'
                }`}
              >
                Log Scale
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-[2px] px-4 relative h-[250px] border-b border-white/10 select-none">
            {/* Y-Axis Labels */}
            <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-between text-[9px] text-[#cbc3d7]/50 font-mono opacity-60">
              <span>{logScale ? 'Log(1.0k)' : '1.0k'}</span>
              <span>{logScale ? 'Log(750)' : '750'}</span>
              <span>{logScale ? 'Log(500)' : '500'}</span>
              <span>{logScale ? 'Log(250)' : '250'}</span>
              <span>0</span>
            </div>

            {/* Histogram Bars */}
            <div className="w-full flex items-end gap-[4px] h-full pt-6">
              {histogramBars.map((bar, idx) => {
                const heightPercent = getBarHeight(bar.height);
                const isHovered = activeHoverBar === idx;
                const isMiddle = idx >= 5 && idx <= 10;
                
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveHoverBar(idx)}
                    onMouseLeave={() => setActiveHoverBar(null)}
                    style={{ height: `${heightPercent}%` }}
                    className={`flex-1 rounded-t-sm transition-all duration-200 cursor-help relative ${
                      isHovered
                        ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)] scale-y-105'
                        : isMiddle
                        ? 'bg-[#5de6ff]'
                        : 'bg-[#d0bcff]/40 hover:bg-[#d0bcff]'
                    }`}
                  >
                    {/* Hover tooltips */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1c1b1b] border border-white/10 px-2 py-1 rounded text-[10px] font-mono text-white whitespace-nowrap z-10 shadow-xl">
                        <span className="text-[#5de6ff] font-bold">{bar.freq}</span>: {bar.val} notes
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-between text-xs font-mono text-[#cbc3d7]/60 font-bold px-2">
            <span>C1 (Sub-bass)</span>
            <span>C4 (Middle)</span>
            <span>C8 (Ethereal)</span>
          </div>
        </div>

        {/* Preprocessing Options */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white font-sans tracking-tight">Global Toggles</h3>
          
          <div className="space-y-4">
            {/* Quantization Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#201f1f] rounded-lg border border-white/5">
              <div>
                <p className="text-white text-sm font-bold">Quantization</p>
                <p className="text-[10px] text-[#cbc3d7]/60 font-mono">Snap to 16th notes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={state.quantize}
                  onChange={(e) => setState(prev => ({ ...prev, quantize: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d0bcff]" />
              </label>
            </div>

            {/* Transpose Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#201f1f] rounded-lg border border-white/5">
              <div>
                <p className="text-white text-sm font-bold">Transpose to C-Major</p>
                <p className="text-[10px] text-[#cbc3d7]/60 font-mono">Harmonic normalization</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={state.transpose}
                  onChange={(e) => setState(prev => ({ ...prev, transpose: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d0bcff]" />
              </label>
            </div>

            {/* Velocity Normalization Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#201f1f] rounded-lg border border-white/5">
              <div>
                <p className="text-white text-sm font-bold">Velocity Norm</p>
                <p className="text-[10px] text-[#cbc3d7]/60 font-mono">Standardize dynamics [0, 1]</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={state.velocityNorm}
                  onChange={(e) => setState(prev => ({ ...prev, velocityNorm: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#353534] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d0bcff]" />
              </label>
            </div>
          </div>

          <div className="pt-4">
            <label className="text-xs font-mono text-[#cbc3d7]/80 mb-2 block uppercase tracking-tighter">
              Resolution (TPB): <span className="text-[#5de6ff] font-bold">{state.resolution} Ticks</span>
            </label>
            <input
              type="range"
              min="4"
              max="96"
              step="4"
              value={state.resolution}
              onChange={(e) => setState(prev => ({ ...prev, resolution: parseInt(e.target.value) }))}
              className="w-full h-1 bg-[#353534] rounded-lg appearance-none cursor-pointer accent-[#5de6ff]"
            />
            <div className="flex justify-between text-[10px] font-mono mt-2 opacity-60">
              <span>4</span>
              <span>24 Ticks (Default)</span>
              <span>96</span>
            </div>
          </div>

          <button
            onClick={triggerTransformations}
            className="w-full py-3 border border-[#5de6ff] text-[#5de6ff] hover:bg-[#5de6ff]/10 rounded-lg font-mono text-sm font-bold transition-all cursor-pointer"
          >
            Apply Transformations
          </button>
        </div>

        {/* Code Snippet / Status Console */}
        <div className="col-span-12 glass-panel rounded-xl overflow-hidden flex flex-col h-[280px]">
          <div className="bg-[#2a2a2a] px-6 py-3 flex items-center justify-between border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-3 h-3 rounded-full bg-red-500/40" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
              <span className="w-3 h-3 rounded-full bg-[#5de6ff]/40" />
              <span className="ml-4 text-[#cbc3d7] font-bold">music21_converter.py — logs</span>
            </div>
            <span className="text-xs font-mono text-[#5de6ff] font-bold">Python 3.10.x</span>
          </div>

          <div
            ref={terminalRef}
            className="bg-[#0e0e0e] flex-1 p-6 font-mono text-xs overflow-y-auto space-y-1.5 scroll-smooth text-[#cbc3d7]/90 custom-scrollbar"
          >
            {state.logs.map((log, i) => {
              let colorClass = 'text-[#cbc3d7]/60';
              if (log.includes('[SUCCESS]')) {
                colorClass = 'text-[#5de6ff] font-bold';
              } else if (log.includes('[ERROR]')) {
                colorClass = 'text-red-400 font-bold';
              } else if (log.includes('[PROCESS]')) {
                colorClass = 'text-[#cbc3d7]/40';
              } else if (log.includes('>>>')) {
                colorClass = 'text-white';
              }
              
              return (
                <p key={i} className={colorClass}>
                  {log.startsWith('>>>') ? (
                    <span>
                      <span className="text-[#d0bcff] mr-2">&gt;&gt;&gt;</span>
                      {log.replace('>>> ', '')}
                    </span>
                  ) : (
                    log
                  )}
                </p>
              );
            })}
            
            {state.isConverting && (
              <p className="text-[#5de6ff] animate-pulse">
                <span>|</span> Processing file {state.completedFiles + 1}... [██████████░░░] {state.progress.toFixed(0)}%
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
