import { readdirSync, readFileSync } from "fs";
import { readdir } from "fs/promises";
import { z } from "zod";
import MusicTempo from 'music-tempo'
import {AudioContext} from 'web-audio-api'

import { createTRPCRouter, publicProcedure } from "../trpc";
import path from "path";
const musicFolder = 'music'
export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
  getAllTracks: publicProcedure.query(async () => {
    const files = await readdir(musicFolder);

    return files;
  }),
  getBpmForTrack: publicProcedure
    .input(z.string())
    .query(({ input }) => {
      const file = readFileSync(path.join(musicFolder, input))
      
        const context = new AudioContext()
        context.decodeAudioData(file, (buffer: any) => {
          const mt = new MusicTempo(buffer?.getChannelData(0));
          console.log(mt.tempo)
          return mt.tempo as number;
        })
      })
});
