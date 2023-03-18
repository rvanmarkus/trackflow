import { dialog } from "electron";
import { readMetadata } from "../../../helpers/mp3-meta";
import { publicProcedure } from "../../trpc";

export const addTrackFiles = publicProcedure.mutation(
  async ({ ctx: { prisma } }) => {
    const { filePaths, ...rest } = await dialog.showOpenDialog({
      properties: ["multiSelections", "openFile"],
      filters: [{ name: "Music files", extensions: ["mp3", "m4a"] }],
    });
    return await Promise.all(
      filePaths.map(async (file) => {
        try {
          const { title, TBPM } = await readMetadata(file);
  
          return (await prisma.track.create({
            data: { file, title: title ?? file, bpm: Number(TBPM) },
          }))

        } catch (e) {
          console.log(`Error reading meta data: ${e}`)
        }
      })
    );

  }
);
