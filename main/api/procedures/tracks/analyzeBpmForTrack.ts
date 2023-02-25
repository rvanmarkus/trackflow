import { readFileSync, existsSync } from "fs";
import { mkdir, rename } from "fs/promises";
import path from "path";
import { z } from "zod";
import { analyzeBpm } from "../../../helpers/bpm";
import { readMetadata, writeMetadata } from "../../../helpers/mp3-meta";
import { publicProcedure } from "../../trpc";

export const analyzeBpmForTrack = publicProcedure
    .input(z.object({ filename: z.string(), bpm: z.boolean(), move: z.boolean(), musicFolder: z.string() }))
    .mutation(async ({ input: { filename, bpm: shouldAnalyzeBpm, move: shouldMoveFiles, musicFolder } }) => {
        console.log('anaaaaa')
        try {
            console.log(JSON.stringify({ filename, bpm: shouldAnalyzeBpm, move: shouldMoveFiles, musicFolder }))
            const file = readFileSync(path.join(musicFolder, filename));
    
            const bpm = String(shouldAnalyzeBpm ? await analyzeBpm(file) : (await readMetadata(path.join(musicFolder, filename)))?.TBPM);
            if (shouldAnalyzeBpm) {
                await writeMetadata(path.join(musicFolder, filename), { TBPM: bpm });
            }
            if (shouldMoveFiles) {
                if (!existsSync(path.join(musicFolder, bpm))) {
                    await mkdir(path.join(musicFolder, bpm));
                }
                await rename(path.join(musicFolder, filename), path.join(musicFolder, bpm, filename));
            }
            return bpm;

        } catch(e) {
            console.log('error')
            console.log(e)
        }

    });

export default analyzeBpmForTrack