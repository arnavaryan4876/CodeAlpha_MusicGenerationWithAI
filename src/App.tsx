import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SidebarComponent from './components/Sidebar';
import DatasetsTab from './components/DatasetsTab';
import PreprocessingTab from './components/PreprocessingTab';
import ModelLabTab from './components/ModelLabTab';
import StudioTab from './components/StudioTab';
import TransportBar from './components/TransportBar';

import { Dataset, PreprocessingState, ModelLabState, StudioNote } from './types';
import { INITIAL_DATASETS, PRESET_MELODIES } from './data';
import { audioSynth } from './lib/AudioEngine';

export default function App() {
  const [currentTab, setTab] = useState<string>('datasets');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Datasets State
  const [datasets, setDatasets] = useState<Dataset[]>(INITIAL_DATASETS);
  const [activePreviewId, setActivePreviewId] = useState<string | null>('classical-pack');

  // Bottom Transport Audio Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playheadPosition, setPlayheadPosition] = useState<number>(5.4); // starting offset just like screenshot
  const [totalBeats, setTotalBeats] = useState<number>(16);
  const [bpm, setBpm] = useState<number>(124.0);
  const [activeTrackName, setActiveTrackName] = useState<string>('Bach_Invention_No13.mid');

  // Preprocessing Lab State
  const [preprocessing, setPreprocessing] = useState<PreprocessingState>({
    isConverting: true,
    progress: 67.4,
    totalFiles: 2100,
    completedFiles: 1402,
    throughput: 42.5,
    quantize: true,
    transpose: true,
    velocityNorm: false,
    resolution: 24,
    logs: [
      '[INFO] Initializing music21 stream parser...',
      '[INFO] Loaded configuration from laboratory_config.yaml',
      '>>> from music21 import converter, instrument, note, chord',
      '>>> s = converter.parse(\'input_file_1402.mid\')',
      '>>> stream = s.flat.notes',
      '[SUCCESS] Parsed file 1402: 454 notes, 23 chords found.',
      '[PROCESS] Normalizing to C-Major key signature...',
      '[PROCESS] Applying 16th note quantization (step=0.25)...'
    ]
  });

  // Model Lab State
  const [modelLab, setModelLab] = useState<ModelLabState>({
    isTraining: true,
    epoch: 482,
    maxEpoch: 1000,
    eta: '02:14:45',
    layers: 6,
    embeddingDim: 512,
    dropout: 0.25,
    latency: 24,
    params: '1.2M',
    lossHistory: Array.from({ length: 48 }, (_, idx) => {
      const ep = idx * 10 + 1;
      const loss = 0.45 * Math.pow(0.995, ep);
      return {
        epoch: ep,
        loss,
        valLoss: loss * 1.05,
        valAcc: 0.72 + 0.27 * (1 - Math.pow(0.993, ep))
      };
    }),
    terminalLogs: [
      '[08:24:12] INFO: Initializing weights with Xavier distribution...',
      '[08:24:15] INFO: Cuda backend optimized: GPU 0 utilized @ 84%',
      '[08:25:01] EPOCH 481: loss: 0.0412 - val_acc: 0.9421',
      '[08:25:44] EPOCH 482: loss: 0.0398 - val_acc: 0.9458'
    ]
  });

  // Studio State
  const [studioTemp, setStudioTemp] = useState<number>(0.85);
  const [sequenceLength, setSequenceLength] = useState<'4 Measures' | '8 Measures' | '16 Measures'>('8 Measures');
  const [studioSeed, setStudioSeed] = useState<string>('x0_239-f92-aa09-923-bba-cc01-92384-ff921');
  const [studioNotes, setStudioNotes] = useState<StudioNote[]>([
    { id: 'n1', noteName: 'B4', octave: 4, col: 2, width: 1 },
    { id: 'n2', noteName: 'G4', octave: 4, col: 4, width: 1 },
    { id: 'n3', noteName: 'E4', octave: 4, col: 6, width: 1 },
    { id: 'n4', noteName: 'A4', octave: 4, col: 9, width: 1 },
    { id: 'n5', noteName: 'B4', octave: 4, col: 11, width: 1 },
    { id: 'n6', noteName: 'C4', octave: 4, col: 14, width: 1 },
  ]);

  // Handle Play/Pause Global Toggle
  const handlePlayToggle = () => {
    if (isPlaying) {
      audioSynth.stopAll();
      setIsPlaying(false);
    } else {
      // Pick notes based on activePreviewId or Studio tab
      if (currentTab === 'studio') {
        if (studioNotes.length === 0) {
          alert('Piano roll is currently empty! Click notes to draw, or hit "Generate Sequence".');
          return;
        }
        
        // Convert studioNotes format to synth notes format
        const synthNotes = studioNotes.map(sn => ({
          noteName: sn.noteName,
          octave: sn.octave,
          beat: sn.col * 0.5, // 0.5 beats per grid col
          duration: 0.5
        }));

        setIsPlaying(true);
        audioSynth.playSequence(
          synthNotes,
          bpm,
          (beat) => setPlayheadPosition(beat),
          () => setIsPlaying(false),
          'sine'
        );
      } else {
        // Fallback to active dataset preview melody
        const datasetId = activePreviewId || 'classical-pack';
        const melodyKey = datasetId === 'classical-pack' || datasetId === 'orchestral-midi' ? 'classical-pack' : 'jazz-masters';
        handlePreviewSequence(datasetId, melodyKey);
      }
    }
  };

  // Dataset Sequence Preview Action
  const handlePreviewSequence = (datasetId: string, melodyKey: string) => {
    audioSynth.stopAll();
    const melody = PRESET_MELODIES[melodyKey] || PRESET_MELODIES['classical-pack'];
    const datasetObj = datasets.find(d => d.id === datasetId);

    setActivePreviewId(datasetId);
    setActiveTrackName(datasetObj ? `${datasetObj.name.replace(/\s+/g, '_')}.mid` : 'Custom_Melody.mid');
    setIsPlaying(true);

    const maxBeat = Math.max(...melody.map(m => m.beat + m.duration), 16);
    setTotalBeats(maxBeat);

    audioSynth.playSequence(
      melody,
      bpm,
      (beat) => setPlayheadPosition(beat),
      () => setIsPlaying(false),
      datasetId === 'dark-techno' ? 'sawtooth' : 'triangle'
    );
  };

  const handleStopSequence = () => {
    audioSynth.stopAll();
    setIsPlaying(false);
  };

  // Add Custom Dataset Ingestion
  const handleAddDataset = (newDataset: Dataset) => {
    setDatasets(prev => [newDataset, ...prev]);
  };

  // Delete Custom Dataset
  const handleRemoveDataset = (id: string) => {
    setDatasets(prev => prev.filter(d => d.id !== id));
    if (activePreviewId === id) {
      handleStopSequence();
      setActivePreviewId(null);
    }
  };

  // New Experiment Click
  const handleNewExperiment = () => {
    alert('⚡ New experiment successfully initialized on GPU partition! Configuration synchronized to active training node.');
  };

  // Deploy trained model weights to Studio
  const handleDeployToStudio = () => {
    setStudioSeed(`x0_converged-${Math.floor(100 + Math.random() * 900)}-bba-cc01-92384-ff921`);
    alert('🚀 Converged model weights successfully deployed! Latent seed in Generation Studio updated to latest training iteration.');
    setTab('studio');
  };

  // Ensure stop on tab changes if playing
  useEffect(() => {
    audioSynth.stopAll();
    setIsPlaying(false);
  }, [currentTab]);

  return (
    <div className="bg-[#0A0A0B] text-[#e5e2e1] min-h-screen font-sans overflow-x-hidden relative select-none">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <SidebarComponent
        currentTab={currentTab}
        setTab={setTab}
        onNewExperiment={handleNewExperiment}
      />

      {/* TOP STATUS & METRICS HEADER */}
      <Header
        title={
          currentTab === 'datasets'
            ? 'Dataset Hub'
            : currentTab === 'preprocessing'
            ? 'Neural Audio Workstation'
            : currentTab === 'model-lab'
            ? 'Neural Audio Workstation'
            : 'Neural Audio Workstation'
        }
        searchPlaceholder={
          currentTab === 'datasets'
            ? 'Search datasets...'
            : currentTab === 'preprocessing'
            ? 'Search parameters...'
            : 'Search patterns...'
        }
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* MAIN CONTENT CANVAS */}
      <main id="main-content" className="ml-[320px] pt-20 pb-32 min-h-screen relative z-10">
        <div className="max-w-[1400px] mx-auto p-8">
          
          {currentTab === 'datasets' && (
            <DatasetsTab
              datasets={datasets}
              onAddDataset={handleAddDataset}
              onRemoveDataset={handleRemoveDataset}
              activePreviewId={activePreviewId}
              isPlaying={isPlaying}
              onPreviewSequence={handlePreviewSequence}
              onStopSequence={handleStopSequence}
            />
          )}

          {currentTab === 'preprocessing' && (
            <PreprocessingTab
              state={preprocessing}
              setState={setPreprocessing}
            />
          )}

          {currentTab === 'model-lab' && (
            <ModelLabTab
              state={modelLab}
              setState={setModelLab}
              onDeployToStudio={handleDeployToStudio}
            />
          )}

          {currentTab === 'studio' && (
            <StudioTab
              notes={studioNotes}
              setNotes={setStudioNotes}
              temperature={studioTemp}
              setTemperature={setStudioTemp}
              sequenceLength={sequenceLength}
              setSequenceLength={setSequenceLength}
              seed={studioSeed}
              setSeed={setStudioSeed}
              playheadPosition={playheadPosition}
              isPlaying={isPlaying}
              onPlayToggle={handlePlayToggle}
            />
          )}

        </div>
      </main>

      {/* FIXED BOTTOM AUDIO TRANSPORT CONTROL BAR */}
      <TransportBar
        currentTrackName={currentTrackName()}
        isPlaying={isPlaying}
        onPlayToggle={handlePlayToggle}
        playheadPosition={playheadPosition}
        totalBeats={totalBeats}
        bpm={bpm}
        setBpm={setBpm}
      />

      {/* Atmospheric Glowing Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-[#d0bcff]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-64 bg-[#5de6ff]/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );

  // Quick helper to determine current active audio label
  function currentTrackName() {
    if (currentTab === 'studio') {
      return 'Generated_Seq_PitchWalk.mid';
    }
    return activeTrackName;
  }
}
