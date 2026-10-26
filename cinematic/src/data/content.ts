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

/** Paths are relative to /Me4chi/cinematic/ — the demos live in the classic site. */
export const PROJECTS: readonly Project[] = [
  {
    id: 'nova',
    title: 'NOVA Marketplace',
    kind: 'Ecommerce · Interactive',
    description: 'Product catalog, category filters and a working cart counter.',
    href: '../demos/marketplace.html',
    preview: '../assets/marketplace-preview.png',
  },
  {
    id: 'nexus',
    title: 'NEXUS Daily',
    kind: 'Media · Editorial',
    description: 'Responsive news feed, featured story and category filtering.',
    href: '../demos/news.html',
    preview: '../assets/news-preview.png',
  },
  {
    id: 'mori',
    title: 'MORI Coffee',
    kind: 'Local business · Booking',
    description: 'Atmospheric landing page, menu and reservation form.',
    href: '../demos/cafe.html',
    preview: '../assets/cafe-preview.png',
  },
];

export const CONTACTS = [
  { label: 'Email', value: 'uzlow.k005@gmail.com', href: 'mailto:uzlow.k005@gmail.com' },
  { label: 'Telegram', value: '@Me4chiKun', href: 'https://t.me/Me4chiKun' },
  { label: 'GitHub', value: 'github.com/Me4chi', href: 'https://github.com/Me4chi' },
  { label: 'Resume', value: 'PDF', href: '../output/pdf/Me4chi-Resume.pdf' },
] as const;

export const CLASSIC_SITE = '../';
