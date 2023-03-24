

import { createTRPCRouter } from "../trpc";
import { getAllTracks } from "../procedures/tracks/getAllTracks";
import { analyzeBpmForTrack } from "../procedures/tracks/analyzeBpmForTrack";
import { getMusicFolder } from "../procedures/tracks/getMusicFolder";
import { trackAnalyseUpdates } from "../procedures/tracks/trackAnalyseUpdates";
import { analyzeAllTracks } from "../procedures/tracks/analyzeAllTracks";
import { openFileInFolder } from "../procedures/tracks/openFileInFolder";



export const trackRouter = createTRPCRouter({
  getMusicFolder,
  getAllTracks,
  analyzeBpmForTrack,
  trackAnalyseUpdates: trackAnalyseUpdates,
  analyzeAllTracks,
  openFileInFolder
});

