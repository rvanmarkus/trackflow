import { publicProcedure } from "../../trpc";

export const getAllTracks = publicProcedure
  .input(z.string())
  .query(async ({ input: musicFolder }) => {
   


  });

}
