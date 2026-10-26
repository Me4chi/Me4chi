import { useEffect, useRef } from 'react';
import { useApp } from '../app/store';
import { CHAPTERS } from '../data/content';

export function ChapterNav({ onSelect }: { onSelect: (id: string) => void }) {
  const open = useApp(s => s.navOpen);
  const active = useApp(s => s.activeChapter);
  const set = useApp(s => s.set);
  const list = useRef<HTMLOListElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      set({ navOpen: false });
      toggle.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, set]);

  return (
    <nav className="chapter-nav" aria-label="Chapters">
      <button ref={toggle} type="button" className="hud-button" aria-expanded={open} aria-controls="chapter-list" onClick={() => set({ navOpen: !open })}>
        Chapters
      </button>
      <ol id="chapter-list" ref={list} hidden={!open}>
        {CHAPTERS.map(chapter => (
          <li key={chapter.id}>
            <button
              type="button"
              disabled={!chapter.ready}
              aria-current={chapter.id === active ? 'step' : undefined}
              onClick={() => {
                onSelect(chapter.id);
                set({ navOpen: false });
              }}
            >
              <b>{chapter.numeral}</b>
              <span>{chapter.title}</span>
              <i lang="ja">{chapter.kanji}</i>
              {!chapter.ready && <small>in production</small>}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
