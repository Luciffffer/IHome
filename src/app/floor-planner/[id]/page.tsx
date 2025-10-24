import EditingTitle from '@/components/floor-planner/editing-title';
import { FloorPlanEditor } from '@/components/floor-planner/floor-plan-editor/floor-plan-editor';
import InitialDialog from '@/components/floor-planner/initial-dialog';
import { Header } from '@/components/layout/header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Logo from '@/components/ui/logo';
import { FloorProvider } from '@/contexts/floor-context';
import { FloorService } from '@/services/FloorService';
import { Slash } from 'lucide-react';
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

  return (
    <FloorProvider initialFloor={floor}>
      <div className="h-svh flex flex-col">
        <Header>
          <Breadcrumb className="w-full">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-foreground hover:text-muted-foreground"
                >
                  <Logo className="w-9" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <Slash />
              </BreadcrumbSeparator>
              <BreadcrumbItem>Floor Editor</BreadcrumbItem>
              <BreadcrumbSeparator>
                <Slash />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <EditingTitle />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Header>
        <FloorPlanEditor />
      </div>
      {initial && <InitialDialog />}
    </FloorProvider>
  );
}

export default FloorPlannerPage;
