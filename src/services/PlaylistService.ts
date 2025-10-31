import { IPlaylist } from "@/models/Playlist";

const playlists: IPlaylist[] = [
  { id: '1', name: 'Chill Vibes' },
  { id: '2', name: 'Workout Mix' },
  { id: '3', name: 'Top Hits' },
  { id: '4', name: 'Classic' },
  { id: '5', name: 'Jazz Classics' },
  { id: '6', name: 'Funky Beats' },
  { id: '7', name: 'Emo' }
];

export class PlaylistService {
  // Get

  static async getPlaylists(): Promise<IPlaylist[]> {
    return playlists;
  }
  
}