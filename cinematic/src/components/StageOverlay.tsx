import { forwardRef } from 'react';
import { CHAPTERS, PROFILE } from '../data/content';

/** Text that lives "in front of the lens". Every [data-cue] is choreographed by the scroll timeline. */
export const StageOverlay = forwardRef<HTMLDivElement>(function StageOverlay(_props, ref) {
  const chapter = CHAPTERS[0];
  return (
    <div className="overlay" ref={ref} aria-hidden="true">
      <p className="cue-hint" data-cue="hint">
        <span>Scroll to awaken</span>
        <i />
      </p>
      {chapter && (
        <p className="cue-card" data-cue="card">
          <span className="cue-card-numeral">Chapter {chapter.numeral}</span>
          <span className="cue-card-title">{chapter.title}</span>
          <span className="cue-card-kanji">{chapter.kanji}</span>
        </p>
      )}
      <div className="cue-title">
        <h2>
          {[...PROFILE.name.toUpperCase()].map((letter, i) => (
            <span key={i} data-cue="title-letter">{letter}</span>
          ))}
        </h2>
        <p data-cue="subtitle">{PROFILE.tagline}</p>
      </div>
      <p className="cue-exit" data-cue="exit">
        <span>The path continues</span>
        <small>Chapter II · The Journey — in production</small>
      </p>
    </div>
  );
});
