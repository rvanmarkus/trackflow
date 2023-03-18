

import { createTRPCRouter } from "../trpc";
import { getAllTracks } from "../procedures/tracks/getAllTracks";
import { analyzeBpmForTrack } from "../procedures/tracks/analyzeBpmForTrack";
import { addMusicFolder } from "../procedures/tracks/addMusicFolder";
import { trackAnalyseUpdates } from "../procedures/tracks/trackAnalyseUpdates";
import { analyzeAllTracks } from "../procedures/tracks/analyzeAllTracks";
import { openFileInFolder } from "../procedures/tracks/openFileInFolder";
import { addTrackFiles } from "../procedures/tracks/addTrackFiles";



export const trackRouter = createTRPCRouter({
  addMusicFolder,
  addTrackFiles,
  getAllTracks,
  analyzeBpmForTrack,
  trackAnalyseUpdates: trackAnalyseUpdates,
  analyzeAllTracks,
  openFileInFolder
});

