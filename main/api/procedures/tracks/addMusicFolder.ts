import { dialog } from "electron";
import path from "path";
import { publicProcedure } from "../../trpc";
import { readdir, lstat } from "fs/promises";
import { z } from "zod";
import { readMetadata } from "../../../helpers/mp3-meta";
import { Track } from "@prisma/client";
import { readdirSync } from "fs";

export const addMusicFolder = publicProcedure.query(
  async ({ ctx: { prisma } }) => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      const musicFolder = filePaths?.[0];
      if (!musicFolder) throw new Error("No folder selected");

      const files = readdirSync(musicFolder).map(file => path.join(musicFolder, file));
      if (!files) return [];

      const tracks: Track[] = [];
      for (const filename of files) {
        console.log(filename);
        if (
          !(await lstat(filename)).isFile() ||
          !hasMusicFileExtension(filename) ||
          filename.endsWith(".ffmpeg.mp3") ||
          filename.startsWith(".")
        ) {
          continue;
        }
        try {
          const { title, artist, TBPM } = await readMetadata(filename);
          const track = await prisma.track.create({
            data: {
              title: title ?? filename,
              file: filename,
              path: filename,
              ...(TBPM ? { bpm: Number(TBPM) } : {}),
            },
          });
          tracks.push(track);
        } catch (e) {
          console.log(`Error reading file ${filename} ${e}`);
        }
      }
      return tracks;
    } catch (e) {
      console.log(`error opening dialog ${e}`);
    }
  }
);
function hasMusicFileExtension(filename: string) {
  return filename.endsWith(".mp3") || filename.endsWith(".m4a");
}
