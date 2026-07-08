import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, AlertTriangle, Zap, RotateCcw, Monitor, RefreshCw } from 'lucide-react';
import { ModelLabState } from '../types';

interface ModelLabTabProps {
  state: ModelLabState;
  setState: React.Dispatch<React.SetStateAction<ModelLabState>>;
  onDeployToStudio?: () => void;
}

export default function ModelLabTab({ state, setState, onDeployToStudio }: ModelLabTabProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.terminalLogs]);

  // Live Simulated Training Cycle
  useEffect(() => {
    if (!state.isTraining) return;

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.epoch >= prev.maxEpoch) {
          return {
            ...prev,
            isTraining: false,
            epoch: prev.maxEpoch,
            eta: '00:00:00',
            terminalLogs: [
              ...prev.terminalLogs,
              `[08:42:00] [SUCCESS] Training epoch limit reached. Final loss: 0.0124 - final val_acc: 0.9842.`,
              `[08:42:01] INFO: Model fully converged. Inference engine loaded in GPU VRAM.`
            ]
          };
        }

        const nextEpoch = prev.epoch + 1;
        const currentLoss = Math.max(0.012, 0.45 * Math.pow(0.995, nextEpoch));
        const valLoss = currentLoss * (1.05 + Math.random() * 0.05);
        const valAcc = Math.min(0.992, 0.72 + 0.27 * (1 - Math.pow(0.993, nextEpoch)));

        // Decrement ETA
        const etaSeconds = Math.max(0, 1000 - nextEpoch * 1.5);
        const hours = Math.floor(etaSeconds / 3600);
        const minutes = Math.floor((etaSeconds % 3600) / 60);
        const seconds = Math.floor(etaSeconds % 60);
        const nextEta = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Real-time Loss update
        const nextLossHistory = [
          ...prev.lossHistory,
          { epoch: nextEpoch, loss: currentLoss, valLoss, valAcc }
        ];

        // Format terminal line
        const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
        const terminalLine = `[${timestamp}] EPOCH ${nextEpoch}: loss: ${currentLoss.toFixed(4)} - val_loss: ${valLoss.toFixed(4)} - val_acc: ${valAcc.toFixed(4)}`;

        return {
          ...prev,
          epoch: nextEpoch,
          eta: nextEta,
          lossHistory: nextLossHistory,
          terminalLogs: [...prev.terminalLogs, terminalLine]
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [state.isTraining, setState]);

  // Handle slide values and update latency / params accordingly
  const handleLayerChange = (layers: number) => {
    setState(prev => {
      const calculatedParams = ((layers * prev.embeddingDim * 400) / 1000000).toFixed(1) + 'M';
      const calculatedLatency = layers * 4;
      return {
        ...prev,
        layers,
        params: calculatedParams,
        latency: calculatedLatency
      };
    });
  };

  const handleEmbeddingChange = (embeddingDim: number) => {
    setState(prev => {
      const calculatedParams = ((prev.layers * embeddingDim * 400) / 1000000).toFixed(1) + 'M';
      return {
        ...prev,
        embeddingDim,
        params: calculatedParams
      };
    });
  };

  const toggleTraining = () => {
    setState(prev => ({
      ...prev,
      isTraining: !prev.isTraining,
      terminalLogs: [
        ...prev.terminalLogs,
        prev.isTraining
          ? `[${new Date().toLocaleTimeString('en-GB', { hour12: false })}] [INFO] Model training SUSPENDED by engineer.`
          : `[${new Date().toLocaleTimeString('en-GB', { hour12: false })}] [INFO] Resuming training weights adaptation on CUDA:0...`
      ]
    }));
  };

  const handleAbort = () => {
    if (confirm('Are you sure you want to abort training? Current weights convergence will be lost.')) {
      setState(prev => ({
        ...prev,
        isTraining: false,
        epoch: 0,
        eta: '02:14:45',
        lossHistory: [],
        terminalLogs: [
          `[${new Date().toLocaleTimeString('en-GB', { hour12: false })}] [WARNING] Training aborted by architect. Weights re-initialized to random gaussian.`
        ]
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Status Bar */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white font-sans tracking-tight">
            Model Lab <span className="text-[#d0bcff]">/ LSTM-Seq2Seq_v4</span>
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs mt-2 text-[#cbc3d7]/60">
            <span className="flex items-center gap-2 text-[#5de6ff] font-bold">
              <span className={`w-2 h-2 bg-[#5de6ff] rounded-full ${state.isTraining ? 'animate-pulse' : ''}`} />
              {state.isTraining ? 'TRAINING IN PROGRESS' : 'TRAINING PAUSED'}
            </span>
            <span>|</span>
            <span className="text-white">
              Epoch: <span className="text-[#d0bcff] font-bold">{state.epoch} / {state.maxEpoch}</span>
            </span>
            <span>|</span>
            <span className="text-white">
              ETA: <span className="text-[#ffafd3] font-bold">{state.eta}</span>
            </span>
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleAbort}
            className="px-5 py-2 border border-red-500/50 hover:bg-red-500/10 text-red-400 font-mono text-xs font-bold uppercase transition-all rounded cursor-pointer"
          >
            Abort
          </button>
          <button
            onClick={toggleTraining}
            className={`px-5 py-2 font-mono text-xs font-bold uppercase transition-all rounded cursor-pointer ${
              state.isTraining
                ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                : 'bg-[#5de6ff] text-[#00363e] hover:brightness-110 shadow-lg shadow-[#5de6ff]/20'
            }`}
          >
            {state.isTraining ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Real-time Loss & Accuracy Chart */}
        <div className="lg:col-span-8 glass-panel rounded-xl p-6 flex flex-col gap-6 min-h-[400px] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10">
            <h3 className="font-mono text-xs font-bold text-[#cbc3d7]/60 uppercase tracking-widest">
              Real-time Loss &amp; Accuracy
            </h3>
            <div className="flex gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-2 text-[#d0bcff]">
                <span className="w-3 h-1 bg-[#d0bcff]" /> Training Loss
              </span>
              <span className="flex items-center gap-2 text-[#5de6ff]">
                <span className="w-3 h-1 bg-[#5de6ff]" /> Validation Accuracy
              </span>
            </div>
          </div>

          {/* Loss Curve SVG Drawing */}
          <div className="flex-1 flex items-end justify-center px-2 pb-4 relative min-h-[220px]">
            {state.lossHistory.length === 0 ? (
              <div className="text-center text-xs font-mono text-[#cbc3d7]/30">
                Awaiting first training epoch measurements...
              </div>
            ) : (
              <svg className="w-full h-full absolute inset-0 pt-4 px-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Simulated Loss Curve path (decreases) */}
                <path
                  d={state.lossHistory
                    .map((item, idx, arr) => {
                      const x = (idx / arr.length) * 100;
                      // loss goes from 0.45 down to 0.012
                      const y = 90 - (item.loss / 0.45) * 80;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#d0bcff"
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />

                {/* Simulated Validation Accuracy path (increases) */}
                <path
                  d={state.lossHistory
                    .map((item, idx, arr) => {
                      const x = (idx / arr.length) * 100;
                      // accuracy goes from 0.72 up to 0.99
                      const y = 90 - ((item.valAcc - 0.7) / 0.3) * 80;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#5de6ff"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              </svg>
            )}
            
            {/* Grid Line lines visual */}
            <div className="w-full h-full flex flex-col justify-between border-b border-l border-white/10 opacity-30 pointer-events-none">
              <div className="border-t border-dashed border-white/10 w-full" />
              <div className="border-t border-dashed border-white/10 w-full" />
              <div className="border-t border-dashed border-white/10 w-full" />
              <div className="w-full" />
            </div>
          </div>
        </div>

        {/* Architecture Configuration */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-6 flex flex-col gap-6">
          <h3 className="font-mono text-xs font-bold text-[#cbc3d7]/60 uppercase tracking-widest">
            Model Architecture
          </h3>

          <div className="space-y-6">
            {/* Layer Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white">NUMBER OF LAYERS</span>
                <span className="text-[#5de6ff] font-bold">{state.layers.toString().padStart(2, '0')}</span>
              </div>
              <div className="relative pt-1">
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  value={state.layers}
                  onChange={(e) => handleLayerChange(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#353534] rounded-lg appearance-none cursor-pointer accent-[#5de6ff]"
                />
              </div>
            </div>

            {/* Embedding Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white">EMBEDDING DIMENSION</span>
                <span className="text-[#5de6ff] font-bold">{state.embeddingDim}</span>
              </div>
              <div className="relative pt-1">
                <input
                  type="range"
                  min="128"
                  max="1024"
                  step="128"
                  value={state.embeddingDim}
                  onChange={(e) => handleEmbeddingChange(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#353534] rounded-lg appearance-none cursor-pointer accent-[#5de6ff]"
                />
              </div>
            </div>

            {/* Dropout Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white">DROPOUT RATE</span>
                <span className="text-[#5de6ff] font-bold">{state.dropout.toFixed(2)}</span>
              </div>
              <div className="relative pt-1">
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.05"
                  value={state.dropout}
                  onChange={(e) => setState(prev => ({ ...prev, dropout: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-[#353534] rounded-lg appearance-none cursor-pointer accent-[#5de6ff]"
                />
              </div>
            </div>

            {/* Metrics panels */}
            <div className="pt-4 border-t border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded border border-white/5">
                  <p className="text-[9px] text-[#cbc3d7]/60 mb-1 font-mono">LATENCY</p>
                  <p className="font-mono text-sm font-bold text-[#5de6ff]">{state.latency}ms</p>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/5">
                  <p className="text-[9px] text-[#cbc3d7]/60 mb-1 font-mono">PARAMS</p>
                  <p className="font-mono text-sm font-bold text-[#d0bcff]">{state.params}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UNIX logs terminal & action panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Terminal Logs */}
        <div className="lg:col-span-8 glass-panel rounded-xl p-6 bg-[#0e0e0e]/95 font-mono text-xs flex flex-col h-[280px]">
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2 shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-500/40" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
            <span className="w-3 h-3 rounded-full bg-[#5de6ff]/40" />
            <span className="ml-4 text-[#cbc3d7]/50 uppercase tracking-widest text-[9px] font-bold">
              Neural_Engine_Terminal.sh
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 text-[#cbc3d7]/70 custom-scrollbar pr-2">
            {state.terminalLogs.map((log, i) => {
              let tagColor = 'text-[#5de6ff]';
              if (log.includes('INFO:')) tagColor = 'text-[#d0bcff]';
              if (log.includes('WARNING')) tagColor = 'text-yellow-400 font-bold';
              if (log.includes('SUCCESS')) tagColor = 'text-green-400 font-bold';

              return (
                <p key={i} className="leading-relaxed">
                  <span className="text-[#cbc3d7]/40 mr-2">
                    {log.substring(0, 10)}
                  </span>
                  <span className={tagColor}>
                    {log.substring(10)}
                  </span>
                </p>
              );
            })}
            
            {state.isTraining && (
              <p className="text-[#d0bcff] animate-pulse">
                <span className="text-[#cbc3d7]/40 mr-2">
                  [{new Date().toLocaleTimeString('en-GB', { hour12: false })}]
                </span>
                <span>Adaptation weights propagating back gradients... <span className="terminal-cursor">|</span></span>
              </p>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#d0bcff]/10 to-[#5de6ff]/10 rounded-xl border border-[#d0bcff]/20 text-center">
            <Zap className="text-[#d0bcff] w-12 h-12 mb-4 animate-bounce" />
            <h4 className="font-sans text-sm font-bold text-white mb-2">Ready for Inference</h4>
            <p className="text-xs text-[#cbc3d7]/80 leading-normal px-4">
              Model performance has reached target convergence. Deploy to studio or continue fine-tuning.
            </p>
            {onDeployToStudio && (
              <button
                onClick={onDeployToStudio}
                className="mt-4 px-4 py-1.5 bg-[#d0bcff]/20 border border-[#d0bcff]/30 text-[#d0bcff] hover:bg-[#d0bcff]/30 text-xs font-mono rounded cursor-pointer transition-all"
              >
                Deploy weights to Studio
              </button>
            )}
          </div>

          <button
            onClick={toggleTraining}
            className="w-full h-24 bg-[#d0bcff] text-[#3c0091] hover:brightness-110 font-bold text-lg rounded-xl flex items-center justify-center gap-4 active:scale-95 duration-100 glow-primary transition-all cursor-pointer select-none"
          >
            {state.isTraining ? (
              <>
                <Pause className="w-6 h-6" />
                <span>PAUSE TRAINING</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                <span>RUN TRAINING</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
