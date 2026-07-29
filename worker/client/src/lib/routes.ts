/**
 * Views that can be addressed by URL.
 *
 * navigate() pushes real paths like /article/23, so the app has to be able to
 * read them back on load. Without that, a refresh or a shared link silently
 * lands on the Dashboard while the address bar still shows the article.
 */
export const ROUTABLE_VIEWS = [
  'home',
  'guide',
  'categories',
  'category',
  'article',
  'checklist',
  'resources',
  'contacts',
  'policies',
  'search',
  'submit',
  'moderate',
  'admin',
] as const;

export interface Route {
  view: string;
  param: string | null;
}

const FALLBACK: Route = { view: 'home', param: null };

export function routeFromPath(pathname: string): Route {
  try {
    const parts = (pathname || '/').split('/').filter(Boolean);
    if (parts.length === 0) return { ...FALLBACK };
    const view = decodeURIComponent(parts[0]);
    if ((ROUTABLE_VIEWS as readonly string[]).indexOf(view) === -1) return { ...FALLBACK };
    return { view, param: parts.length > 1 ? decodeURIComponent(parts[1]) : null };
  } catch {
    return { ...FALLBACK };
  }
}

/** Document titles per view. Absent entries fall back to the site name. */
export const VIEW_TITLES: Record<string, string> = {
  home: 'Toledo Athletics Onboarding',
  guide: 'My Onboarding — Toledo Athletics',
  categories: 'Browse Categories — Toledo Athletics',
  checklist: 'My Onboarding — Toledo Athletics',
  resources: 'Resources & Systems — Toledo Athletics',
  contacts: 'Key Contacts — Toledo Athletics',
  policies: 'Policies & Procedures — Toledo Athletics',
  search: 'Search — Toledo Athletics',
  submit: 'Contribute — Toledo Athletics',
  moderate: 'Moderation — Toledo Athletics',
  admin: 'Admin — Toledo Athletics',
  article: 'Article — Toledo Athletics',
  category: 'Browse — Toledo Athletics',
};
