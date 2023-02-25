

import { createTRPCRouter } from "../trpc";
import { getAllTracks } from "../procedures/tracks/getAllTracks";
import { analyzeBpmForTrack } from "../procedures/tracks/analyzeBpmForTrack";
import { getMusicFolder } from "../procedures/tracks/getMusicFolder";
import { analyzeAllTracks } from "../procedures/tracks/analyzeAllTracks";



export const trackRouter = createTRPCRouter({
  getMusicFolder,
  getAllTracks,
  analyzeBpmForTrack,
  analyzeAllTracks
});
