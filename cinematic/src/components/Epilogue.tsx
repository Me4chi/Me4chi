import { CLASSIC_SITE, CONTACTS, PROFILE, PROJECTS, SKILLS } from '../data/content';

/**
 * Plain, fully accessible content after the film. Until chapters II–V are built this is where
 * the skills, projects and contacts live; it is also what "Skip the intro" lands on.
 */
export function Epilogue({ onRestart }: { onRestart: () => void }) {
  return (
    <section className="epilogue" id="epilogue" tabIndex={-1} aria-labelledby="epilogue-title">
      <p className="epilogue-kicker" lang="ja">旅は続く</p>
      <h2 id="epilogue-title">{PROFILE.intro}</h2>
      <p className="epilogue-lede">
        {PROFILE.role}. The journey through the workshop and the archive is still being built — meanwhile, here is
        everything it will hold.
      </p>

      <h3>Skills</h3>
      <dl className="epilogue-skills">
        {SKILLS.map(skill => (
          <div key={skill.id}>
            <dt>{skill.title}</dt>
            <dd>{skill.items.join(' · ')}</dd>
          </div>
        ))}
      </dl>

      <h3>Live website demos</h3>
      <ol className="epilogue-projects">
        {PROJECTS.map(project => (
          <li key={project.id}>
            <a href={project.href} target="_blank" rel="noreferrer">
              <img src={project.preview} alt="" width={1280} height={800} loading="lazy" />
              <span>{project.kind}</span>
              <b>{project.title} ↗</b>
              <small>{project.description}</small>
            </a>
          </li>
        ))}
      </ol>

      <h3>Contact</h3>
      <ul className="epilogue-contacts">
        {CONTACTS.map(contact => (
          <li key={contact.label}>
            <a href={contact.href} {...(contact.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
              <span>{contact.label}</span> {contact.value}
            </a>
          </li>
        ))}
      </ul>

      <div className="epilogue-actions">
        <button type="button" className="button" onClick={onRestart}>↺ Restart the journey</button>
        <a className="button ghost" href={CLASSIC_SITE}>Classic portfolio</a>
      </div>
    </section>
  );
}
