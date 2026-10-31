import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Page from '@/components/zen/Page';
import CommitTimeMachine from '@/components/CommitTimeMachine';

// The Time Machine is the only page that fetches through react-query, so the client lives in its
// chunk instead of on every page's first load. Module scope: it keeps its cache across visits.
const queryClient = new QueryClient();

const TimeMachinePage = () => (
  <QueryClientProvider client={queryClient}>
    <Page id="time-machine">
      <CommitTimeMachine />
    </Page>
  </QueryClientProvider>
);

export default TimeMachinePage;
