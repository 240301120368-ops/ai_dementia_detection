import { create } from 'zustand';

type MemoryScore = {
  correct: number;
  total: number;
  missedWords: string[];
  incorrectWords: string[];
};

type Score = {
  memory?: MemoryScore;
  attention?: {
    accuracy: number;
    averageReactionTime: number;
  };
  visualSpatial?: {
    correct: number;
    total: number;
  };
};

type State = {
  testProgress: number;
  scores: Score;
};

type Actions = {
  setTestProgress: (progress: number) => void;
  setMemoryScore: (score: MemoryScore) => void;
  setAttentionScore: (score: { accuracy: number; averageReactionTime: number }) => void;
  setVisualSpatialScore: (score: { correct: number; total: number }) => void;
  reset: () => void;
};

const initialState: State = {
  testProgress: 0,
  scores: {},
};

export const useAppStore = create<State & Actions>((set) => ({
  ...initialState,
  setTestProgress: (progress) => set(() => ({ testProgress: progress })),
  setMemoryScore: (score) =>
    set((state) => ({ scores: { ...state.scores, memory: score } })),
  setAttentionScore: (score) =>
    set((state) => ({ scores: { ...state.scores, attention: score } })),
  setVisualSpatialScore: (score) =>
    set((state) => ({ scores: { ...state.scores, visualSpatial: score } })),
  reset: () => set(initialState),
}));