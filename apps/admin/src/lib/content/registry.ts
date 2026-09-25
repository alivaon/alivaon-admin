import { defineContentType, type ContentType, type FieldDef, type Schemas } from './types';

/*
 * Description des 11 contenus traduisibles. Libellés, aides, onglets et
 * valeurs par défaut : ceux d'EasyAdmin (src/Controller/Admin/*CrudController
 * et src/Form/Admin/*TranslationType d'alivaon-symfony), pour que les
 * rédacteurs retrouvent le même formulaire.
 */

const TRANSLATION_PUBLISHED = 'Traduction publiée';
const HELP_404 = "Une traduction non publiée renvoie un 404 sur son URL, sans fallback vers l'autre langue.";
const slugHelp = (source: 'titre' | 'nom' | 'poste', what = 'la traduction') =>
  `Généré depuis le ${source}, modifiable tant que ${what} n'est pas publiée.`;
const GENERAL = 'Informations générales';

const metaFields = {
  metaTitle: { label: 'Meta title (SEO)', kind: 'text' },
  metaDescription: { label: 'Meta description (SEO)', kind: 'textarea', rows: 2 },
} satisfies Record<string, FieldDef>;

const stepFields = (content: 'Contenu' | 'Texte') =>
  Object.fromEntries(
    [1, 2, 3, 4].flatMap((step) => [
      [`step${step}Title`, { label: `Étape ${step} - Titre`, kind: 'text' }],
      [`step${step}Content`, { label: `Étape ${step} - ${content}`, kind: 'textarea', rows: 3 }],
    ]),
  ) as Record<`step${1 | 2 | 3 | 4}${'Title' | 'Content'}`, FieldDef>;

const displayOrder = (label: string, tab?: string): FieldDef => ({ label, kind: 'number', min: 0, tab });

const articles = defineContentType<Schemas['AdminArticle-admin.write'], Schemas['AdminArticleTranslation-admin.write_noid']>({
  slug: 'articles',
  endpoint: '/api/admin/articles',
  title: 'Articles',
  description: 'Articles du blog.',
  newLabel: 'Nouvel article',
  singular: 'Article',
  labelField: 'title',
  slugSource: 'title',
  columns: [
    { label: 'Titre (FR)', kind: 'label' },
    { label: 'Traduction EN', kind: 'en-status' },
    { label: 'Catégorie', kind: 'relation', field: 'category', relation: 'categories' },
    { label: 'Publié', kind: 'boolean', field: 'isPublished' },
    { label: 'Vues', kind: 'number', field: 'viewsCount' },
  ],
  booleanFilters: [{ field: 'isPublished', label: 'Publication', yes: 'Publiés', no: 'Non publiés' }],
  fields: {
    author: { label: 'Auteur', kind: 'relation', relation: 'authors', required: true, placeholder: '— Choisir —', tab: GENERAL },
    category: { label: 'Catégorie', kind: 'relation', relation: 'categories', placeholder: '— Aucune —', tab: GENERAL },
    tags: { label: 'Tags', kind: 'relation', relation: 'tags', many: true, tab: GENERAL },
    readingTime: { label: 'Temps de lecture (min)', kind: 'number', min: 1, nullable: true, help: "Affiché dans l'en-tête de l'article. Défaut : 6 min.", tab: GENERAL },
    publishedAt: { label: 'Publié le', kind: 'datetime', tab: GENERAL },
    isPublished: {
      label: 'Publié (interrupteur global)',
      kind: 'switch',
      help: "Décoché : l'article disparaît dans toutes les langues, quel que soit l'état de chaque traduction.",
      tab: GENERAL,
    },
    featuredImageName: {
      label: 'Image à la une (bannière)',
      kind: 'image',
      directory: 'articles',
      help: "Grande image en haut de l'article. Les images dans le corps du texte s'insèrent directement via l'éditeur.",
      tab: 'Image',
    },
  },
  defaults: { isPublished: false, tags: [] },
  translationFields: {
    title: { label: 'Titre', kind: 'text', required: true },
    slug: { label: 'Slug', kind: 'text', help: slugHelp('titre') },
    excerpt: { label: 'Résumé (extrait des listes)', kind: 'textarea', rows: 3 },
    content: { label: 'Contenu', kind: 'richtext', required: true },
    metaTitle: { ...metaFields.metaTitle, help: 'Si vide, le titre est utilisé.' },
    metaDescription: { ...metaFields.metaDescription, help: 'Si vide, le résumé est utilisé. 150–160 caractères recommandés.' },
  },
  published: { label: TRANSLATION_PUBLISHED, help: HELP_404 },
});

