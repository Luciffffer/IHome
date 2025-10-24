import EditingTitle from '@/components/floor-planner/editing-title';
import { FloorPlanEditor } from '@/components/floor-planner/floor-plan-editor/floor-plan-editor';
import { Header } from '@/components/layout/header';
import ReactQueryProvider from '@/components/react-query-provider';
import { FloorProvider } from '@/contexts/floor-context';
import { FloorService } from '@/services/FloorService';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Floor Planner',
};

async function FloorPlannerPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { initial: boolean };
}) {
  const { id } = await params;
  const floor = await FloorService.getFloorById(id);

  if (!floor) {
    notFound();
  }

  console.log('floor:', floor);

  const { initial } = await searchParams;
  console.log('initial param:', initial);

  return (
    <ReactQueryProvider>
      <FloorProvider initialFloor={floor}>
        <div className="h-svh flex flex-col">
          <Header>
            <EditingTitle />
          </Header>
          <FloorPlanEditor />
        </div>
      </FloorProvider>
    </ReactQueryProvider>
  );
}

export default FloorPlannerPage;
