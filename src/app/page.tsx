import FloorRenderer from '@/components/floor-renderer/floor-renderer';
import { FloorSwitcher } from '@/components/floor-switcher';
import { Header } from '@/components/layout/header';
import { FloorProvider } from '@/contexts/floor-context';

export const metadata = {
  title: 'Overview',
};

function Home() {
  return (
    <FloorProvider>
      <div className="h-svh flex flex-col">
        <Header>
          <FloorSwitcher />
        </Header>

        <FloorRenderer />
      </div>
    </FloorProvider>
  );
}

export default Home;
