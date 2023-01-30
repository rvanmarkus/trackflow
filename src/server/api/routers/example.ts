import { existsSync, readdirSync, readFileSync } from "fs";
import { mkdir, readdir, rename, lstat } from "fs/promises";
import { z } from "zod";
import MusicTempo from 'music-tempo'
import { AudioContext } from 'web-audio-api'
import ffmetadata from 'ffmetadata';
const ffmpegPath = process.platform === "win32" ? "C:/ffmpeg/ffmpeg.exe" : path.join('ffmpeg', 'ffmpeg');
ffmetadata.setFfmpegPath(ffmpegPath);

import { createTRPCRouter, publicProcedure } from "../trpc";
import path, { dirname } from "path";
import { Track } from "../../../track.types";
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
    if (!files) return [];
    const tracks: Track[] = [];
    for (const file of files) {
      const filename = path.join(musicFolder, file);
      if ((await lstat(filename)).isFile()) {

        const metadata = await readMetadata(filename);
        const track: Track = {
          title: metadata?.title as string ?? file,
          bpm: Number(metadata.TBPM),
          filename: file
        }
        tracks.push(track);
      }
    }

    return tracks;
  }),
  analyzeBpmForTrack: publicProcedure
    .input(z.object({ filename: z.string(), bpm: z.boolean(), move: z.boolean() }))
    .mutation(async ({ input: { filename, bpm: shouldAnalyzeBpm, move: shouldMoveFiles } }) => {
      const file = readFileSync(path.join(musicFolder, filename))
      console.log(`Analyzing ${filename}, ${shouldAnalyzeBpm}`);
      const bpm = String(shouldAnalyzeBpm ? await analyzeBpm(file) : (await readMetadata(path.join(musicFolder, filename)))?.TBPM);
      console.log({ bpm })
      if (shouldAnalyzeBpm) {
        await writeMetadata(path.join(musicFolder, filename), { TBPM: bpm })
      }
      // return bpm;
      if (shouldMoveFiles) {
        if (!existsSync(path.join(musicFolder, bpm,))) {
          await mkdir(path.join(musicFolder, bpm,))
        }
        await rename(path.join(musicFolder, filename), path.join(musicFolder, bpm, filename))
      }


    })
});

const analyzeBpm = (buffer: Buffer): Promise<number> => {
  const context = new AudioContext()
  return new Promise((resolve) => {
    context.decodeAudioData(buffer, (data: any) => {
      const mt = new MusicTempo(data?.getChannelData(0));
      resolve(Math.round(mt.tempo))
    })

  })
}

function readMetadata(filename: string): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    ffmetadata.read(filename, function (err: Error, data: any) {
      if (err)
        reject(err);
      else
        resolve(data as Record<string, any>);
    });
  })
}

function writeMetadata(filename: string, data: Record<string, any>): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmetadata.write(filename, data, function (err: Error) {
      if (err) reject(err);
      else resolve();
    });
  })
}