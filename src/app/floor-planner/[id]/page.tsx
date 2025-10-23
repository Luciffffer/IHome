import { FloorPlanEditor } from '@/components/floor-plan-editor/floor-plan-editor';
import { Header } from '@/components/layout/header';
import { FloorService } from '@/services/FloorService';
import { Pencil } from 'lucide-react';
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

  const { initial } = await searchParams;
  console.log('initial param:', initial);

  return (
    <div className="h-svh flex flex-col">
      <Header>
        <div className="shrink-0 flex items-center gap-2 text-body-sm">
          <Pencil className="size-4" />
          <p>Editing {floor?.name}</p>
        </div>
      </Header>
      <FloorPlanEditor floor={floor} />
    </div>
  );
}

export default FloorPlannerPage;
