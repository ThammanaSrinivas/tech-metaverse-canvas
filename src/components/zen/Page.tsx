import React from 'react';
import { pageFor, type PageId } from '@/site/pages';
import { usePageMeta } from '@/lib/usePageMeta';
import { PageHeader } from './primitives';
import NextPage from './NextPage';

/** An inner page: meta, header from the site map, the content, then a pointer to the next page. */
const Page: React.FC<{ id: PageId; children: React.ReactNode }> = ({ id, children }) => {
  const page = pageFor(id);
  usePageMeta(page.title, page.lead);
  return (
    <>
      <PageHeader index={page.index} label={page.label} title={page.title} lead={page.lead} />
      {children}
      <NextPage after={id} />
    </>
  );
};

export default Page;
