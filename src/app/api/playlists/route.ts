import { requireAuth } from "@/lib/auth-helpers";
import { handleError } from "@/lib/error-handler";
import { PlaylistService } from "@/services/PlaylistService";

export async function GET() {
  try {
    requireAuth();
    const playlists = await PlaylistService.getPlaylists();

    return new Response(JSON.stringify({
      success: 1,
      data: playlists
    }), {
      status: 200
    });
  } catch (error) {
    handleError(error);
  }
}