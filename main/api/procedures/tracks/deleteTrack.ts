import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const deleteTrack = publicProcedure
    .input(z.string({ description: "track id" }))
    .mutation(async ({ input: id, ctx: { prisma } }) => {
        try {
            return (await prisma.track.delete({ where: { id } }))
        } catch (e) {
            throw 'Error removing track'
        }
    })