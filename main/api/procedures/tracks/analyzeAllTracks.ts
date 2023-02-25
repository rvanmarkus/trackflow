import { z } from "zod";
import { trackRouter } from "../../routers/track-router";
import { publicProcedure } from "../../trpc";
import { observable } from '@trpc/server/observable';
import EventEmitter from "events";
import { Track } from "../../../track.types";
import { trackAnalyzer } from "../../trackAnalyzer";

export const analyzeAllTracks = publicProcedure.input(z.string()).subscription(async ({ ctx, input: musicFolder }) => {
    const caller = trackRouter.createCaller(ctx);
    const tracks = await caller.getAllTracks(musicFolder)
    return observable<Track>((emit) => {
        const onAnalyzeTrackFinished = async (data: Track) => {
            emit.next(data)
        }
        trackAnalyzer.on('trackAnalyzed', onAnalyzeTrackFinished)
    
        return () => {
            trackAnalyzer.off('trackAnalyzed', onAnalyzeTrackFinished)
        }
    })
})