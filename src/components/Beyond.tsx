import React from 'react';
import { ArrowUpRight, Mic } from 'lucide-react';
import { BEYOND, JOURNEY, SPEAKING, formatDate } from '@/data/profile';
import { Marker, Reveal, Section, SectionHeader } from '@/components/zen/primitives';

/** The featured story: a photo and the moment behind it. */
const SpeakingStory: React.FC = () => (
  <Reveal>
    <article className="zen-tile grid overflow-hidden md:grid-cols-[minmax(0,360px)_1fr]">
      <div className="relative bg-secondary">
        <img
          src={SPEAKING.photo}
          alt={SPEAKING.alt}
          width={360}
          height={450}
          loading="lazy"
          className="h-full max-h-[460px] w-full object-cover"
        />
        <span className="zen-pill absolute left-4 top-4 border-white/30 bg-black/45 text-white">
          <Mic className="h-3 w-3" /> {SPEAKING.org}
        </span>
      </div>
      <div className="flex flex-col p-6 md:p-10">
        <p className="zen-label text-primary">{SPEAKING.level}</p>
        <h2 className="mt-4 text-h1">
          <Marker>{SPEAKING.mark}</Marker> {SPEAKING.title}
        </h2>
        <p className="mt-5 max-w-xl text-lead text-muted-foreground">{SPEAKING.body}</p>
        <a
          href={SPEAKING.post}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="view"
          className="group mt-auto inline-flex items-center gap-2 pt-8 font-semibold text-primary"
        >
          Read the LinkedIn post
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </article>
  </Reveal>
);

/** Building in public: a vertical timeline, oldest first, each moment linking to its post. */
const Journey: React.FC = () => (
  <Section id="journey" className="pt-0 md:pt-0">
    <SectionHeader title="Building *in public*" kicker="Every moment here has a public post behind it." />
    <ol className="relative ml-2 border-l md:ml-4">
      {JOURNEY.map((m, i) => (
        <Reveal key={m.post} delay={0.04 * i}>
          <li className={`relative pl-7 md:pl-10 ${i === JOURNEY.length - 1 ? '' : 'pb-10'}`}>
            <span
              aria-hidden
              className={`absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background ${
                i === JOURNEY.length - 1 ? 'bg-highlight' : 'bg-primary'
              }`}
            />
            <a href={m.post} target="_blank" rel="noopener noreferrer" data-cursor="view" className="group block max-w-2xl">
              <p className="zen-label text-muted-foreground">
                <span className="text-primary">{formatDate(m.date)}</span> · {m.kind}
              </p>
              <p className="mt-1.5 font-display text-h3 transition-colors group-hover:text-primary">
                {m.title}
                <ArrowUpRight className="ml-1 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </p>
              <p className="mt-1 text-small text-muted-foreground">{m.body}</p>
            </a>
          </li>
        </Reveal>
      ))}
    </ol>
  </Section>
);

/** Leadership, speaking and community: the part of a senior engineer a job card doesn't show. */
const Beyond: React.FC = () => (
  <>
    <Section id="speaking" className="pt-8 md:pt-10">
      <SpeakingStory />
    </Section>
    <Section id="beyond" className="pt-0 md:pt-0">
      <SectionHeader title="Also" />
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {BEYOND.map((b, i) => (
          <Reveal key={b.title} delay={0.05 * i} className="h-full">
            <div className="zen-tile h-full p-6">
              <p className="zen-label text-primary">{b.label}</p>
              <h3 className="mt-4 text-h3">{b.title}</h3>
              <p className="mt-2 text-muted-foreground">{b.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
    <Journey />
  </>
);

export default Beyond;
