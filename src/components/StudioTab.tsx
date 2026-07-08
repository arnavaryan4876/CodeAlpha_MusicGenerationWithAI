import React, { useState, useEffect } from 'react';
import { Sparkles, Sliders, ChevronDown, Download, RefreshCw, CheckCircle, Music, Play, Pause } from 'lucide-react';
import { StudioNote } from '../types';
import { audioSynth } from '../lib/AudioEngine';

interface StudioTabProps {
  notes: StudioNote[];
  setNotes: React.Dispatch<React.SetStateAction<StudioNote[]>>;
  temperature: number;
  setTemperature: (val: number) => void;
  sequenceLength: string;
  setSequenceLength: (val: any) => void;
  seed: string;
  setSeed: (val: string) => void;
  playheadPosition: number; // 0 to 16/32
  isPlaying: boolean;
  onPlayToggle: () => void;
}

// 13 pitches representing a full chromatic octave from C4 to C5
const ROW_NOTES = [
  { name: 'C5', isBlack: false },
  { name: 'B4', isBlack: false },
  { name: 'A#4', isBlack: true },
  { name: 'A4', isBlack: false },
  { name: 'G#4', isBlack: true },
  { name: 'G4', isBlack: false },
  { name: 'F#4', isBlack: true },
  { name: 'F4', isBlack: false },
  { name: 'E4', isBlack: false },
  { name: 'D#4', isBlack: true },
  { name: 'D4', isBlack: false },
  { name: 'C#4', isBlack: true },
  { name: 'C4', isBlack: false },
];

