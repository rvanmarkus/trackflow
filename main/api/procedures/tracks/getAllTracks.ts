import { readdir, lstat } from "fs/promises";
import path from "path";
import { z } from "zod";
import { readMetadata } from "../../../helpers/mp3-meta";
import { Track } from "../../../track.types";
import { publicProcedure } from "../../trpc";

export const getAllTracks = publicProcedure
  .input(z.string())
  .query(async ({ input: musicFolder }) => {
    try {
      const files = await readdir(musicFolder);
      if (!files)
        return [];

      const tracks: Track[] = [];
      for (const file of files) {
        const filename = path.join(musicFolder, file);
        console.log(filename);
        if (
            !(await lstat(filename)).isFile() ||
            !filename.endsWith('.mp3') ||
            filename.endsWith('.ffmpeg.mp3') ||
            filename.startsWith('.')
          ) {
          continue;
        }
        try {
          const { title, artist, TBPM } = await readMetadata(filename);
          tracks.push({
            title: title ?? file,
            filename: file,
            ...artist ? { artist } : {},
            ...TBPM ? { bpm: Number(TBPM) } : {},
          });
        } catch (e) {
          console.log(`Error reading file ${file} ${e}`);
        }
      }
      return tracks;


    } catch (e) {
      console.log('error reading folder');

      // return e;
    }


  });