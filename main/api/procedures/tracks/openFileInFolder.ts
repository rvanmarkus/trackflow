import { shell } from "electron";
import { z } from "zod";
import { publicProcedure } from "../../trpc";
import path from 'path';
export const openFileInFolder = publicProcedure
    .input(z.object({ filename: z.string({ description: 'filename' }), musicFolder: z.string() }))
    .mutation(({ input: { filename, musicFolder } }) => {
        shell.showItemInFolder(path.join(musicFolder, filename));
    })