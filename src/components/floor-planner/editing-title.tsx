'use client';

import { useFloor } from '@/contexts/floor-context';
import { Spinner } from '../ui/spinner';

function EditingTitle() {
  const { floor, isSavingFloor } = useFloor();

  return (
    <h1 className="shrink-0 flex items-center gap-2 text-body-sm">
      {isSavingFloor ? <Spinner /> : null}
      <span className="truncate">{floor.name}</span>
    </h1>
  );
}

export default EditingTitle;
