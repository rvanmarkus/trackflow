import { Track } from "@prisma/client";
import { z } from "zod";
import { trackToMetadata, writeMetadata } from "../../../helpers/mp3-meta";
import { publicProcedure } from "../../trpc";

export const updateTrack = publicProcedure.input(z.object({
    artist: z.string().optional(),
    title: z.string(),
    id: z.string()
})).mutation(async ({ input: { id, ...data }, ctx: { prisma } }) => {
    const track = await prisma.track.update({ where: { id }, data, select: { path: true, bpm: true, title: true, artist: true } });
    await writeMetadata(track.path, trackToMetadata(track))
    return track;
})