import { Track } from '@prisma/client';
import ffmetadata from 'ffmetadata';
import path from 'path';
const ffmpegPath = process.platform === "win32" ? "C:/ffmpeg/ffmpeg.exe" : path.join('ffmpeg', 'ffmpeg');
ffmetadata.setFfmpegPath(ffmpegPath);
export type MP3Metadata = Record<string, string> & {
    TBPM?: string,
    artist?: string
    title: string
}
export function readMetadata(filename: string): Promise<MP3Metadata> {
    return new Promise((resolve, reject) => {
        ffmetadata.read(filename, function (err: Error, data: any) {
            if (err)
                reject(new Error(`Error reading metadata for file: ${filename} Error: ${err}`));
            else
                resolve(data as MP3Metadata);
        });
    })
}

export function writeMetadata(filename: string, data: Record<string, any>): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmetadata.write(filename, data, function (err: Error) {
            if (err) reject(err);
            else resolve();
        });
    })
}

export function trackToMetadata({ bpm, artist, title }: Pick<Track, "bpm" | "artist" | "title">): MP3Metadata {
    return {
        title,
        artist,
        ...bpm ? { TBPM: bpm.toString() } : {},
    }
}
export function metadataToTrack({ title, artist, TBPM }) {
    return {
        title,
        artist,
        ...TBPM ? { bpm: +TBPM } : {}
    }
}