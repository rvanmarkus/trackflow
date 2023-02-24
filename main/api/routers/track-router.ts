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
import { Track } from "../../track.types";
import { app, dialog } from "electron";
export const trackRouter = createTRPCRouter({
  getMusicFolder: publicProcedure.query(async () => {
    const {filePaths} = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return filePaths[0] ?? path.join(__dirname, '../../../music')
  }),
  getAllTracks: publicProcedure
    .input(z.string())
    .query(async ({ input: musicFolder }) => {


      const files = await readdir(musicFolder);
      if (!files) return [];

      const tracks: Track[] = [];
      for (const file of files) {
        const filename = path.join(musicFolder, file);
        if (!filename.endsWith('.mp3') || filename.endsWith('.ffmpeg.mp3')) return;
        if (!(await lstat(filename)).isFile()) return;

        const { title, artist, TBPM } = await readMetadata(filename);
        tracks.push({
          title: title ?? file,
          bpm: TBPM ? Number(TBPM) : undefined,
          artist,
          filename: file
        });
      }

      return tracks;
    }),
  analyzeBpmForTrack: publicProcedure
    .input(z.object({ filename: z.string(), bpm: z.boolean(), move: z.boolean(), musicFolder: z.string() }))
    .mutation(async ({ input: { filename, bpm: shouldAnalyzeBpm, move: shouldMoveFiles, musicFolder } }) => {
      const file = readFileSync(path.join(musicFolder, filename))

      const bpm = String(shouldAnalyzeBpm ? await analyzeBpm(file) : (await readMetadata(path.join(musicFolder, filename)))?.TBPM);
      if (shouldAnalyzeBpm) {
        await writeMetadata(path.join(musicFolder, filename), { TBPM: bpm })
      }
      if (shouldMoveFiles) {
        if (!existsSync(path.join(musicFolder, bpm,))) {
          await mkdir(path.join(musicFolder, bpm,))
        }
        await rename(path.join(musicFolder, filename), path.join(musicFolder, bpm, filename))
      }
      return bpm;

    })
});

const analyzeBpm = (buffer: Buffer): Promise<number> => {
  const context = new AudioContext()
  return new Promise((resolve, reject) => {
    context.decodeAudioData(buffer, (data: any) => {
      try {
        const mt = new MusicTempo(data?.getChannelData(0));
        resolve(Math.round(mt.tempo))
      } catch (error) {
        reject(error);
      }
    })

  })
}

function readMetadata(filename: string): Promise<Record<string, string>> {
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