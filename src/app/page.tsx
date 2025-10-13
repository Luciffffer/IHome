import FloorRenderer from '@/components/floor-renderer/floor-renderer';
import { FloorSwitcher } from '@/components/floor-switcher';
import { NavUser } from '@/components/nav-user';

function Home() {
  return (
    <div className="h-svh flex flex-col">
      <header className="h-16 flex justify-between items-center px-6 drop-shadow-md rounded-b-4xl">
        <span className="font-semibold font-body-lg w-full">
          I<span className="font-light">home</span>
        </span>
        <FloorSwitcher className="shrink-0" />
        <div className="w-full flex justify-end">
          <NavUser />
        </div>
      </header>

      <FloorRenderer />
    </div>
  );
}

export default Home;
