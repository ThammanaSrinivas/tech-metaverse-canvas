import Page from '@/components/zen/Page';
import About from '@/components/About';
import { PROFILE } from '@/data/profile';

const AboutPage = () => (
  <Page
    id="about"
    aside={
      <img
        src={PROFILE.portrait}
        alt={PROFILE.name}
        width={160}
        height={160}
        className="h-28 w-28 rounded-full border object-cover md:h-40 md:w-40"
      />
    }
  >
    <About />
  </Page>
);

export default AboutPage;
