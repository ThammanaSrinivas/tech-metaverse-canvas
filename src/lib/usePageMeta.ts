import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PROFILE, SITE_URL } from '@/data/profile';
import { plain } from '@/lib/rich';

const SITE = `${PROFILE.name}`;

const setMeta = (selector: string, attr: string, value: string) => document.querySelector(selector)?.setAttribute(attr, value);

/**
 * Per-page <title>, description and address, so shared links, tabs and search results say where
 * they point. Each page is its own canonical URL (not all pointing at the home page).
 */
export function usePageMeta(title: string | null, description?: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    const full = title ? `${plain(title)} · ${SITE}` : `${SITE} · I build innovative systems at scale`;
    const url = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
    document.title = full;
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:title"]', 'content', full);
    setMeta('meta[name="twitter:title"]', 'content', full);
    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[name="twitter:description"]', 'content', description);
    }
  }, [title, description, pathname]);
}
