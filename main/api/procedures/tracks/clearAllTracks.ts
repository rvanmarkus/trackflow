import { publicProcedure } from "../../trpc";

export const clearAllTracks = publicProcedure.mutation(async ({ ctx: { prisma } }) => {
    await prisma.track.deleteMany()
})