import { FloorUIProvider } from '@/contexts/floor-ui-context';
import FloorRenderer from '@/components/floor-renderer/floor-renderer';
import { FloorSwitcher } from '@/components/common/floor-switcher';
import { Header } from '@/components/layout/header';
import Logo from '@/components/ui/logo';
import { FloorsProvider } from '@/contexts/floors';
import { requireAuth } from '@/lib/auth-helpers';

async function Home() {
  await requireAuth();

  return (
    <FloorsProvider>
      <FloorUIProvider>
        <div className="h-svh flex flex-col">
          <Header>
            <div className="w-full">
              <Logo className="w-9" />
            </div>
            <FloorSwitcher />
          </Header>

          <FloorRenderer />
        </div>
      </FloorUIProvider>
    </FloorsProvider>
  );
}

export default Home;
