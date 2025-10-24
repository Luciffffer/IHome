import FloorRenderer from '@/components/floor-renderer/floor-renderer';
import { FloorSwitcher } from '@/components/floor-switcher';
import { Header } from '@/components/layout/header';
import { FloorsProvider } from '@/contexts/floors-context';

export const metadata = {
  title: 'Overview',
};

function Home() {
  return (
    <FloorsProvider>
      <div className="h-svh flex flex-col">
        <Header>
          <FloorSwitcher />
        </Header>

        <FloorRenderer />
      </div>
    </FloorsProvider>
  );
}

export default Home;
