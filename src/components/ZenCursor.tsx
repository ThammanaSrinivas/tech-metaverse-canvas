import { useEffect } from 'react';
import { mountZenCursor } from '@/lib/zenCursor';

/** Mounts the zenmodeos.com pointer for the life of the page (mouse devices only). */
const ZenCursor = () => {
  useEffect(() => mountZenCursor() ?? undefined, []);
  return null;
};

export default ZenCursor;
