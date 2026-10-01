import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, FileText, Github, Linkedin, Mail } from 'lucide-react';
import { LINKS, PROFILE } from '@/data/profile';
import { Marker, Reveal, Section } from '@/components/zen/primitives';

/** "/in/thammanasrinivas" from a profile URL: the part people would type. */
const handleOf = (url: string) => new URL(url).pathname.replace(/\/$/, '');

const links = [
  { label: 'LinkedIn', href: LINKS.linkedin, icon: Linkedin, handle: handleOf(LINKS.linkedin) },
  { label: 'GitHub', href: LINKS.github, icon: Github, handle: handleOf(LINKS.github) },
  { label: 'Resume', href: LINKS.resume, icon: FileText, handle: 'PDF · Google Drive' },
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
    <Section id="contact" className="pt-8 md:pt-10">
      <Reveal>
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          {/* The invitation: an ink card in the palette's own light, the ask under the highlighter. */}
          <div className="dark relative overflow-hidden rounded-[28px] bg-background p-7 text-foreground md:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(60% 80% at 100% 0%, hsl(var(--primary) / .28), transparent 70%), radial-gradient(50% 60% at 0% 100%, hsl(var(--highlight) / .14), transparent 70%)',
              }}
            />
            <p className="relative zen-label text-primary">Open to conversations</p>
            <p className="relative mt-4 max-w-xl font-display text-h1">
              Building something that has to <span className="zen-accent">scale</span>? <Marker delay={0.4}>Let’s talk.</Marker>
            </p>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <a
                href={LINKS.email}
                data-magnet
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
              >
                <Mail className="h-4 w-4" /> Email me
              </a>
              <button
                onClick={copyEmail}
                data-magnet
                className="inline-flex h-12 items-center gap-2 rounded-full border border-foreground/20 px-5 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
                aria-label="Copy email address"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                {copied ? 'copied' : PROFILE.email}
              </button>
            </div>
          </div>

          <ul className="grid gap-3">
            {links.map(({ label, href, icon: Icon, handle }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="open"
                  className="zen-tile group flex h-full items-center gap-4 p-5 hover:border-primary/50"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-tint-line bg-tint text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-h3">{label}</span>
                    <span className="block truncate font-mono text-small text-muted-foreground">{handle}</span>
                  </span>
                  <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-highlight" />
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