const authors = defineContentType<Schemas['AdminAuthor-admin.write'], Schemas['AdminAuthorTranslation-admin.write_noid']>({
  slug: 'auteurs',
  endpoint: '/api/admin/authors',
  title: 'Auteurs',
  description: 'Signatures des articles du blog.',
  newLabel: 'Nouvel auteur',
  singular: 'Auteur',
  labelField: 'name',
  slugSource: 'name',
  columns: [
    { label: 'Nom (FR)', kind: 'label' },
    { label: 'Traduction EN', kind: 'en-status' },
  ],
  booleanFilters: [],
  fields: {
    avatarName: { label: 'Avatar', kind: 'image', directory: 'authors', tab: GENERAL },
    socialLinks: { label: 'Liens sociaux', kind: 'links', help: 'Ajoutez les URLs des réseaux sociaux.', tab: GENERAL },
  },
  defaults: {},
  translationFields: {
    name: {
      label: 'Nom affiché',
      kind: 'text',
      required: true,
      help: "Un nom de personne se recopie à l'identique ; une signature collective se traduit (« Équipe Alivaon » / « Alivaon Team »).",
    },
    slug: { label: 'Slug', kind: 'text', help: `${slugHelp('nom')} Aucune page d'auteur ne l'utilise aujourd'hui.` },
    bio: { label: 'Biographie', kind: 'textarea', rows: 4 },
  },
  published: { label: TRANSLATION_PUBLISHED, help: 'Non publiée, cette langue retombe sur la signature française sous les articles.' },
});

const taxonomy = (
  slug: string,
  endpoint: string,
  title: string,
  description: string,
  newLabel: string,
  singular: string,
  feminine: boolean,
  publishedHelp: string,
): Pick<ContentType, 'slug' | 'endpoint' | 'title' | 'description' | 'newLabel' | 'singular' | 'feminine' | 'columns' | 'booleanFilters' | 'defaults'> & {
  published: { label: string; help: string };
} => ({
  slug,
  endpoint,
  title,
  description,
  newLabel,
  singular,
  feminine,
  columns: [
    { label: 'Nom (FR)', kind: 'label' },
    { label: 'Traduction EN', kind: 'en-status' },
  ],
  booleanFilters: [],
  defaults: {},
  published: { label: TRANSLATION_PUBLISHED, help: publishedHelp },
});

const categories = defineContentType<Schemas['AdminCategory-admin.write'], Schemas['AdminCategoryTranslation-admin.write_noid']>({
  ...taxonomy(
    'categories',
    '/api/admin/categories',
    'Catégories blog',
    'Catégories des articles.',
    'Nouvelle catégorie',
    'Catégorie',
    true,
    "Non publiée : la catégorie n'a pas d'URL de filtre dans cette langue et disparaît de sa navigation. Son nom retombe sur le français là où il est simplement affiché.",
  ),
  labelField: 'name',
  slugSource: 'name',
  fields: {},
  translationFields: {
    name: { label: 'Nom', kind: 'text', required: true },
    slug: { label: 'Slug', kind: 'text', help: slugHelp('nom') },
    description: { label: 'Description', kind: 'textarea', rows: 3, help: 'Affichée en tête de la page de filtre /blog/category/…' },
  },
});

const tags = defineContentType<Schemas['AdminTag-admin.write'], Schemas['AdminTagTranslation-admin.write_noid']>({
  ...taxonomy(
    'tags',
    '/api/admin/tags',
    'Tags',
    'Mots-clés des articles.',
    'Nouveau tag',
    'Tag',
    false,
    "Non publiée : le tag n'a pas d'URL de filtre dans cette langue et disparaît de sa navigation. Son nom retombe sur le français là où il est simplement affiché.",
  ),
  labelField: 'name',
  slugSource: 'name',
  fields: {},
  translationFields: {
    name: { label: 'Nom', kind: 'text', required: true },
    slug: { label: 'Slug', kind: 'text', help: slugHelp('nom') },
  },
});

