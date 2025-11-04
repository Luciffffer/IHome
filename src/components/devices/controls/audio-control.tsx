import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useFloors } from '@/contexts/floors';
import { AudioState, IDevice } from '@/models/Device';
import { IPlaylist } from '@/models/Playlist';
import { useQuery } from '@tanstack/react-query';
import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface AudioControlProps {
  device: IDevice;
}

const MAX_VOLUME = 20;
const MIN_VOLUME = 0;
const STEP = 1;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

async function fetchPlaylists(): Promise<IPlaylist[]> {
  const rest = await fetch('/api/playlists');
  if (!rest.ok) {
    throw new Error('Failed to fetch playlists');
  }
  const json = await rest.json();
  return json.data;
}

function AudioControl({ device }: AudioControlProps) {
  const { queueDeviceUpdate } = useFloors();

  const state = device.state as AudioState;

  const { data: playlists = [], isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ['playlists'],
    queryFn: fetchPlaylists,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes,
    refetchOnWindowFocus: false,
  });

  const initialVolume = useMemo(
    () => clamp(state?.volume ?? 0, MIN_VOLUME, MAX_VOLUME),
    [state?.volume]
  );

  const [volume, setVolume] = useState<number>(initialVolume);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>(
    state?.playlist || ''
  );

  // Sync to external changes
  useEffect(() => {
    const externalVolume = clamp(
      state?.volume ?? initialVolume,
      MIN_VOLUME,
      MAX_VOLUME
    );
    setVolume(externalVolume);
  }, [state?.volume, initialVolume]);

  useEffect(() => {
    if ((state?.playlist || '') !== selectedPlaylist) {
      setSelectedPlaylist(state?.playlist || '');
    }
  }, [state?.playlist, selectedPlaylist]);

  const pushVolumeUpdate = (value: number) => {
    const next = clamp(value, MIN_VOLUME, MAX_VOLUME);
    queueDeviceUpdate(device.id, {
      state: {
        ...(device.state ?? {}),
        volume: next,
      } as AudioState,
    });
  };

  const pushPlaylistUpdate = (playlistId: string) => {
    queueDeviceUpdate(device.id, {
      state: {
        ...(device.state ?? {}),
        playlist: playlistId,
      } as AudioState,
    });
  };

  const increaseVolume = () => {
    setVolume(v => {
      const next = clamp(v + STEP, MIN_VOLUME, MAX_VOLUME);
      pushVolumeUpdate(next);
      return next;
    });
  };

  const decreaseVolume = () => {
    setVolume(v => {
      const next = clamp(v - STEP, MIN_VOLUME, MAX_VOLUME);
      pushVolumeUpdate(next);
      return next;
    });
  };

  const handlePlaylistChange = (playlistId: string) => {
    setSelectedPlaylist(playlistId);
    pushPlaylistUpdate(playlistId);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Playlist Selection */}
      <div className="flex flex-col gap-2">
        <div className="text-muted-foreground text-body-sm">
          Select Playlist
        </div>
        <Select
          value={selectedPlaylist}
          onValueChange={handlePlaylistChange}
          disabled={isLoadingPlaylists}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                isLoadingPlaylists
                  ? 'Loading playlists...'
                  : 'Choose a playlist'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {playlists.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Volume Control */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-body-sm">Volume</div>
          <div className="text-muted-foreground text-body-sm">
            {MIN_VOLUME} — {MAX_VOLUME}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative w-44 h-44 rounded-full bg-muted/50 border border-border flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {volume === 0 ? (
                  <VolumeX className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="text-4xl font-semibold leading-none">
                {volume}
              </div>
              <div className="text-muted-foreground text-xs mt-1">Level</div>
            </div>
            <div className="absolute inset-2 rounded-full pointer-events-none border border-border/60" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={decreaseVolume}
            aria-label="Decrease volume"
            disabled={volume === MIN_VOLUME}
          >
            &minus;
          </Button>

          <Slider
            min={MIN_VOLUME}
            max={MAX_VOLUME}
            step={STEP}
            value={[volume]}
            onValueChange={value => {
              const next = clamp(value[0], MIN_VOLUME, MAX_VOLUME);
              setVolume(next);
              pushVolumeUpdate(next);
            }}
            aria-label="Volume"
            className="flex-1 accent-foreground"
          />

          <Button
            type="button"
            variant="outline"
            onClick={increaseVolume}
            aria-label="Increase volume"
            disabled={volume === MAX_VOLUME}
          >
            +
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AudioControl;
