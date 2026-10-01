import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '@/components/zen/Link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Markdown from '@/components/Markdown';
import { MaskWords, maskStagger } from '@/components/zen/primitives';
import { postFor, readMinutes } from '@/content/writing';
import { PROFILE, formatDate } from '@/data/profile';
import { usePageMeta } from '@/lib/usePageMeta';
import { articleMeta, notFoundMeta } from '@/site/meta';
import NotFound from './NotFound';

/** One article: reading-width column, the site's type scale, draft notes called out. */
const WritingPost: React.FC = () => {
  const { slug } = useParams();
  const post = postFor(slug);
  const reduce = useReducedMotion();
  usePageMeta(post ? articleMeta(post) : notFoundMeta(`/writing/${slug}`));
  if (!post) return <NotFound />;

  return (
    <article className="mx-auto w-full max-w-[760px] px-5 pb-16 pt-32 md:pt-40">
      <Link to="/writing" className="zen-label inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Writing
      </Link>
      {post.draft && (
        <p className="mt-6 rounded-xl border border-dashed border-highlight bg-highlight/10 px-4 py-3 text-small">
          <span className="font-semibold">Draft.</span> Visible on localhost only; it ships when <code className="font-mono">draft</code> is set to{' '}
          <code className="font-mono">false</code> in <code className="font-mono">src/content/writing/index.ts</code>.
        </p>
      )}
      <p className="zen-label mt-8 text-muted-foreground">
        <span className="text-primary">{formatDate(post.date)}</span> · {readMinutes(post.body)} min read · {PROFILE.name}
      </p>
      <motion.h1 className="mt-4 text-title" variants={maskStagger} initial={reduce ? false : 'hidden'} animate="show">
        <MaskWords text={post.title} />
      </motion.h1>
      <p className="mt-5 text-lead text-muted-foreground">{post.summary}</p>
      <div className="mt-10 border-t pt-4">
        <Markdown>{post.body}</Markdown>
      </div>
      <div className="mt-16 border-t pt-8">
        <Link to="/writing" className="inline-flex items-center gap-2 font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" /> All writing
        </Link>
      </div>
    </article>
  );
};

export default WritingPost;
