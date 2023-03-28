import { z } from "zod";
import { analyzeBpm } from "../../../helpers/bpm";
import { Track } from "../../../track.types";
import { trackRouter } from "../../routers/track-router";
import { publicProcedure } from "../../trpc";

export const analyzeAllTracks = publicProcedure.input(z.object({ exportFiles: z.boolean().default(false), outputFolder: z.string().optional() })
    // .refine(input => input.exportFiles && !input.outputFolder, { message: 'Output folder should be defined when exportFiles option is enabled' })
)
    .mutation(async ({ input: { exportFiles, outputFolder }, ctx }) => {
        const caller = trackRouter.createCaller(ctx);
        const tracks = await caller.getAllTracks()

        const analyzedTracks: string[] = [];

        for (const track of tracks) {
            console.log(track, tracks);
            try {
                analyzedTracks.push((await caller.analyzeBpmForTrack({
                    id: track.id,
                    bpm: !Boolean(track.bpm),
                    copy: exportFiles,
                    outputFolder
                })))


            } catch (error) {
                console.log({ error });
            }
        }

        return analyzedTracks;
    })