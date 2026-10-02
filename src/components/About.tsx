import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { BEYOND, LINKS, PROFILE, SPEAKING } from '@/data/profile';
import { Chapter, Marker } from '@/components/zen/primitives';

/** The one story with a photo: the Toastmasters win. The page's single highlighter is on it. */
const Speaking: React.FC = () => (
  <Chapter id="speaking" label="Speaking">
    <div className="grid gap-8 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:gap-10">
      <img
        src={SPEAKING.photo}
        alt={SPEAKING.alt}
        width={320}
        height={400}
        loading="lazy"
        className="w-full max-w-[320px] rounded-[20px] border object-cover"
      />
      <div className="max-w-[60ch]">
        <p className="text-small text-muted-foreground">
          {SPEAKING.org} · {SPEAKING.level}
        </p>
        <h2 className="mt-2 text-h2">
          <Marker>{SPEAKING.mark}</Marker> {SPEAKING.title}
        </h2>
        <p className="mt-4">{SPEAKING.body}</p>
        <a href={SPEAKING.post} target="_blank" rel="noopener noreferrer" className="zen-link mt-5 inline-flex items-center gap-1 font-semibold">
          The LinkedIn post <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  </Chapter>
);

/** The rest, one line each. */
const Also: React.FC = () => (
  <Chapter id="also" label="Also">
    <dl className="divide-y border-b [&>*:first-child]:pt-0">
      {BEYOND.map((b) => (
        <div key={b.title} className="grid gap-1 py-4 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-8">
          <dt className="font-semibold">{b.title}</dt>
          <dd className="text-muted-foreground">{b.body}</dd>
        </div>
      ))}
    </dl>
  </Chapter>
);

const handleOf = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/** How to reach me. Email first: it is the quickest, and it can be copied in one tap. */
const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = LINKS.email;
    }
  };
  const rows = [
    { label: 'LinkedIn', href: LINKS.linkedin, value: handleOf(LINKS.linkedin) },
    { label: 'GitHub', href: LINKS.github, value: handleOf(LINKS.github) },
    { label: 'Résumé', href: LINKS.resume, value: 'PDF on Google Drive' },
  ];
  return (
    <Chapter id="contact" label="Get in touch">
      <p className="max-w-[60ch] text-lead">Email is the quickest way to reach me.</p>
      <dl className="mt-6 divide-y border-y">
        <div className="grid gap-1 py-4 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:items-center md:gap-8">
          <dt className="font-semibold">Email</dt>
          <dd className="flex flex-wrap items-center gap-3">
            <a href={LINKS.email} className="zen-link">
              {PROFILE.email}
            </a>
            <button
              type="button"
              onClick={copy}
              aria-label="Copy email address"
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-small text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </dd>
        </div>
        {rows.map((r) => (
          <div key={r.label} className="grid gap-1 py-4 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-8">
            <dt className="font-semibold">{r.label}</dt>
            <dd>
              <a href={r.href} target="_blank" rel="noopener noreferrer" className="zen-link inline-flex items-center gap-1 text-muted-foreground">
                {r.value} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </Chapter>
  );
};

const About: React.FC = () => (
  <>
    <Speaking />
    <Also />
    <Contact />
  </>
);

export default About;