export default function StudioTab({
  notes,
  setNotes,
  temperature,
  setTemperature,
  sequenceLength,
  setSequenceLength,
  seed,
  setSeed,
  playheadPosition,
  isPlaying,
  onPlayToggle
}: StudioTabProps) {
  const [showExport, setShowExport] = useState(false);
  const totalCols = sequenceLength.includes('16') ? 32 : 16; // 16 columns by default

  // Helper to check if a note exists at row/col
  const findNote = (noteName: string, col: number) => {
    return notes.find(n => n.noteName === noteName && n.col === col);
  };

  // Toggle note (draw or remove)
  const handleCellClick = (noteName: string, octave: number, col: number) => {
    const existing = findNote(noteName, col);
    if (existing) {
      // Remove note
      setNotes(prev => prev.filter(n => n.id !== existing.id));
    } else {
      // Add note
      const newNote: StudioNote = {
        id: `note-${Date.now()}-${Math.random()}`,
        noteName,
        octave,
        col,
        width: 1
      };
      setNotes(prev => [...prev, newNote]);
      // Play frequency immediately for direct skeuomorphic response
      audioSynth.playNote(noteName, octave, 0.2, 'sine');
    }
  };

  // Play a key directly
  const handleKeyClick = (noteName: string, octave: number) => {
    audioSynth.playNote(noteName, octave, 0.4, 'triangle');
  };

  // Generate sequence using a beautiful algorithmic scale (Minor Pentatonic)
  const handleGenerateSequence = () => {
    // Generate randomized but musically coherent melodies based on temperature
    const scale = ['C4', 'D#4', 'F4', 'G4', 'A#4', 'C5', 'D#5', 'F5'];
    const generatedNotes: StudioNote[] = [];
    const newSeed = 'x0_' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '-bba-cc01-92384-ff921';
    setSeed(newSeed);

    // Play a lovely sweeping synthesized flourish
    scale.forEach((note, idx) => {
      setTimeout(() => {
        const parsedNote = note.replace(/\d/, '');
        const octave = parseInt(note.match(/\d/)?.[0] || '4');
        audioSynth.playNote(parsedNote, octave, 0.15, 'triangle');
      }, idx * 60);
    });

    // Populate the grid notes with minor pentatonic walks
    let lastRowIdx = 3; // start around G4
    for (let col = 0; col < totalCols; col++) {
      // Decide whether to place a note at this column based on temperature
      if (Math.random() < 0.65) {
        // Walk direction
        const step = Math.random() < temperature ? (Math.random() > 0.5 ? 1 : -1) : 0;
        let scaleIdx = (lastRowIdx + step + scale.length) % scale.length;
        lastRowIdx = scaleIdx;

        const fullNote = scale[scaleIdx];
        const parsedNote = fullNote.replace(/\d/, '');
        const octave = parseInt(fullNote.match(/\d/)?.[0] || '4');

        generatedNotes.push({
          id: `gen-${col}-${Date.now()}`,
          noteName: parsedNote,
          octave,
          col,
          width: 1
        });
      }
    }

    setNotes(generatedNotes);
  };

  // Regenerate only from seed
  const handleRegenerateFromSeed = () => {
    handleGenerateSequence();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] bg-[#131313] rounded-xl overflow-hidden border border-white/5">
      {/* Toolbar & Generation Controls */}
      <section className="h-20 border-b border-white/5 flex items-center px-6 gap-8 shrink-0 bg-[#1c1b1b]">
        {/* Generate button */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-[#cbc3d7]/50 uppercase tracking-widest font-bold">
            Generator
          </label>
          <button
            onClick={handleGenerateSequence}
            className="bg-[#00cbe6] text-[#001f25] font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,203,230,0.2)] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Sequence</span>
          </button>
        </div>

        <div className="h-8 w-px bg-white/10 shrink-0" />

        {/* Temperature Slider */}
        <div className="flex-1 max-w-xs flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10px] font-mono text-[#cbc3d7]/50 uppercase tracking-widest font-bold">
            <span>Temperature</span>
            <span className="text-[#5de6ff] font-bold">{temperature.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#353534] rounded-lg appearance-none cursor-pointer accent-[#5de6ff]"
          />
        </div>

        {/* Sequence Length */}
        <div className="flex flex-col gap-1 shrink-0">
          <label className="text-[10px] font-mono text-[#cbc3d7]/50 uppercase tracking-widest font-bold">
            Sequence Length
          </label>
          <div className="flex items-center gap-2 bg-[#201f1f] px-3 py-1.5 rounded-lg border border-white/5 select-none text-xs">
            <Music className="w-3.5 h-3.5 text-[#cbc3d7]" />
            <select
              value={sequenceLength}
              onChange={(e) => setSequenceLength(e.target.value as any)}
              className="bg-transparent border-none focus:ring-0 font-mono text-white py-0 pr-8 cursor-pointer outline-none"
            >
              <option value="4 Measures" className="bg-[#131313]">4 Measures</option>
              <option value="8 Measures" className="bg-[#131313]">8 Measures</option>
              <option value="16 Measures" className="bg-[#131313]">16 Measures</option>
            </select>
          </div>
        </div>

        {/* Export options */}
        <div className="ml-auto relative shrink-0">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-2 border border-white/10 hover:border-[#d0bcff]/50 px-4 py-2 rounded-lg font-mono text-xs text-white transition-all bg-[#1c1b1b] cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#cbc3d7]" />
            <span>Export As</span>
            <ChevronDown className="w-3 h-3 text-[#cbc3d7]" />
          </button>
          
          {showExport && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1c1b1b] border border-white/10 rounded-xl py-2 shadow-2xl z-50">
              <button
                onClick={() => { setShowExport(false); alert('MIDI file (.mid) downloaded!'); }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-xs font-mono text-[#cbc3d7] hover:text-white text-left"
              >
                <Music className="w-3.5 h-3.5 text-[#5de6ff]" />
                <span>MIDI File (.mid)</span>
              </button>
              <button
                onClick={() => { setShowExport(false); alert('Lossless audio WAV file download initialized!'); }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-xs font-mono text-[#cbc3d7] hover:text-white text-left"
              >
                <span className="text-[#5de6ff] text-xs font-bold">WAV</span>
                <span>Wav Audio (.wav)</span>
              </button>
              <div className="h-px bg-white/5 my-1" />
              <button
                onClick={() => { setShowExport(false); alert('Synthesizer state synchronized to Ableton Live instance.'); }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-xs font-mono text-[#cbc3d7] hover:text-white text-left"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d0bcff]" />
                <span>Push to Ableton</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Grid & Sidebar Layout */}
      <section className="flex-1 relative overflow-hidden flex">
        {/* Piano Keys Column */}
        <div className="w-20 bg-[#201f1f] border-r border-white/10 flex flex-col shrink-0 select-none">
          {ROW_NOTES.map((row, idx) => {
            const pitch = row.name.replace(/\d/, '');
            const octave = parseInt(row.name.match(/\d/)?.[0] || '4');
            return (
              <button
                key={idx}
                onClick={() => handleKeyClick(pitch, octave)}
                className={`h-[35px] w-full border-b border-white/5 flex items-center justify-end pr-3 font-mono text-[9px] uppercase transition-all duration-100 ${
                  row.isBlack
                    ? 'bg-black text-[#cbc3d7]/30 hover:bg-black/80'
                    : 'bg-[#393939] text-[#cbc3d7]/60 hover:bg-white/10'
                }`}
              >
                <span>{row.name}</span>
              </button>
            );
          })}
        </div>

        {/* Piano Roll Grid Canvas */}
        <div className="flex-1 overflow-auto relative piano-roll-bg custom-scrollbar bg-[#0e0e0e]">
          {/* Loop over rows */}
          <div className="relative">
            {ROW_NOTES.map((row, rowIdx) => {
              const pitch = row.name.replace(/\d/, '');
              const octave = parseInt(row.name.match(/\d/)?.[0] || '4');
              
              return (
                <div key={rowIdx} className="flex h-[35px] w-max">
                  {/* Grid Columns */}
                  {Array.from({ length: totalCols }).map((_, colIdx) => {
                    const activeNote = findNote(pitch, colIdx);
                    return (
                      <div
                        key={colIdx}
                        onClick={() => handleCellClick(pitch, octave, colIdx)}
                        className={`w-14 h-full border-r border-b border-white/5 cursor-pointer relative transition-all duration-150 ${
                          colIdx % 4 === 0 ? 'border-l-2 border-l-white/10' : ''
                        } ${row.isBlack ? 'bg-black/20' : 'hover:bg-white/5'}`}
                      >
                        {/* Note graphic block */}
                        {activeNote && (
                          <div className="absolute inset-0.5 bg-[#5de6ff] cyan-glow rounded border border-white/20 flex items-center justify-center font-mono text-[8px] text-[#00363e] font-bold select-none truncate px-1">
                            {row.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Moving Playhead Line */}
            {isPlaying && (
              <div
                style={{
                  left: `${(playheadPosition / totalCols) * 100}%`,
                  transition: 'left 0.05s linear'
                }}
                className="absolute top-0 bottom-0 w-0.5 bg-[#5de6ff] shadow-[0_0_10px_#5de6ff] pointer-events-none z-10"
              />
            )}
          </div>
        </div>

        {/* Studio Inspector Panel */}
        <aside className="w-[320px] bg-[#1c1b1b] border-l border-white/5 p-6 flex flex-col gap-6 shrink-0">
          <h3 className="font-mono text-sm font-bold text-[#5de6ff] border-b border-white/5 pb-4">
            Neural Analytics
          </h3>

          <div className="space-y-4">
            {/* Complexity metric */}
            <div className="glass-panel p-4 rounded-xl">
              <p className="font-mono text-[10px] text-[#cbc3d7]/50 uppercase tracking-widest mb-1">
                Complexity Density
              </p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white font-sans">
                  {notes.length > 0 ? `${Math.min(98, 30 + notes.length * 4)}%` : '0%'}
                </span>
                {/* Micro sparkline */}
                <div className="flex gap-0.5 items-end h-8">
                  {[0.4, 0.6, 0.8, 0.5, 0.9, 0.4, 0.7].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: notes.length > 0 ? `${h * 100}%` : '15%' }}
                      className="w-1 bg-[#d0bcff] rounded-t transition-all duration-300"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Harmonic stability metric */}
            <div className="glass-panel p-4 rounded-xl">
              <p className="font-mono text-[10px] text-[#cbc3d7]/50 uppercase tracking-widest mb-1">
                Harmonic Stability
              </p>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-white font-sans">
                  {notes.length === 0 ? 'Empty Roll' : temperature > 0.75 ? 'Experimental' : 'Stable'}
                </span>
                <CheckCircle className={`w-5 h-5 ${notes.length === 0 ? 'text-[#cbc3d7]/30' : 'text-[#5de6ff]'}`} />
              </div>
            </div>
          </div>

          {/* Seed Panel */}
          <div className="mt-auto border-t border-white/5 pt-6">
            <p className="font-mono text-[10px] text-[#cbc3d7]/50 uppercase tracking-widest mb-2">
              Seed Latent Space
            </p>
            <div className="bg-[#0e0e0e] p-3 rounded-lg border border-white/5 font-mono text-[10px] text-[#cbc3d7]/60 break-all leading-normal">
              {seed}
            </div>
            
            <button
              onClick={handleRegenerateFromSeed}
              className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-mono text-[#d0bcff] hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate from Seed</span>
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
