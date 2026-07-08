import React, { useState } from 'react';
import { Play, Pause, MoreVertical, Filter, Upload, Sparkles, Check, Trash2, HardDrive, FileAudio } from 'lucide-react';
import { Dataset } from '../types';

interface DatasetsTabProps {
  datasets: Dataset[];
  onAddDataset: (newDataset: Dataset) => void;
  onRemoveDataset: (id: string) => void;
  activePreviewId: string | null;
  isPlaying: boolean;
  onPreviewSequence: (id: string, notesKey: string) => void;
  onStopSequence: () => void;
}

export default function DatasetsTab({
  datasets,
  onAddDataset,
  onRemoveDataset,
  activePreviewId,
  isPlaying,
  onPreviewSequence,
  onStopSequence
}: DatasetsTabProps) {
  // Filters state
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['classical', 'jazz']);
  const [selectedEra, setSelectedEra] = useState<string>('baroque');
  const [complexityLimit, setComplexityLimit] = useState<number>(0.67); // corresponds to 2/3 slider
  const [isIngesting, setIsIngesting] = useState(false);

  // Ingestion form state
  const [newName, setNewName] = useState('');
  const [newGenre, setNewGenre] = useState<'classical' | 'jazz' | 'electronic' | 'ambient'>('classical');
  const [newEra, setNewEra] = useState<'baroque' | 'romantic' | 'modernist' | 'contemporary'>('contemporary');
  const [newComplexity, setNewComplexity] = useState<number>(0.5);
  const [newSamples, setNewSamples] = useState<number>(12000);
  const [newSize, setNewSize] = useState<string>('150 MB');

  // Handle Genre check toggle
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Filtered datasets
  const filteredDatasets = datasets.filter(d => {
    // Genre match
    const genreMatch = selectedGenres.includes(d.genre);
    // Era match
    const eraMatch = d.era === selectedEra;
    // Complexity filter (d.complexity is between 0 and 1)
    // Complexity slider maps: left = monophonic, right = symphonic
    // Filter out if d.complexity is greater than complexityLimit (or just general threshold)
    const complexityMatch = d.complexity <= complexityLimit + 0.15 && d.complexity >= complexityLimit - 0.4;
    
    return genreMatch && eraMatch && (d.complexity <= complexityLimit);
  });

  // Calculate dynamic metrics
  const totalSamples = filteredDatasets.reduce((sum, d) => sum + d.samples, 0);
  const totalStorageGb = filteredDatasets.reduce((sum, d) => {
    const val = parseFloat(d.size);
    const unit = d.size.includes('GB') ? 1 : 0.001;
    return sum + (val * unit);
  }, 0);

  // Handle new Ingest submit
  const handleIngestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newDatasetItem: Dataset = {
      id: `custom-${Date.now()}`,
      libraryCode: `Library ${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      samples: newSamples,
      size: newSize,
      lastSync: 'Just now',
      genre: newGenre,
      era: newEra,
      complexity: newComplexity,
      description: `User uploaded dataset curated in contemporary workstation. Features automated velocity normalization.`,
      waveform: Array.from({ length: 18 }, () => Math.floor(6 + Math.random() * 16)),
      formats: ['MIDI']
    };

    onAddDataset(newDatasetItem);
    setIsIngesting(false);
    // Reset form
    setNewName('');
    setNewSamples(12000);
    setNewSize('150 MB');
  };

  // Static options helper
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#d0bcff] mb-2 font-sans tracking-tight">Dataset Hub</h2>
          <p className="text-sm text-[#cbc3d7]/80 max-w-xl font-sans">
            Manage high-fidelity MIDI corpora for neural architecture training. Curate genres, normalize velocities, and augment sequences.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="glass-panel px-5 py-2.5 rounded-lg flex flex-col items-end">
            <span className="text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest font-mono">Total Samples</span>
            <span className="text-base font-bold text-[#5de6ff] font-mono">
              {(totalSamples / 1000000).toFixed(2)}M MIDI
            </span>
          </div>
          <div className="glass-panel px-5 py-2.5 rounded-lg flex flex-col items-end">
            <span className="text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest font-mono">Storage Used</span>
            <span className="text-base font-bold text-[#d0bcff] font-mono">
              {totalStorageGb.toFixed(1)} GB
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FILTER SIDEBAR */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="font-mono text-sm font-bold text-white mb-6 flex items-center gap-2">
              <Filter className="text-[#5de6ff] w-4 h-4" />
              <span>REFINEMENT</span>
            </h3>

            <div className="space-y-6">
              {/* Genre Clusters */}
              <div>
                <label className="text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest block mb-3 font-mono">
                  Genre Clusters
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'classical', label: 'Classical (Polyphonic)' },
                    { id: 'jazz', label: 'Jazz Theory & Improvisation' },
                    { id: 'electronic', label: 'Electronic Sequences' },
                    { id: 'ambient', label: 'Ambient Textures' }
                  ].map(genre => (
                    <label key={genre.id} className="flex items-center gap-3 group cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre.id)}
                        onChange={() => toggleGenre(genre.id)}
                        className="w-4 h-4 rounded border-white/20 bg-transparent text-[#d0bcff] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-xs text-[#cbc3d7] font-mono group-hover:text-white transition-colors">
                        {genre.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-white/5" />

              {/* Temporal Era */}
              <div>
                <label className="text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest block mb-3 font-mono">
                  Temporal Era
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'baroque', label: 'Baroque' },
                    { id: 'romantic', label: 'Romantic' },
                    { id: 'modernist', label: 'Modernist' },
                    { id: 'contemporary', label: 'Contemporary' }
                  ].map(era => {
                    const isSelected = selectedEra === era.id;
                    return (
                      <button
                        key={era.id}
                        onClick={() => setSelectedEra(era.id)}
                        className={`text-[11px] py-2 px-3 rounded font-mono border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#353534] text-[#d0bcff] border-[#d0bcff]/30'
                            : 'bg-white/5 text-[#cbc3d7] border-transparent hover:bg-white/10'
                        }`}
                      >
                        {era.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-white/5" />

              {/* Complexity Density */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest block font-mono">
                    Complexity Density
                  </label>
                  <span className="text-xs font-mono text-[#5de6ff]">{(complexityLimit * 100).toFixed(0)}%</span>
                </div>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.01"
                    value={complexityLimit}
                    onChange={(e) => setComplexityLimit(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#5de6ff]"
                  />
                </div>
                <div className="flex justify-between mt-3 text-[9px] font-mono text-[#cbc3d7]/40 tracking-wider">
                  <span>MONOPHONIC</span>
                  <span>SYMPHONIC</span>
                </div>
              </div>
            </div>
          </div>

          {/* UPLOAD ZONE */}
          <div
            onClick={() => setIsIngesting(true)}
            className="border-2 border-dashed border-white/10 hover:border-[#d0bcff]/50 rounded-xl p-8 flex flex-col items-center justify-center text-center group transition-all cursor-pointer relative overflow-hidden"
          >
            <Upload className="w-10 h-10 text-[#d0bcff] mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="font-mono text-xs font-bold text-white mb-2">Ingest New MIDI</h4>
            <p className="text-[11px] text-[#cbc3d7]/70 px-4 leading-normal font-sans">
              Drag .mid, .midi, or .zip archive to start automated preprocessing.
            </p>
          </div>
        </aside>

        {/* DATASET GRID */}
        <div className="lg:col-span-9 space-y-8">
          {filteredDatasets.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <FileAudio className="w-12 h-12 text-[#cbc3d7]/30 mb-4" />
              <p className="text-sm font-mono text-[#cbc3d7]">No datasets match current refinement criteria.</p>
              <button
                onClick={() => {
                  setSelectedGenres(['classical', 'jazz', 'electronic', 'ambient']);
                  setSelectedEra('baroque');
                  setComplexityLimit(1.0);
                }}
                className="mt-4 text-xs font-mono text-[#d0bcff] hover:underline"
              >
                Clear Refinements
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDatasets.map((dataset) => {
                const isCurrentPreview = activePreviewId === dataset.id;
                const isCustom = dataset.id.startsWith('custom');
                return (
                  <div
                    key={dataset.id}
                    className={`glass-panel rounded-xl overflow-hidden group hover:border-[#d0bcff]/40 transition-all flex flex-col ${
                      dataset.isSyncing ? 'col-span-1 md:col-span-2' : ''
                    }`}
                  >
                    {/* Synchronizing style or normal layout */}
                    {dataset.isSyncing ? (
                      <div className="flex flex-col md:flex-row h-full min-h-[192px]">
                        <div className="md:w-1/3 bg-[#2a2a2a] relative overflow-hidden border-r border-white/5 flex items-center justify-center min-h-[120px]">
                          <img
                            className="w-full h-full object-cover opacity-60"
                            referrerPolicy="no-referrer"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCswNAkkHd_-NIsQUSposj7onCCwJNH3hfzdYUCIOddjnnnspRoWcvd2vqnSzov2bzH6PzI4k_x7jFYIwLYf6X5FXN61VKT_Kwu5I69yKEmA9ndXSR_ZanKEaKrEUW1ctjZGFwZdC8TzcI2rQAIna9MNhmONaZA0eL4DGX0dxeu-4HxAHxSw66QIf_QDDAhj_k8XwHCzs9JqoeVL7wlBEeRWrcSI_hVnAl3u_0-2a624edtW-LkqLEX"
                            alt="LoFi Synth"
                          />
                          <div className="absolute inset-0 bg-[#d0bcff]/10" />
                        </div>
                        <div className="flex-1 p-6 relative flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <div>
                                <span className="text-[10px] font-mono text-[#d0bcff] uppercase tracking-widest font-bold">
                                  {dataset.libraryCode}
                                </span>
                                <h3 className="text-xl font-bold text-white tracking-tight leading-normal font-sans">
                                  {dataset.name}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 bg-[#5de6ff]/10 px-3 py-1 rounded-full border border-[#5de6ff]/20">
                                <span className="w-2 h-2 rounded-full bg-[#5de6ff] animate-pulse" />
                                <span className="text-[10px] font-mono text-[#5de6ff] font-bold">SYNCING</span>
                              </div>
                            </div>
                            <p className="text-xs text-[#cbc3d7]/80 max-w-lg mb-4 leading-relaxed font-sans">
                              {dataset.description}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-8 gap-y-4 items-end">
                            <div>
                              <p className="text-[9px] text-[#cbc3d7]/50 uppercase font-mono tracking-wider mb-1">Density</p>
                              <p className="font-mono text-xs font-bold text-white">94% Augmented</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-[#cbc3d7]/50 uppercase font-mono tracking-wider mb-1">Formats</p>
                              <p className="font-mono text-xs font-bold text-white">MIDI, JSON, CSV</p>
                            </div>
                            <div className="ml-auto flex gap-2">
                              <button
                                onClick={() => isCurrentPreview && isPlaying ? onStopSequence() : onPreviewSequence(dataset.id, 'lofi-genesis')}
                                className="px-4 py-2 rounded bg-white/5 border border-white/10 text-white font-mono text-xs hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
                              >
                                {isCurrentPreview && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                Preview Sequence
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Normal Dataset Card
                      <>
                        <div className="h-32 bg-[#201f1f] relative overflow-hidden shrink-0 border-b border-white/5">
                          {/* Visual waveform mockup representation */}
                          <div className="absolute inset-0 opacity-40">
                            <div className="flex items-end h-full gap-1 px-4 pb-4">
                              {dataset.waveform?.map((height, idx) => (
                                <div
                                  key={idx}
                                  style={{ height: `${(height / 24) * 100}%` }}
                                  className={`w-full rounded-full transition-all duration-300 ${
                                    isCurrentPreview && isPlaying
                                      ? 'bg-[#5de6ff] scale-y-110'
                                      : 'bg-[#d0bcff]/60 group-hover:bg-[#d0bcff]'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent" />
                          
                          {/* Premium badge */}
                          {dataset.isPremium && (
                            <div className="absolute top-4 right-4 bg-[#d0bcff]/20 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-[#d0bcff] border border-[#d0bcff]/30 flex items-center gap-1 font-bold">
                              <Sparkles className="w-3 h-3" />
                              <span>PREMIUM</span>
                            </div>
                          )}

                          <div className="absolute bottom-4 left-4">
                            <span className="text-[10px] font-mono text-[#cbc3d7]/60 uppercase tracking-widest">
                              {dataset.libraryCode}
                            </span>
                            <h3 className="text-lg font-bold text-white font-sans leading-tight">
                              {dataset.name}
                            </h3>
                          </div>
                        </div>

                        {/* Card metadata content */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <p className="text-xs text-[#cbc3d7]/70 leading-normal mb-5 font-sans line-clamp-2">
                            {dataset.description}
                          </p>

                          <div className="flex gap-4 mb-6">
                            <div className="flex-1">
                              <p className="text-[9px] text-[#cbc3d7]/50 uppercase font-mono tracking-wider mb-1">Samples</p>
                              <p className="font-mono text-xs font-bold text-white">
                                {dataset.samples.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex-1">
                              <p className="text-[9px] text-[#cbc3d7]/50 uppercase font-mono tracking-wider mb-1">Size</p>
                              <p className="font-mono text-xs font-bold text-white">{dataset.size}</p>
                            </div>
                            <div className="flex-1">
                              <p className="text-[9px] text-[#cbc3d7]/50 uppercase font-mono tracking-wider mb-1">Last Sync</p>
                              <p className="font-mono text-xs font-bold text-[#cbc3d7]">{dataset.lastSync}</p>
                            </div>
                          </div>

                          <div className="mt-auto flex gap-3 relative">
                            <button
                              onClick={() => {
                                if (isCurrentPreview && isPlaying) {
                                  onStopSequence();
                                } else {
                                  // Assign preset keys according to dataset genres
                                  const melodyKey = dataset.id === 'classical-pack' || dataset.id === 'orchestral-midi'
                                    ? 'classical-pack'
                                    : dataset.id === 'jazz-masters'
                                    ? 'jazz-masters'
                                    : 'dark-techno';
                                  onPreviewSequence(dataset.id, melodyKey);
                                }
                              }}
                              className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                isCurrentPreview && isPlaying
                                  ? 'bg-[#5de6ff]/20 text-[#5de6ff] border-[#5de6ff]/30'
                                  : 'bg-[#353534] text-white border-white/5 hover:bg-white/10'
                              }`}
                            >
                              {isCurrentPreview && isPlaying ? (
                                <>
                                  <Pause className="w-4 h-4" />
                                  <span>Stop Sequence</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4" />
                                  <span>Preview Sequence</span>
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === dataset.id ? null : dataset.id)}
                              className="p-2 rounded-lg border border-white/5 text-[#cbc3d7] hover:text-[#d0bcff] hover:border-[#d0bcff]/40 transition-all cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Options for dataset deletion / custom ones */}
                            {activeMenuId === dataset.id && (
                              <div className="absolute right-0 bottom-full mb-2 bg-[#1c1b1b] border border-white/10 rounded-lg shadow-xl py-1 w-48 z-10">
                                {isCustom && (
                                  <button
                                    onClick={() => {
                                      onRemoveDataset(dataset.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Dataset</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => alert(`Details for ${dataset.name}: ${dataset.description}`)}
                                  className="w-full text-left px-4 py-2 text-xs text-[#cbc3d7] hover:bg-white/5"
                                >
                                  View Raw Metadata
                                </button>
                                <button
                                  onClick={() => setActiveMenuId(null)}
                                  className="w-full text-left px-4 py-2 text-xs text-[#cbc3d7] hover:bg-white/5"
                                >
                                  Export as JSON
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* INGESTION MODAL OVERLAY */}
      {isIngesting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-xl p-6 border border-white/10 shadow-2xl relative">
            <h3 className="font-mono text-base font-bold text-[#d0bcff] mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#5de6ff]" />
              <span>Ingest New MIDI Library</span>
            </h3>

            <form onSubmit={handleIngestSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest font-mono mb-1">
                  Dataset Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ambient Glitch Tracks"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#131313] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d0bcff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest font-mono mb-1">
                    Genre
                  </label>
                  <select
                    value={newGenre}
                    onChange={(e: any) => setNewGenre(e.target.value)}
                    className="w-full bg-[#131313] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d0bcff]"
                  >
                    <option value="classical">Classical</option>
                    <option value="jazz">Jazz</option>
                    <option value="electronic">Electronic</option>
                    <option value="ambient">Ambient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest font-mono mb-1">
                    Temporal Era
                  </label>
                  <select
                    value={newEra}
                    onChange={(e: any) => setNewEra(e.target.value)}
                    className="w-full bg-[#131313] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d0bcff]"
                  >
                    <option value="baroque">Baroque</option>
                    <option value="romantic">Romantic</option>
                    <option value="modernist">Modernist</option>
                    <option value="contemporary">Contemporary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest font-mono mb-1">
                    Sample Count
                  </label>
                  <input
                    type="number"
                    value={newSamples}
                    onChange={(e) => setNewSamples(parseInt(e.target.value) || 12000)}
                    className="w-full bg-[#131313] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d0bcff]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest font-mono mb-1">
                    File Storage Size
                  </label>
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="w-full bg-[#131313] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d0bcff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#cbc3d7]/60 uppercase tracking-widest font-mono mb-1">
                  Complexity ({(newComplexity * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={newComplexity}
                  onChange={(e) => setNewComplexity(parseFloat(e.target.value))}
                  className="w-full accent-[#d0bcff]"
                />
                <div className="flex justify-between text-[9px] font-mono text-[#cbc3d7]/40">
                  <span>Monophonic</span>
                  <span>Symphonic</span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsIngesting(false)}
                  className="px-4 py-2 rounded bg-white/5 text-[#cbc3d7] font-mono text-xs hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#d0bcff] text-[#3c0091] font-mono text-xs font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Ingest MIDI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
