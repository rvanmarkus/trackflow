import { z } from "zod";
import { analyzeBpm } from "../../../helpers/bpm";
import { Track } from "../../../track.types";
import { trackRouter } from "../../routers/track-router";
import { publicProcedure } from "../../trpc";

export const analyzeAllTracks = publicProcedure.input(z.object({ keepOriginalFiles: z.boolean()}))
    .mutation(async ({ input: { keepOriginalFiles }, ctx }) => {
        const caller = trackRouter.createCaller(ctx);
        const tracks = await caller.getAllTracks()

        const analyzedTracks: string[] = [];

        for (const track of tracks) {
            console.log(track, tracks);
            try {
                analyzedTracks.push((await caller.analyzeBpmForTrack({
                    filename: track.file,
                    bpm: !Boolean(track.bpm),
                    move: !keepOriginalFiles,
                })))

                
            } catch (error) {
                console.log({ error });
            }
        }

        return analyzedTracks;
    })