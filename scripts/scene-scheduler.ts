import { IScene } from '@/models/Scene';
import cron from 'node-cron';


function shouldActivateNow(scene: IScene): boolean {
  if (!scene.enabled) return false;

  const now = new Date();
  return false;
}

async function checkAndActivateScenes() {
  try {
    const response = await fetch('http://localhost:3000/api/scenes/global', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    })

    if (!response.ok) {
      console.error(`[${new Date().toISOString()}] Failed to fetch global scenes: ${response.statusText}`);
      return;
    }

    const globalScenes: IScene[] = (await response.json()).data;

    console.log(`[${new Date().toISOString()}] Checking ${globalScenes.length} global scenes for activation.`);

    for (const scene of globalScenes) {
      if (shouldActivateNow(scene)) {
        console.log(`Activating scene: ${scene.name} (ID: ${scene.id})`);
      }
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error checking global scenes:`, error);
  }
}

cron.schedule('*/1 * * * *', () => {
  checkAndActivateScenes();
});

console.log('Scene scheduler started, checking every 1 minutes.');