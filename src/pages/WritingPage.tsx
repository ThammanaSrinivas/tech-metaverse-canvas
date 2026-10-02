import React from 'react';
import Page from '@/components/zen/Page';
import PostList from '@/components/PostList';
import { POSTS } from '@/content/writing';

const WritingPage: React.FC = () => (
  <Page id="writing">
    <section className="mx-auto w-full max-w-[1120px] px-5 pb-12 pt-8">
      {POSTS.length === 0 ? <p className="text-muted-foreground">First write-up coming soon.</p> : <PostList posts={POSTS} />}
    </section>
  </Page>
);

export default WritingPage;