const projectCategories = defineContentType<Schemas['AdminProjectCategory-admin.write'], Schemas['AdminProjectCategoryTranslation-admin.write_noid']>({
  ...taxonomy(
    'categories-projet',
    '/api/admin/project-categories',
    'Catégories projet',
    'Filtres du portfolio.',
    'Nouvelle catégorie',
    'Catégorie',
    true,
    'Non publiée : la catégorie disparaît des filtres du portfolio dans cette langue. Son nom retombe sur le français là où il est simplement affiché.',
  ),
  labelField: 'name',
  slugSource: 'name',
  fields: {},
  translationFields: {
    name: { label: 'Nom', kind: 'text', required: true },
    slug: { label: 'Slug', kind: 'text', help: slugHelp('nom') },
  },
});

const projects = defineContentType<Schemas['AdminProject-admin.write'], Schemas['AdminProjectTranslation-admin.write_noid']>({
  slug: 'projets',
  endpoint: '/api/admin/projects',
  title: 'Projets',
  description: 'Réalisations du portfolio.',
  newLabel: 'Nouveau projet',
  singular: 'Projet',
  labelField: 'title',
  slugSource: 'title',
  columns: [
    { label: 'Titre (FR)', kind: 'label' },
    { label: 'Traduction EN', kind: 'en-status' },
    { label: 'Catégorie', kind: 'relation', field: 'category', relation: 'project-categories' },
    { label: 'Mis en avant', kind: 'boolean', field: 'isFeatured' },
    { label: 'Publié', kind: 'boolean', field: 'isActive' },
    { label: 'Ordre', kind: 'number', field: 'displayOrder' },
  ],
  booleanFilters: [
    { field: 'isActive', label: 'Publication', yes: 'Publiés', no: 'Non publiés' },
    { field: 'isFeatured', label: 'Mise en avant', yes: 'Mis en avant', no: 'Non mis en avant' },
  ],
  fields: {
    client: { label: 'Client', kind: 'text', tab: GENERAL },
    location: { label: 'Lieu', kind: 'text', help: 'Affiché dans la fiche projet. Défaut : "Douala, Cameroun".', tab: GENERAL },
    projectUrl: { label: 'URL du projet', kind: 'url', tab: GENERAL },
    category: { label: 'Catégorie', kind: 'relation', relation: 'project-categories', placeholder: '— Aucune —', tab: GENERAL },
    technologies: { label: 'Technologies', kind: 'list', itemLabel: 'Technologie', tab: GENERAL },
    completedAt: { label: 'Date de réalisation', kind: 'date', tab: GENERAL },
    isFeatured: { label: 'Mis en avant', kind: 'switch', tab: GENERAL },
    isActive: { label: 'Publié', kind: 'switch', tab: GENERAL },
    displayOrder: displayOrder("Ordre d'affichage", GENERAL),
    featuredImageName: { label: 'Image principale (bannière)', kind: 'image', directory: 'projects', tab: 'Images' },
    image2Name: { label: 'Image 2 (grande, section centrale)', kind: 'image', directory: 'projects', tab: 'Images' },
    image3Name: { label: 'Image 3 (petite, section centrale)', kind: 'image', directory: 'projects', tab: 'Images' },
    image4Name: { label: 'Image 4 (pleine largeur, bas de page)', kind: 'image', directory: 'projects', tab: 'Images' },
  },
  defaults: { isActive: true, isFeatured: false, displayOrder: 0 },
  translationFields: {
    title: { label: 'Titre', kind: 'text', required: true },
    slug: { label: 'Slug', kind: 'text', help: slugHelp('titre') },
    description: { label: 'Description (Contexte & Défi - §1)', kind: 'richtext' },
    challenge: { label: 'Challenge (Contexte & Défi - §2)', kind: 'textarea', rows: 3 },
    approach: { label: 'Solution mise en place (§1)', kind: 'textarea', rows: 3 },
    approachDetail: { label: 'Solution mise en place (§2)', kind: 'textarea', rows: 3 },
    results: { label: "Impact sur l'entreprise", kind: 'richtext' },
    ...stepFields('Contenu'),
    ...metaFields,
  },
  published: { label: TRANSLATION_PUBLISHED },
});

