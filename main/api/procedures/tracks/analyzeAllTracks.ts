import { z } from "zod";
import { analyzeBpm } from "../../../helpers/bpm";
import { Track } from "../../../track.types";
import { trackRouter } from "../../routers/track-router";
import { publicProcedure } from "../../trpc";

export const analyzeAllTracks = publicProcedure.input(z.object({ bpm: z.boolean(), move: z.boolean(), musicFolder: z.string() }))
    .mutation(async ({ input: { musicFolder, move, bpm }, ctx }) => {
        const caller = trackRouter.createCaller(ctx);
        const tracks = await caller.getAllTracks(musicFolder)
        const analyzedTracks: string[] = [];
        for (const track of tracks) {
            console.log(track, tracks);
            // console.log("hier");

            // if (track.bpm) {
            //     continue
            // }

            // optimisticTrackUpdate(track.filename, { isAnalyzing: true });
            try {
                analyzedTracks.push((await caller.analyzeBpmForTrack({
                    filename: track.filename,
                    musicFolder,
                    bpm: true,
                    move: false,
                })))

                return analyzedTracks;

            } catch (error) {
                console.log({ error });
            }
        }
    })