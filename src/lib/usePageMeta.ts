import { useEffect } from 'react';
import { PROFILE } from '@/data/profile';
import { plain } from '@/lib/rich';

const SITE = `${PROFILE.name}`;

/** Per-page <title> and description, so shared links and tabs say where they point. */
export function usePageMeta(title: string | null, description?: string) {
  useEffect(() => {
    document.title = title ? `${plain(title)} · ${SITE}` : `${SITE} · I build innovative systems at scale`;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
