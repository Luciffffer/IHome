import { useMemo, useState } from 'react';
import { useFloors } from '@/contexts/floors';
import { useFloorUI } from '@/contexts/floor-ui-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';
import DeviceCard from './device-card';
import { IDevice } from '@/models/Device';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

function DeviceList() {
  const { devices } = useFloors();
  const { openDeviceDetail } = useFloorUI();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return devices ?? [];
    return (devices ?? []).filter(d => {
      const hay = [
        d.name ?? '',
        d.description ?? '',
        d.type ?? '',
        JSON.stringify(d.state ?? {}),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(query);
    });
  }, [devices, q]);

  const grouped = useMemo(() => {
    const byType = new Map<string, IDevice[]>();
    for (const device of filtered) {
      const key = (device.type ?? 'other').toLowerCase();
      const array = byType.get(key) ?? [];
      array.push(device);
      byType.set(key, array);
    }
    return Array.from(byType.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
  }, [filtered]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search devices…"
          className="max-w-md"
        />
        {q && (
          <Button type="button" variant="outline" onClick={() => setQ('')}>
            Clear
          </Button>
        )}
        <div className="ml-auto text-sm text-muted-foreground shrink-0">
          {filtered.length} / {devices?.length ?? 0}
        </div>
      </div>

      <Separator
        orientation="horizontal"
        className="mt-3 bg-border -mx-4 !w-auto"
      />

      {/* Devices */}
      {devices?.length === 0 ? (
        <div className="text-muted-foreground text-sm">No devices found.</div>
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground text-sm">
          No matches for “{q}”.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {grouped.map(([type, devices]) => (
            <Collapsible key={type} defaultOpen>
              <CollapsibleTrigger className="mb-2 w-full block group hover:cursor-pointer">
                <div className="flex justify-between items-center">
                  <h3 className="font-body-sm capitalize text-muted-foreground">
                    {type} ({devices.length})
                  </h3>
                  <div className="p-1 rounded-sm group-hover:bg-muted transition-colors">
                    <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-col gap-3">
                  {devices.map(device => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      onOpen={() => openDeviceDetail(device)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}

export default DeviceList;
