/**
 * Portfolio content, carried over verbatim from the classic site (../index.html, README.md).
 * Nothing here is invented: projects are the three live demos that already exist.
 */

export interface ChapterInfo {
  id: string;
  numeral: string;
  title: string;
  kanji: string;
  ready: boolean;
}

export const CHAPTERS: readonly ChapterInfo[] = [
  { id: 'awakening', numeral: 'I', title: 'Awakening', kanji: '目覚め', ready: true },
  { id: 'journey', numeral: 'II', title: 'The Journey', kanji: '旅路', ready: false },
  { id: 'workshop', numeral: 'III', title: 'The Workshop', kanji: '工房', ready: false },
  { id: 'archive', numeral: 'IV', title: 'The Archive', kanji: '書庫', ready: false },
  { id: 'finale', numeral: 'V', title: 'The Final Scene', kanji: '終幕', ready: false },
];

export const PROFILE = {
  name: 'Me4chi',
  role: 'Game · Desktop · Web Developer',
  tagline: 'Developer. Creator. World Builder.',
  intro: 'I turn ideas into playable worlds and useful software.',
} as const;

export interface Skill {
  id: string;
  title: string;
  items: readonly string[];
}

export const SKILLS: readonly Skill[] = [
  { id: 'games', title: 'Game engines', items: ['Unity', 'Godot', 'Gameplay', 'UI', 'Prototyping', '2D / 3D'] },
  { id: 'programming', title: 'Programming', items: ['C#', 'JavaScript', 'GDScript', 'Git', 'JSON', 'REST APIs'] },
  { id: 'frontend', title: 'Frontend', items: ['HTML5', 'CSS3', 'Responsive UI', 'Animation', 'Accessibility'] },
];

export interface Project {
  id: string;
  title: string;
  kind: string;
  description: string;
  href: string;
  preview: string;
}

/** Paths are relative to /Me4chi/journey/ — the demos live next to the main site. */
export const PROJECTS: readonly Project[] = [
  { id: 'nova', title: 'NOVA Market', kind: 'Ecommerce', description: 'Catalog, filters, sorting, search and a slide-in cart.', href: '../demos/marketplace.html', preview: '../assets/previews/marketplace.webp' },
  { id: 'nexus', title: 'NEXUS Daily', kind: 'Media', description: 'Sections, search, dark mode and a newsletter signup.', href: '../demos/news.html', preview: '../assets/previews/news.webp' },
  { id: 'mori', title: 'MORI Coffee', kind: 'Local business', description: 'Tabbed menu, live opening hours and table booking.', href: '../demos/cafe.html', preview: '../assets/previews/cafe.webp' },
  { id: 'flux', title: 'FLUX Analytics', kind: 'SaaS dashboard', description: 'KPIs, an interactive chart and a sortable orders table.', href: '../demos/dashboard.html', preview: '../assets/previews/dashboard.webp' },
  { id: 'ember', title: 'EMBER', kind: 'Game landing', description: 'Animated pixel scene, hero picker, gallery and roadmap.', href: '../demos/game.html', preview: '../assets/previews/game.webp' },
];

export const CONTACTS = [
  { label: 'Email', value: 'uzlow.k005@gmail.com', href: 'mailto:uzlow.k005@gmail.com' },
  { label: 'Telegram', value: '@Me4chiKun', href: 'https://t.me/Me4chiKun' },
  { label: 'GitHub', value: 'github.com/Me4chi', href: 'https://github.com/Me4chi' },
  { label: 'Resume', value: 'PDF', href: '../output/pdf/Me4chi-Resume.pdf' },
] as const;

export const CLASSIC_SITE = '../';
