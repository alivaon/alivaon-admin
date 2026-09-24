import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  CircleHelp,
  CircleUser,
  Folder,
  Layers,
  LayoutDashboard,
  Mail,
  MessagesSquare,
  Newspaper,
  PenLine,
  Settings,
  ShieldCheck,
  Star,
  Tags,
  UserRound,
  Users,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Réservé aux administrateurs (ROLE_ADMIN). */
  adminOnly?: boolean;
  /** Masqué aux administrateurs (ils gèrent les comptes dans Utilisateurs). */
  editorOnly?: boolean;
}

export interface NavSection {
  title: string | null;
  items: NavItem[];
}

/** Même organisation que le menu du back-office EasyAdmin. */
export const NAVIGATION: NavSection[] = [
  { title: null, items: [{ href: '/', label: 'Tableau de bord', icon: LayoutDashboard }] },
  {
    title: 'Contenu',
    items: [
      { href: '/articles', label: 'Articles', icon: Newspaper },
      { href: '/commentaires', label: 'Commentaires', icon: MessagesSquare },
      { href: '/categories', label: 'Catégories blog', icon: Folder },
      { href: '/tags', label: 'Tags', icon: Tags },
      { href: '/auteurs', label: 'Auteurs', icon: PenLine },
    ],
  },
  {
    title: 'Réalisations',
    items: [
      { href: '/projets', label: 'Projets', icon: Briefcase },
      { href: '/categories-projet', label: 'Catégories projet', icon: Layers },
    ],
  },
  {
    title: 'Services & Équipe',
    items: [
      { href: '/services', label: 'Services', icon: Settings },
      { href: '/equipe', label: 'Équipe', icon: Users },
      { href: '/temoignages', label: 'Témoignages', icon: Star },
      { href: '/faq', label: 'FAQ', icon: CircleHelp },
    ],
  },
  {
    title: 'Carrières',
    items: [
      { href: '/offres', label: "Offres d'emploi", icon: Briefcase },
      { href: '/candidatures', label: 'Candidatures', icon: UserRound },
    ],
  },
  { title: 'Messages', items: [{ href: '/messages', label: 'Messages contact', icon: Mail }] },
  {
    title: 'Compte',
    items: [
      { href: '/utilisateurs', label: 'Utilisateurs', icon: ShieldCheck, adminOnly: true },
      { href: '/profil', label: 'Mon profil', icon: CircleUser },
    ],
  },
];

/** Section du suivi de traduction (API) → écran d'édition. */
export const CONTENT_PATHS: Record<string, string> = {
  articles: '/articles',
  services: '/services',
  projects: '/projets',
  faqs: '/faq',
  categories: '/categories',
  tags: '/tags',
  authors: '/auteurs',
  projectCategories: '/categories-projet',
};
