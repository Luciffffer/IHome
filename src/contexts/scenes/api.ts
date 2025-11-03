import { IScene } from "@/models/Scene";

export async function fetchGlobalScenes(): Promise<IScene[]> {
  const res = await fetch('/api/scenes/global');
  if (!res.ok) throw new Error('Failed to fetch global scenes');
  return (await res.json()).data as IScene[];
}

export async function fetchMyScenes(): Promise<IScene[]> {
  const res = await fetch('/api/scenes/mine');
  if (!res.ok) throw new Error('Failed to fetch my scenes');
  return (await res.json()).data as IScene[];
}

export async function activateFastScene(fastSceneId: string): Promise<void> {
  const res = await fetch(`/api/scenes/fast/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: fastSceneId }),
  });
  if (!res.ok) throw new Error('Failed to activate fast scene');
}

export async function activateScene(sceneId: string): Promise<void> {
  const res = await fetch(`/api/scenes/${sceneId}/activate`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to activate scene');
}

export async function createGlobalScene(scene: Partial<IScene>): Promise<IScene> {
  const res = await fetch('/api/scenes/global', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scene)
  });
  if (!res.ok) throw new Error('Failed to create global scene');
  return (await res.json()).data as IScene;
}