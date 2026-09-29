import React from 'react';
import { PROFILE } from '@/data/profile';
import { ZenMark } from '@/components/zen/primitives';

const Footer: React.FC = () => (
  <footer className="mx-auto w-full max-w-[1120px] px-5 pb-28 pt-8">
    <div className="relative flex items-center justify-center">
      <span className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
      <span className="relative bg-background px-4">
        <ZenMark size={28} title="" />
      </span>
    </div>
    <p className="zen-label mt-6 text-center text-muted-foreground">Less scrolling. More living.</p>
    <p className="mt-2 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} {PROFILE.name} · {PROFILE.location}
    </p>
  </footer>
);

export default Footer;
