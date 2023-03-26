import { readFileSync, existsSync } from "fs";
import { copyFile, mkdir, rename } from "fs/promises";
import path from "path";
import { z } from "zod";
import { analyzeBpm } from "../../../helpers/bpm";
import { readMetadata, writeMetadata } from "../../../helpers/mp3-meta";
import { Track } from "../../../track.types";
import { trackAnalyzer } from "../../trackAnalyzer";
import { publicProcedure } from "../../trpc";

export const analyzeBpmForTrack = publicProcedure
    .input(
        z.object({
            id: z.string(),
            bpm: z.boolean().default(true),
            copy: z.boolean().default(false),
            outputFolder: z.string().optional()
        })
            .refine((input) => {
                if (input.copy) {
                    return !!input.outputFolder
                }
                return true;
            })
    )
    .mutation(async ({ input: { id, bpm: shouldAnalyzeBpm, copy: shouldMoveFiles, outputFolder }, ctx: { prisma } }) => {
        console.log('anaaaaa')
        const track = await prisma.track.findFirstOrThrow({ where: { id } })
        try {
            const { file: filename, path: fullPath } = track;
            console.log(JSON.stringify({ filename, bpm: shouldAnalyzeBpm, move: shouldMoveFiles, outputFolder }))
            const file = readFileSync(fullPath);

            const bpm = String(shouldAnalyzeBpm ? await analyzeBpm(file) : (await readMetadata(fullPath))?.TBPM);
            await prisma.track.update({ where: { id }, data: { bpm: +bpm } })
            trackAnalyzer.emit('trackAnalyzed', track)


            await writeMetadata(fullPath, { TBPM: bpm });


            if (shouldMoveFiles) {
                if (!existsSync(path.join(outputFolder, bpm))) {
                    await mkdir(path.join(outputFolder, bpm));
                }
                await copyFile(fullPath, path.join(outputFolder, bpm, filename));
            }
            return bpm;

        } catch (e) {
            console.log('error')
            console.log(e)
        }

    });

export default analyzeBpmForTrack