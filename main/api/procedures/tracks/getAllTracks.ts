import { publicProcedure } from "../../trpc";

export const getAllTracks = publicProcedure
  .query(async ({ ctx: { prisma } }) => {
    return prisma.track.findMany({ orderBy: [{ bpm: 'asc' }] })
  })
