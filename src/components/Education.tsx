import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { EDUCATION } from '@/data/profile';
import { Chapter } from '@/components/zen/primitives';

/** Degree, grade and the hackathon win from college: what a recruiter checks right after roles. */
const Education: React.FC = () => (
  <Chapter id="education" label="Education">
    <h3 className="text-h3">{EDUCATION.degree}</h3>
    <p className="mt-1 text-muted-foreground">
      {EDUCATION.school} · {EDUCATION.period} · {EDUCATION.grade}
    </p>
    <p className="mt-4 max-w-[60ch]">
      {EDUCATION.prize}{' '}
      <a href={EDUCATION.prizeUrl} target="_blank" rel="noopener noreferrer" className="zen-link inline-flex items-center gap-1 text-muted-foreground">
        Certificate <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </p>
  </Chapter>
);

export default Education;
