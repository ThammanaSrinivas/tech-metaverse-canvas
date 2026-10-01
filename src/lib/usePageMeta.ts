import { useEffect } from 'react';
import { applyMetaToDocument, type Meta } from '@/site/meta';

/**
 * Per-page <title>, description, address and social card, so tabs and search results say where
 * they point. The values come from src/site/meta.ts, which the build also bakes into each page's
 * HTML for link previews; this keeps the document in step as you navigate.
 */
export function usePageMeta({ path, title, description, image, type }: Meta) {
  useEffect(() => {
    applyMetaToDocument({ path, title, description, image, type });
  }, [path, title, description, image, type]);
}
