import Page from '@/components/zen/Page';
import WorkExperience from '@/components/WorkExperience';
import Education from '@/components/Education';
import Principles from '@/components/Principles';
import TechnicalSkills from '@/components/TechnicalSkills';
import SideProjects from '@/components/SideProjects';

const WorkPage = () => (
  <Page id="work">
    <WorkExperience />
    <Education />
    <Principles />
    <TechnicalSkills />
    <SideProjects />
  </Page>
);

export default WorkPage;
