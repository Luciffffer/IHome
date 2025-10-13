import FloorRenderer from '@/components/floor-renderer/floor-renderer';
import { FloorSwitcher } from '@/components/floor-switcher';
import { Header } from '@/components/layout/header';

function Home() {
  return (
    <div className="h-svh flex flex-col">
      <Header>
        <FloorSwitcher />
      </Header>

      <FloorRenderer />
    </div>
  );
}

export default Home;
