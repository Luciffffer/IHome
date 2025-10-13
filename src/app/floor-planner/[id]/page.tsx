import { FloorPlanEditor } from '@/components/floor-plan-editor/floor-plan-editor';
import { Header } from '@/components/layout/header';
import { FloorService } from '@/services/FloorService';
import { Pencil } from 'lucide-react';

async function FloorPlannerPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const floor = await FloorService.getFloorById(id);

  return (
    <div className="h-svh flex flex-col">
      <Header>
        <div className="shrink-0 flex items-center gap-3">
          <Pencil className="size-5" />
          <p>Editing {floor?.name}</p>
        </div>
      </Header>
      <FloorPlanEditor floor={floor!} />
    </div>
  );
}

export default FloorPlannerPage;
