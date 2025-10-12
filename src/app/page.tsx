import FloorRenderer from '@/components/floor-renderer/floor-renderer';
import { NavUser } from '@/components/nav-user';

async function Home() {
  return (
    <div className="h-svh flex flex-col">
      <header className="h-16 flex justify-between items-center px-6 drop-shadow-md rounded-b-4xl">
        <span className="font-semibold font-body-lg">
          I<span className="font-light">home</span>
        </span>
        <NavUser />
      </header>

      <FloorRenderer />
    </div>
  );
}

export default Home;