const PILLARS = [
  { value: 1, label: '1 - Logiciels de gestion sur mesure' },
  { value: 2, label: '2 - Sites web & Applications' },
  { value: 3, label: '3 - Croissance & Visibilité' },
  { value: 4, label: '4 - Accompagnement & services récurrents' },
];

const services = defineContentType<Schemas['AdminService-admin.write'], Schemas['AdminServiceTranslation-admin.write_noid']>({
  slug: 'services',
  endpoint: '/api/admin/services',
  title: 'Services',
  description: 'Offres présentées sur le site.',
  newLabel: 'Nouveau service',
  singular: 'Service',
  labelField: 'title',
  slugSource: 'title',
  columns: [
    { label: 'Titre (FR)', kind: 'label' },
    { label: 'Traduction EN', kind: 'en-status' },
    { label: 'Actif', kind: 'boolean', field: 'isActive' },
    { label: 'Ordre', kind: 'number', field: 'displayOrder' },
  ],
  booleanFilters: [{ field: 'isActive', label: 'Statut', yes: 'Actifs', no: 'Inactifs' }],
  fields: {
    icon: { label: 'Icône (classe CSS)', kind: 'text', tab: GENERAL },
    pillar: { label: 'Pilier', kind: 'select', options: PILLARS, placeholder: '- Non classé -', tab: GENERAL },
    displayOrder: displayOrder("Ordre d'affichage", GENERAL),
    isActive: { label: 'Actif', kind: 'switch', tab: GENERAL },
    featuredImageName: { label: 'Image principale (fond haut de page)', kind: 'image', directory: 'services', tab: 'Images' },
    image2Name: {
      label: 'Image de fond (bas de page)',
      kind: 'image',
      directory: 'services',
      help: 'Image de fond de la bande décorative en bas de page.',
      tab: 'Images',
    },
  },
  defaults: { isActive: true, displayOrder: 0 },
  translationFields: {
    title: { label: 'Titre', kind: 'text', required: true },
    slug: { label: 'Slug', kind: 'text', help: slugHelp('titre') },
    shortDescription: { label: 'Description courte', kind: 'textarea', rows: 2, help: 'Listes de services et métas SEO (max 500 caractères).' },
    fullDescription: { label: 'Description complète', kind: 'richtext' },
    features: { label: 'Points forts (liste en haut de page)', kind: 'list', itemLabel: 'Point fort' },
    badge: { label: 'Badge (ex : NOUVEAU, ⭐)', kind: 'text' },
    ...stepFields('Texte'),
    whyTitle1: { label: 'Pourquoi Alivaon - Titre principal', kind: 'text' },
    whyText1: { label: 'Pourquoi Alivaon - Texte principal', kind: 'textarea', rows: 3 },
    whyTitle2: { label: 'Pourquoi Alivaon - Titre secondaire', kind: 'text' },
    whyText2: { label: 'Pourquoi Alivaon - Texte secondaire', kind: 'textarea', rows: 3 },
    whyPoints: { label: 'Points différenciants (liste à puces)', kind: 'list', itemLabel: 'Point' },
    ...metaFields,
  },
  published: { label: TRANSLATION_PUBLISHED },
});

