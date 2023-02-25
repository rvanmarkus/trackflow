import ffmetadata from 'ffmetadata';
import path from 'path';
const ffmpegPath = process.platform === "win32" ? "C:/ffmpeg/ffmpeg.exe" : path.join('ffmpeg', 'ffmpeg');
ffmetadata.setFfmpegPath(ffmpegPath);

export function readMetadata(filename: string): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
        ffmetadata.read(filename, function (err: Error, data: any) {
            if (err)
                reject(err);
            else
                resolve(data as Record<string, any>);
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