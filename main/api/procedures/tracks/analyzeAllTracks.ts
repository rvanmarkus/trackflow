import { z } from "zod";
import { analyzeBpm } from "../../../helpers/bpm";
import { Track } from "../../../track.types";
import { trackRouter } from "../../routers/track-router";
import { publicProcedure } from "../../trpc";

export const analyzeAllTracks = publicProcedure.input(z.object({ keepOriginalFiles: z.boolean(), outputFolder: z.string()}))
    .mutation(async ({ input: { keepOriginalFiles, outputFolder }, ctx }) => {
        const caller = trackRouter.createCaller(ctx);
        const tracks = await caller.getAllTracks()

        const analyzedTracks: string[] = [];

        for (const track of tracks) {
            console.log(track, tracks);
            try {
                analyzedTracks.push((await caller.analyzeBpmForTrack({
                    id: track.id,
                    bpm: !Boolean(track.bpm),
                    copy: !keepOriginalFiles,
                    outputFolder
                })))

                
            } catch (error) {
                console.log({ error });
            }
        }

        return analyzedTracks;
    })