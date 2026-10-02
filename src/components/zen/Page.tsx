import React from 'react';
import { pageFor, type PageId } from '@/site/pages';
import { usePageMeta } from '@/lib/usePageMeta';
import { pageMeta } from '@/site/meta';
import { PageHeader } from './primitives';
import NextPage from './NextPage';

/** An inner page: meta, header from the site map, the content, then a pointer to the next page in the menu. */
const Page: React.FC<{ id: PageId; aside?: React.ReactNode; children: React.ReactNode }> = ({ id, aside, children }) => {
  const page = pageFor(id);
  usePageMeta(pageMeta(page));
  return (
    <>
      <PageHeader title={page.title} lead={page.lead} aside={aside} />
      {children}
      <NextPage after={id} />
    </>
  );
};

export default Page;
