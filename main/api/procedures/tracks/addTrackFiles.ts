import { dialog } from "electron";
import path from "path";
import { z } from "zod";
import { readMetadata } from "../../../helpers/mp3-meta";
import { publicProcedure } from "../../trpc";

export const addTrackFiles = publicProcedure
  .input(z.optional(z.array(z.string({ description: 'FilePath' }), { description: 'Files' }))).mutation(
    async ({ ctx: { prisma }, input }) => {
      const filePaths  = input ? input : (await dialog.showOpenDialog({
        properties: ["multiSelections", "openFile"],
        filters: [{ name: "Music files", extensions: ["mp3", "m4a"] }],
      }))?.filePaths;
      return await Promise.all(
        filePaths.map(async (file) => {
          try {
            const { title, TBPM } = await readMetadata(file);
            const { base } = path.parse(file);

            return (await prisma.track.create({
              data: { file: base, title: title ?? base, bpm: Number(TBPM), path: file },
            }))

          } catch (e) {
            console.log(`Error reading meta data: ${e}`)
            throw `Error proccessing one of the tracks: ${e}`
          }
        })
      );

    }
  );
