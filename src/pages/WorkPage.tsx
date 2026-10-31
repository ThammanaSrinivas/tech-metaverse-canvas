import { ArrowUpRight } from 'lucide-react';
import Page from '@/components/zen/Page';
import WorkExperience from '@/components/WorkExperience';
import Education from '@/components/Education';
import Principles from '@/components/Principles';
import TechnicalSkills from '@/components/TechnicalSkills';
import SideProjects from '@/components/SideProjects';
import { LINKS, PROFILE } from '@/data/profile';

/** Under the title: what a recruiter reaches for next, before reading a word of the roles. */
const Reach = () => (
  <p className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-semibold">
    <a href={LINKS.resume} target="_blank" rel="noopener noreferrer" className="zen-link inline-flex items-center gap-1">
      Résumé <ArrowUpRight aria-hidden className="h-4 w-4" />
    </a>
    <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="zen-link inline-flex items-center gap-1">
      LinkedIn <ArrowUpRight aria-hidden className="h-4 w-4" />
    </a>
    <a href={LINKS.email} className="zen-link font-normal text-muted-foreground">
      {PROFILE.email}
    </a>
  </p>
);

// Roles first, then how I build and with what, then the smaller things; education closes it.
const WorkPage = () => (
  <Page id="work" header={<Reach />}>
    <WorkExperience />
    <Principles />
    <TechnicalSkills />
    <SideProjects />
    <Education />
  </Page>
);

export default WorkPage;
