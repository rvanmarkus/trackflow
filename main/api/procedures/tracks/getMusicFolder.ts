import { dialog } from "electron";
import path from "path";
import { publicProcedure } from "../../trpc";
import { readdir, lstat } from "fs/promises";
import { z } from "zod";
import { readMetadata } from "../../../helpers/mp3-meta";
import { Track } from "@prisma/client";

export const addMusicFolder = publicProcedure.query(
  async ({ ctx: { prisma } }) => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      const musicFolder = filePaths?.[0];
      if (!musicFolder) throw new Error("No folder selected");

      const files = await readdir(musicFolder);
      if (!files) return [];

      const tracks: [] = [];
      for (const file of files) {
        const filename = path.join(musicFolder, file);
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
          const track = prisma.track.create({
            data: {
              title: title ?? file,
              file: file,
              ...(TBPM ? { bpm: Number(TBPM) } : {}),
            },
          });
          tracks.push(tracks);
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
