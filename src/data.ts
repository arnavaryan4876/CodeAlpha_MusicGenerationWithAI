import { Dataset } from './types';

export const INITIAL_DATASETS: Dataset[] = [
  {
    id: 'classical-pack',
    libraryCode: 'Library 042',
    name: 'Classical MIDI Pack',
    samples: 45200,
    size: '1.2 GB',
    lastSync: '2h ago',
    isPremium: true,
    genre: 'classical',
    era: 'baroque',
    complexity: 0.85, // Symphonic/Polyphonic
    description: 'High-fidelity multi-voice keyboard works, including Bach fugues, inventions, and Mozart sonatas, normalized and parsed to strict polyphonic tracks.',
    waveform: [8, 12, 16, 10, 14, 20, 8, 18, 12, 14, 10, 22, 16, 20, 14, 12, 16, 10],
    formats: ['MIDI', 'JSON']
  },
  {
    id: 'jazz-masters',
    libraryCode: 'Library 089',
    name: 'Jazz Masters Vol. II',
    samples: 12800,
    size: '842 MB',
    lastSync: 'Yesterday',
    genre: 'jazz',
    era: 'contemporary',
    complexity: 0.65,
    description: 'Bebop, modal jazz, and hard bop improvisational piano and saxophone solos with swing-quantized microtimings.',
    waveform: [10, 16, 14, 22, 10, 18, 8, 12, 16, 14, 20, 8, 16, 10, 14, 22, 16, 12],
    formats: ['MIDI', 'JSON']
  },
  {
    id: 'lofi-genesis',
    libraryCode: 'Active Research',
    name: 'Lo-Fi Beat Genesis',
    samples: 10000,
    size: '614 MB',
    lastSync: 'Syncing',
    isSyncing: true,
    genre: 'ambient',
    era: 'contemporary',
    complexity: 0.45,
    description: 'Extracted rhythmic patterns from over 10,000 chill-hop and lo-fi tracks. Optimized for latent-space diffusion models focusing on subtle swing and micro-timing.',
    waveform: [12, 14, 8, 18, 20, 14, 10, 16, 22, 18, 12, 14, 10, 8, 16, 12, 20, 14],
    formats: ['MIDI', 'JSON', 'CSV']
  },
  {
    id: 'dark-techno',
    libraryCode: 'Library 112',
    name: 'Dark Techno Arps',
    samples: 8200,
    size: '312 MB',
    lastSync: '3 days ago',
    genre: 'electronic',
    era: 'contemporary',
    complexity: 0.3, // Monophonic arps
    description: 'Aggressive analog synthesizer sequences, hypnotic 303 basslines, and industrial melodic runs aligned to rigid grids.',
    waveform: [14, 20, 22, 14, 10, 12, 18, 8, 10, 14, 16, 22, 12, 14, 20, 16, 8, 10],
    formats: ['MIDI']
  },
  {
    id: 'orchestral-midi',
    libraryCode: 'Library 056',
    name: 'Orchestral Score MIDI',
    samples: 28000,
    size: '2.4 GB',
    lastSync: '1 week ago',
    genre: 'classical',
    era: 'romantic',
    complexity: 0.95, // Fully symphonic
    description: 'Dense symphonic arrangements from Romantic and early 20th-century composers, transcribed with key signature and dynamic metadata.',
    waveform: [6, 10, 14, 18, 22, 18, 14, 10, 12, 16, 20, 24, 20, 16, 12, 8, 14, 10],
    formats: ['MIDI', 'JSON']
  }
];

