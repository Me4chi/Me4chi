import { create } from 'zustand';

export type Quality = 'high' | 'medium' | 'low';
export type EngineStatus = 'loading' | 'ready' | 'unsupported' | 'context-lost';

/** UI-level state only. Nothing here is written per frame. */
interface AppState {
  status: EngineStatus;
  loadProgress: number;
  activeChapter: string;
  audioOn: boolean;
  reducedMotion: boolean;
  quality: Quality;
  navOpen: boolean;
  set: (patch: Partial<Omit<AppState, 'set'>>) => void;
}

const prefersReducedMotion = (): boolean => {
  try {
    const stored = localStorage.getItem('me4chi-reduced-motion');
    if (stored !== null) return stored === '1';
  } catch {
    // Storage blocked — fall back to the OS preference.
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const useApp = create<AppState>(set => ({
  status: 'loading',
  loadProgress: 0,
  activeChapter: 'awakening',
  audioOn: false,
  reducedMotion: prefersReducedMotion(),
  quality: 'high',
  navOpen: false,
  set: patch => set(patch),
}));
