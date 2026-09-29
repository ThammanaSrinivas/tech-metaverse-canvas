import React, { useState } from 'react';
import { Check, Copy, FileText, Github, Linkedin, Mail } from 'lucide-react';
import { LINKS, PROFILE } from '@/data/profile';
import { Reveal, Section, SectionHeader } from '@/components/zen/primitives';

const links = [
  { label: 'LinkedIn', href: LINKS.linkedin, icon: Linkedin },
  { label: 'GitHub', href: LINKS.github, icon: Github },
  { label: 'Resume', href: LINKS.resume, icon: FileText },
];

const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = LINKS.email;
    }
  };

  return (
    <Section id="contact">
      <SectionHeader index="06" title="Say hi" />
      <Reveal>
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[22px] border border-tint-line bg-tint p-7 md:p-10">
            <p className="zen-label text-primary">Open to conversations</p>
            <p className="mt-4 font-display text-3xl leading-tight md:text-4xl">
              Building something calm, or something that has to scale? Let's talk.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={LINKS.email}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <Mail className="h-4 w-4" /> Email me
              </a>
              <button
                onClick={copyEmail}
                className="inline-flex h-12 items-center gap-2 rounded-full border bg-card px-5 font-mono text-sm transition-colors hover:border-primary"
                aria-label="Copy email address"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                {copied ? 'copied' : PROFILE.email}
              </button>
            </div>
          </div>

          <ul className="grid gap-3">
            {links.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zen-tile flex h-full items-center gap-4 p-5 hover:border-primary/50"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-xl">{label}</span>
                  <span className="zen-label ml-auto text-muted-foreground">open ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
};

export default Contact;
