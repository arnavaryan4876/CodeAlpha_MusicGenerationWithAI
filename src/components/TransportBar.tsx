import React from 'react';
import { Play, Pause, SkipBack, SkipForward, PlayCircle, Sliders, Share2, Activity, HardDrive } from 'lucide-react';

interface TransportBarProps {
  currentTrackName: string;
  isPlaying: boolean;
  onPlayToggle: () => void;
  playheadPosition: number; // in beats
  totalBeats: number;
  bpm: number;
  setBpm?: (bpm: number) => void;
}

export default function TransportBar({
  currentTrackName,
  isPlaying,
  onPlayToggle,
  playheadPosition,
  totalBeats,
  bpm,
  setBpm
}: TransportBarProps) {
  // Convert beats to MM:SS formats
  const formatTime = (beats: number) => {
    const beatDuration = 60 / bpm;
    const totalSeconds = beats * beatDuration;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentSecondsFormatted = formatTime(playheadPosition);
  const totalSecondsFormatted = formatTime(totalBeats);

  return (
    <footer className="fixed bottom-0 right-0 w-[calc(100%-320px)] h-20 bg-[#353534]/95 backdrop-blur-2xl border-t border-[#5de6ff]/20 flex items-center justify-between px-8 z-50 shadow-[0_-4px_20px_rgba(93,230,255,0.1)]">
      {/* Playback Controls & Track Info */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => alert('Skipped back to sequence origin')}
            className="text-[#cbc3d7] hover:text-[#d0bcff] transition-all cursor-pointer"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={onPlayToggle}
            className="w-10 h-10 rounded-full bg-[#5de6ff] text-[#00363e] flex items-center justify-center active:scale-105 transition-all shadow-[0_0_15px_rgba(93,230,255,0.4)] cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => alert('Skipped forward')}
            className="text-[#cbc3d7] hover:text-[#d0bcff] transition-all cursor-pointer"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="h-10 w-[1px] bg-white/10" />

        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono text-[#5de6ff] uppercase tracking-widest font-bold">
            Now Auditioning
          </span>
          <span className="text-sm font-mono text-white truncate max-w-[200px]">
            {currentTrackName || 'Silence'}
          </span>
        </div>
      </div>

      {/* Progress Timers */}
      <div className="flex-1 max-w-xl px-12 group shrink-0">
        <div className="relative h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer">
          <div
            style={{ width: `${(playheadPosition / totalBeats) * 100}%` }}
            className="absolute top-0 left-0 h-full bg-[#5de6ff] shadow-[0_0_8px_rgba(93,230,255,0.8)]"
          />
          {/* Animated Playhead sweep effect */}
          {isPlaying && (
            <div className="playhead-sweep absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          )}
        </div>
        <div className="flex justify-between mt-2 font-mono text-[10px] text-[#cbc3d7]/50">
          <span>{currentSecondsFormatted}</span>
          <span>{totalSecondsFormatted}</span>
        </div>
      </div>

      {/* DAW Mixer Nav Items */}
      <nav className="flex items-center gap-8 shrink-0">
        <button
          onClick={() => alert('DAW Transport Window active')}
          className="flex flex-col items-center gap-1 text-[#cbc3d7] hover:text-[#d0bcff] transition-all cursor-pointer"
        >
          <PlayCircle className="w-5 h-5" />
          <span className="font-mono text-[9px] uppercase tracking-tighter">Transport</span>
        </button>

        <button
          onClick={() => alert('DAW Mixer desk panel loaded')}
          className="flex flex-col items-center gap-1 text-[#cbc3d7] hover:text-[#d0bcff] transition-all cursor-pointer"
        >
          <Sliders className="w-5 h-5" />
          <span className="font-mono text-[9px] uppercase tracking-tighter">Mixer</span>
        </button>

        <button
          onClick={() => alert('Neural Sync pipeline online')}
          className="flex flex-col items-center gap-1 text-[#5de6ff] drop-shadow-[0_0_8px_rgba(93,230,255,0.6)] transition-all cursor-pointer"
        >
          <Activity className="w-5 h-5" />
          <span className="font-mono text-[9px] uppercase tracking-tighter">Neural Sync</span>
        </button>

        <button
          onClick={() => alert('DAW Output routing settings active')}
          className="flex flex-col items-center gap-1 text-[#cbc3d7] hover:text-[#d0bcff] transition-all cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-mono text-[9px] uppercase tracking-tighter">Output</span>
        </button>
      </nav>
    </footer>
  );
}
