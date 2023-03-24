import { z } from "zod";
import { trackRouter } from "../../routers/track-router";
import { publicProcedure } from "../../trpc";
import { observable } from '@trpc/server/observable';
import EventEmitter from "events";
import { Track } from "../../../track.types";
import { trackAnalyzer } from "../../trackAnalyzer";

export const trackAnalyseUpdates = publicProcedure.subscription(async ({ ctx }) => {

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