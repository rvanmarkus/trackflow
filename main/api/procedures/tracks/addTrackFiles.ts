import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { dialog } from "electron";
import path from "path";
import { z } from "zod";
import { readMetadata } from "../../../helpers/mp3-meta";
import { publicProcedure } from "../../trpc";

const allowedFileExtensions = ["mp3", "m4a"];
export const addTrackFiles = publicProcedure
  .input(
    z.optional(
      z.array(
        z.string({ description: 'FilePath' })
          .refine((path) => allowedFileExtensions.some(ext => path.endsWith(ext)), { message: "Not a music file" }),
        { description: 'Files' })))
  .mutation(
    async ({ ctx: { prisma }, input }) => {
      const filePaths = input ? input : (await dialog.showOpenDialog({
        properties: ["multiSelections", "openFile"],
        filters: [{ name: "Music files", extensions: allowedFileExtensions }],
      }))?.filePaths;
      return await Promise.all(
        filePaths.map(async (file) => {
          try {
            const { title, artist, TBPM } = await readMetadata(file);
            const { base } = path.parse(file);

            const track = { file: base, title: title ?? base, bpm: TBPM ? Number(TBPM) : null, path: file, artist };
            return (await prisma.track.create({
              data: track,
            }))

          } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
              if (e.code === 'P2002') {
                throw 'Track already in selection';
              }
            }
            console.log(`Error reading meta data: ${e}`)
            throw `Error proccessing one of the tracks: ${e}`
          }
        })
      );

    }
  );
