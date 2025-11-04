import { IScene } from '@/models/Scene';
import cron from 'node-cron';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const toMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesSinceMidnight(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

function isInSchedule(
  schedule: Array<{ day: number; start: string; end: string }> | undefined,
  now: Date
): boolean {
  if (!schedule?.length) return false;

  const nowDay = now.getDay();
  const nowMinutes = minutesSinceMidnight(now);

  return schedule.some(slot => {
    if (slot.day !== nowDay) return false;
    const start = toMinutes(slot.start);
    const end = toMinutes(slot.end);
    return start <= nowMinutes && nowMinutes < end;
  });
}

function shouldActivateNow(scene: IScene, now: Date): boolean {
  if (scene.enabled) return false;

  return isInSchedule(scene.schedule, now);
}

function shouldDeactivateNow(scene: IScene, now: Date): boolean {
  if (!scene.enabled) return false;
  
  return !isInSchedule(scene.schedule, now);
}

async function activateScene(sceneId: string) {
  try {
    const token = process.env.API_BEARER_TOKEN;
    const response = await fetch(`${BASE_URL}/api/scenes/${sceneId}/activate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      console.error(`[${new Date().toISOString()}] Failed to activate scene ${sceneId}: ${response.statusText}`);
      return;
    }

    console.log(`[${new Date().toISOString()}] Successfully activated scene ${sceneId}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error activating scene ${sceneId}:`, error);
  }
}

async function deactivateScene(sceneId: string) {
  try {
    const token = process.env.API_BEARER_TOKEN;
    const response = await fetch(`${BASE_URL}/api/scenes/${sceneId}/deactivate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      console.error(`[${new Date().toISOString()}] Failed to deactivate scene ${sceneId}: ${response.statusText}`);
      return;
    }

    console.log(`[${new Date().toISOString()}] Successfully deactivated scene ${sceneId}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deactivating scene ${sceneId}:`, error);
  }
}

async function checkAndActivateScenes() {
  try {
    const token = process.env.API_BEARER_TOKEN;
    if (!token) {
      console.warn(`[${new Date().toISOString()}] API_BEARER_TOKEN is not set; aborting fetch.`);
      return;
    }

    const response = await fetch('http://localhost:3000/api/scenes/global', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })

    if (!response.ok) {
      console.error(`[${new Date().toISOString()}] Failed to fetch global scenes: ${response.statusText}`);
      return;
    }

    const result = await response.json();
    const globalScenes: IScene[] = Array.isArray(result) ? result : result.data || [];

    const now = new Date();

    for (const scene of globalScenes) {
      if (shouldDeactivateNow(scene, now)) {
        await deactivateScene(scene.id);
        scene.enabled = false;
      }
      if (shouldActivateNow(scene, now)) {
        await activateScene(scene.id);
        scene.enabled = true;
      }
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error checking global scenes:`, error);
  }
}

cron.schedule('*/1 * * * *', () => {
  checkAndActivateScenes();
});
  
console.log('Scene scheduler started, checking every minute.');
checkAndActivateScenes();