const team = defineContentType<Schemas['AdminTeamMember-admin.write'], Schemas['AdminTeamMemberTranslation-admin.write_noid']>({
  slug: 'equipe',
  endpoint: '/api/admin/team-members',
  title: 'Équipe',
  description: "Membres de l'équipe Alivaon.",
  newLabel: 'Nouveau membre',
  singular: 'Membre',
  labelField: 'position',
  mainLabelField: 'fullName',
  slugSource: 'position',
  columns: [
    { label: 'Nom complet', kind: 'text', field: 'fullName' },
    { label: 'Poste (FR)', kind: 'label' },
    { label: 'Traduction EN', kind: 'en-status' },
    { label: 'Actif', kind: 'boolean', field: 'isActive' },
    { label: 'Ordre', kind: 'number', field: 'displayOrder' },
  ],
  booleanFilters: [{ field: 'isActive', label: 'Statut', yes: 'Actifs', no: 'Inactifs' }],
  fields: {
    fullName: { label: 'Nom complet', kind: 'text', required: true, tab: GENERAL },
    email: { label: 'Email', kind: 'email', tab: GENERAL },
    displayOrder: displayOrder("Ordre d'affichage", GENERAL),
    isActive: { label: 'Actif', kind: 'switch', tab: GENERAL },
    photoName: { label: 'Photo', kind: 'image', directory: 'team', tab: 'Photo & Réseaux' },
    socialLinks: {
      label: 'Réseaux sociaux',
      kind: 'links',
      keys: ['facebook', 'twitter', 'linkedin', 'instagram', 'github'],
      help: 'Clés acceptées : facebook, twitter, linkedin, instagram, github. Ex : facebook → https://...',
      tab: 'Photo & Réseaux',
    },
  },
  defaults: { isActive: true, displayOrder: 0, fullName: '' },
  translationFields: {
    position: { label: 'Poste', kind: 'text', required: true },
    slug: { label: 'Slug', kind: 'text', help: slugHelp('poste', 'la fiche') },
    bio: { label: 'Biographie - §1', kind: 'textarea', rows: 4 },
    bio2: { label: 'Biographie - §2', kind: 'textarea', rows: 4 },
    bio3: { label: 'Biographie - §3', kind: 'textarea', rows: 4 },
  },
  published: { label: 'Fiche publiée', help: "Une fiche non publiée renvoie un 404 sur son URL, sans fallback vers l'autre langue." },
});

const testimonials = defineContentType<Schemas['AdminTestimonial-admin.write'], Schemas['AdminTestimonialTranslation-admin.write_noid']>({
  slug: 'temoignages',
  endpoint: '/api/admin/testimonials',
  title: 'Témoignages',
  description: 'Avis clients.',
  newLabel: 'Nouveau témoignage',
  singular: 'Témoignage',
  labelField: 'content',
  mainLabelField: 'clientName',
  slugSource: null,
  columns: [
    { label: 'Nom client', kind: 'text', field: 'clientName' },
    { label: 'Entreprise', kind: 'text', field: 'clientCompany' },
    { label: 'Témoignage (FR)', kind: 'label' },
    { label: 'Traduction EN', kind: 'en-status' },
    { label: 'Note', kind: 'number', field: 'rating' },
    { label: 'Mis en avant', kind: 'boolean', field: 'isFeatured' },
    { label: 'Ordre', kind: 'number', field: 'displayOrder' },
  ],
  booleanFilters: [{ field: 'isFeatured', label: 'Mise en avant', yes: 'Mis en avant', no: 'Non mis en avant' }],
  fields: {
    clientName: { label: 'Nom client', kind: 'text', required: true, tab: GENERAL },
    clientCompany: { label: 'Entreprise', kind: 'text', tab: GENERAL },
    rating: { label: 'Note (1-5)', kind: 'number', min: 1, max: 5, tab: GENERAL },
    avatarName: { label: 'Avatar', kind: 'image', directory: 'testimonials', tab: GENERAL },
    isFeatured: { label: 'Mis en avant', kind: 'switch', tab: GENERAL },
    displayOrder: displayOrder('Ordre', GENERAL),
  },
  defaults: { rating: 5, isFeatured: false, displayOrder: 0, clientName: '' },
  translationFields: {
    content: { label: 'Témoignage', kind: 'textarea', rows: 5, required: true },
    clientPosition: { label: 'Fonction du client', kind: 'text', help: 'Ex. « Gérante », « Directeur financier ». Le nom et la société ne se traduisent pas.' },
  },
  published: { label: TRANSLATION_PUBLISHED, help: "Un témoignage non traduit n'apparaît pas sur les pages de cette langue." },
});

const FAQ_CATEGORIES = [
  { value: 'General', label: 'Général' },
  { value: 'Service', label: 'Service' },
  { value: 'Pricing', label: 'Tarifs' },
  { value: 'Support', label: 'Support' },
];

