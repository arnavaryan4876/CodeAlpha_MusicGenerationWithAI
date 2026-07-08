export interface Dataset {
  id: string;
  libraryCode: string;
  name: string;
  samples: number;
  size: string;
  lastSync: string;
  isPremium?: boolean;
  isSyncing?: boolean;
  genre: 'classical' | 'jazz' | 'electronic' | 'ambient';
  era: 'baroque' | 'romantic' | 'modernist' | 'contemporary';
  complexity: number; // 0 for monophonic, 1 for symphonic
  description?: string;
  waveform?: number[];
  formats?: string[];
}

export interface MIDIPath {
  name: string;
  tempo: number;
  notes: { note: string; octave: number; time: number; duration: number }[];
}

export interface PreprocessingState {
  isConverting: boolean;
  progress: number;
  totalFiles: number;
  completedFiles: number;
  throughput: number; // it/s
  quantize: boolean;
  transpose: boolean;
  velocityNorm: boolean;
  resolution: number; // TPB
  logs: string[];
}

export interface ModelLabState {
  isTraining: boolean;
  epoch: number;
  maxEpoch: number;
  eta: string;
  lossHistory: { epoch: number; loss: number; valLoss: number; valAcc: number }[];
  layers: number;
  embeddingDim: number;
  dropout: number;
  latency: number;
  params: string;
  terminalLogs: string[];
}

export interface StudioState {
  temperature: number;
  sequenceLength: '4 Measures' | '8 Measures' | '16 Measures' | '32 Measures';
  seed: string;
  notes: StudioNote[];
}

export interface StudioNote {
  id: string;
  noteName: string;
  octave: number;
  col: number; // beat column (0 to 15 or 31 depending on measures)
  width: number; // in beats
}