export const PRESET_MELODIES: Record<string, { noteName: string; octave: number; beat: number; duration: number }[]> = {
  'classical-pack': [
    { noteName: 'C', octave: 4, beat: 0, duration: 0.5 },
    { noteName: 'D', octave: 4, beat: 0.5, duration: 0.5 },
    { noteName: 'E', octave: 4, beat: 1, duration: 0.5 },
    { noteName: 'F', octave: 4, beat: 1.5, duration: 0.5 },
    { noteName: 'G', octave: 4, beat: 2, duration: 0.5 },
    { noteName: 'A', octave: 4, beat: 2.5, duration: 0.5 },
    { noteName: 'B', octave: 4, beat: 3, duration: 0.5 },
    { noteName: 'C', octave: 5, beat: 3.5, duration: 0.5 },
    { noteName: 'B', octave: 4, beat: 4, duration: 0.5 },
    { noteName: 'G', octave: 4, beat: 4.5, duration: 0.5 },
    { noteName: 'A', octave: 4, beat: 5, duration: 0.5 },
    { noteName: 'F', octave: 4, beat: 5.5, duration: 0.5 },
    { noteName: 'G', octave: 4, beat: 6, duration: 1.0 },
    { noteName: 'E', octave: 4, beat: 7, duration: 1.0 },
    // Polyphonic secondary voice offset
    { noteName: 'E', octave: 3, beat: 1, duration: 0.5 },
    { noteName: 'F', octave: 3, beat: 1.5, duration: 0.5 },
    { noteName: 'G', octave: 3, beat: 2, duration: 0.5 },
    { noteName: 'A', octave: 3, beat: 2.5, duration: 0.5 },
    { noteName: 'B', octave: 3, beat: 3, duration: 0.5 },
    { noteName: 'C', octave: 4, beat: 3.5, duration: 0.5 },
    { noteName: 'D', octave: 4, beat: 4, duration: 0.5 },
    { noteName: 'E', octave: 4, beat: 4.5, duration: 0.5 },
    { noteName: 'C', octave: 4, beat: 5, duration: 1.0 }
  ],
  'jazz-masters': [
    { noteName: 'C', octave: 4, beat: 0, duration: 0.75 },
    { noteName: 'E', octave: 4, beat: 0.75, duration: 0.25 },
    { noteName: 'G', octave: 4, beat: 1.0, duration: 0.75 },
    { noteName: 'A#', octave: 4, beat: 1.75, duration: 0.25 },
    { noteName: 'A', octave: 4, beat: 2.0, duration: 0.5 },
    { noteName: 'G', octave: 4, beat: 2.5, duration: 0.5 },
    { noteName: 'E', octave: 4, beat: 3.0, duration: 1.0 },
    
    { noteName: 'F', octave: 4, beat: 4.0, duration: 0.75 },
    { noteName: 'A', octave: 4, beat: 4.75, duration: 0.25 },
    { noteName: 'C', octave: 5, beat: 5.0, duration: 0.75 },
    { noteName: 'D#', octave: 5, beat: 5.75, duration: 0.25 },
    { noteName: 'D', octave: 5, beat: 6.0, duration: 0.5 },
    { noteName: 'C', octave: 5, beat: 6.5, duration: 0.5 },
    { noteName: 'A', octave: 4, beat: 7.0, duration: 1.0 }
  ],
  'lofi-genesis': [
    // Chord pad style
    { noteName: 'A', octave: 3, beat: 0, duration: 2.0 },
    { noteName: 'C', octave: 4, beat: 0, duration: 2.0 },
    { noteName: 'E', octave: 4, beat: 0, duration: 2.0 },
    { noteName: 'G', octave: 4, beat: 0, duration: 2.0 },

    { noteName: 'D', octave: 3, beat: 2, duration: 2.0 },
    { noteName: 'F', octave: 3, beat: 2, duration: 2.0 },
    { noteName: 'A', octave: 3, beat: 2, duration: 2.0 },
    { noteName: 'C', octave: 4, beat: 2, duration: 2.0 },

    { noteName: 'G', octave: 3, beat: 4, duration: 2.0 },
    { noteName: 'B', octave: 3, beat: 4, duration: 2.0 },
    { noteName: 'D', octave: 4, beat: 4, duration: 2.0 },
    { noteName: 'F', octave: 4, beat: 4, duration: 2.0 },

    { noteName: 'C', octave: 3, beat: 6, duration: 2.0 },
    { noteName: 'E', octave: 3, beat: 6, duration: 2.0 },
    { noteName: 'G', octave: 3, beat: 6, duration: 2.0 },
    { noteName: 'B', octave: 3, beat: 6, duration: 2.0 }
  ],
  'dark-techno': [
    { noteName: 'C', octave: 2, beat: 0, duration: 0.25 },
    { noteName: 'C', octave: 3, beat: 0.25, duration: 0.25 },
    { noteName: 'D#', octave: 3, beat: 0.5, duration: 0.25 },
    { noteName: 'C', octave: 3, beat: 0.75, duration: 0.25 },
    { noteName: 'F', octave: 3, beat: 1.0, duration: 0.25 },
    { noteName: 'C', octave: 3, beat: 1.25, duration: 0.25 },
    { noteName: 'G', octave: 3, beat: 1.5, duration: 0.25 },
    { noteName: 'C', octave: 3, beat: 1.75, duration: 0.25 },
    
    { noteName: 'C', octave: 2, beat: 2, duration: 0.25 },
    { noteName: 'C', octave: 3, beat: 2.25, duration: 0.25 },
    { noteName: 'D#', octave: 3, beat: 2.5, duration: 0.25 },
    { noteName: 'C', octave: 3, beat: 2.75, duration: 0.25 },
    { noteName: 'F', octave: 3, beat: 3.0, duration: 0.25 },
    { noteName: 'C', octave: 3, beat: 3.25, duration: 0.25 },
    { noteName: 'G#', octave: 3, beat: 3.5, duration: 0.25 },
    { noteName: 'G', octave: 3, beat: 3.75, duration: 0.25 }
  ],
  'orchestral-midi': [
    { noteName: 'C', octave: 3, beat: 0, duration: 4.0 },
    { noteName: 'G', octave: 3, beat: 1.0, duration: 3.0 },
    { noteName: 'C', octave: 4, beat: 2.0, duration: 2.0 },
    { noteName: 'E', octave: 4, beat: 3.0, duration: 1.0 },
    { noteName: 'G', octave: 4, beat: 4.0, duration: 4.0 },
    { noteName: 'C', octave: 5, beat: 5.0, duration: 3.0 }
  ]
};