const faqs = defineContentType<Schemas['AdminFaq-admin.write'], Schemas['AdminFaqTranslation-admin.write_noid']>({
  slug: 'faq',
  endpoint: '/api/admin/faqs',
  title: 'FAQ',
  description: 'Questions fréquentes.',
  newLabel: 'Nouvelle question',
  singular: 'Question',
  feminine: true,
  labelField: 'question',
  slugSource: null,
  columns: [
    { label: 'Question (FR)', kind: 'label' },
    { label: 'Traduction EN', kind: 'en-status' },
    { label: 'Catégorie', kind: 'text', field: 'category' },
    { label: 'Ordre', kind: 'number', field: 'displayOrder' },
    { label: 'Actif', kind: 'boolean', field: 'isActive' },
  ],
  booleanFilters: [{ field: 'isActive', label: 'Statut', yes: 'Actives', no: 'Inactives' }],
  fields: {
    category: { label: 'Catégorie', kind: 'select', options: FAQ_CATEGORIES, tab: GENERAL },
    displayOrder: displayOrder('Ordre', GENERAL),
    isActive: { label: 'Actif', kind: 'switch', tab: GENERAL },
  },
  defaults: { category: 'General', displayOrder: 0, isActive: true },
  translationFields: {
    question: { label: 'Question', kind: 'textarea', rows: 2, required: true },
    // Texte brut : le site affiche la réponse échappée (comme le Twig), l'éditeur
    // riche d'EasyAdmin y aurait fait apparaître des balises.
    answer: { label: 'Réponse', kind: 'textarea', rows: 6, required: true },
  },
  published: { label: TRANSLATION_PUBLISHED, help: "Une traduction non publiée n'apparaît pas sur la page FAQ de cette langue." },
});

const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Freelance', 'Télétravail'].map((value) => ({ value, label: value }));

const jobOffers = defineContentType<Schemas['AdminJobOffer-admin.write'], Schemas['AdminJobOfferTranslation-admin.write_noid']>({
  slug: 'offres',
  endpoint: '/api/admin/job-offers',
  title: "Offres d'emploi",
  description: 'Offres publiées sur la page Carrières.',
  newLabel: 'Nouvelle offre',
  singular: 'Offre',
  feminine: true,
  labelField: 'title',
  slugSource: 'title',
  columns: [
    { label: 'Titre (FR)', kind: 'label' },
    { label: 'Traduction EN', kind: 'en-status' },
    { label: 'Contrat', kind: 'text', field: 'contractType' },
    { label: 'Lieu', kind: 'text', field: 'location' },
    { label: 'Publiée', kind: 'boolean', field: 'isPublished' },
    { label: 'Expire le', kind: 'datetime', field: 'expiresAt' },
  ],
  booleanFilters: [{ field: 'isPublished', label: 'Publication', yes: 'Publiées', no: 'Non publiées' }],
  fields: {
    contractType: { label: 'Type de contrat', kind: 'select', options: CONTRACT_TYPES, tab: GENERAL },
    location: { label: 'Lieu / Ville', kind: 'text', tab: GENERAL },
    isPublished: {
      label: "Publier l'offre",
      kind: 'switch',
      help: 'La date de publication est enregistrée automatiquement à la 1ère publication.',
      tab: 'Publication & Visibilité',
    },
    publishedAt: { label: 'Date de publication', kind: 'datetime', tab: 'Publication & Visibilité' },
    expiresAt: { label: "Date d'expiration", kind: 'datetime', help: "L'offre n'apparaîtra plus sur le site après cette date.", tab: 'Publication & Visibilité' },
    coverImageName: { label: 'Image de couverture', kind: 'image', directory: 'job_covers', tab: 'Image de couverture' },
  },
  defaults: { contractType: 'CDI', isPublished: false },
  translationFields: {
    title: { label: 'Titre du poste', kind: 'text', required: true },
    slug: { label: 'Slug', kind: 'text', help: slugHelp('titre') },
    shortDescription: { label: 'Description courte', kind: 'textarea', rows: 2, help: 'Affichée dans la liste des offres (max 500 caractères).' },
    description: { label: 'Description du poste', kind: 'richtext', required: true },
    salary: { label: 'Salaire', kind: 'text', help: 'Fourchette ou mention libre (ex. « Selon profil »).' },
    skills: { label: 'Compétences requises', kind: 'list', itemLabel: 'Compétence' },
  },
  published: { label: TRANSLATION_PUBLISHED, help: HELP_404 },
});

export const CONTENT_TYPES: ContentType[] = [articles, authors, categories, tags, projects, projectCategories, services, team, testimonials, faqs, jobOffers];

export function contentType(slug: string): ContentType | undefined {
  return CONTENT_TYPES.find((type) => type.slug === slug);
}
