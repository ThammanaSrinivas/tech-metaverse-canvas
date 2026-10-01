import Page from '@/components/zen/Page';
import WorkExperience from '@/components/WorkExperience';
import TechnicalSkills from '@/components/TechnicalSkills';
import Principles from '@/components/Principles';

const WorkPage = () => (
  <Page id="work">
    <WorkExperience />
    <Principles />
    <TechnicalSkills />
  </Page>
);

export default WorkPage;
