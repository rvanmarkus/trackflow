export interface Track {
    filename: string;
    title: string;
    artist?: string | undefined;
    bpm: number | undefined;
    isAnalyzing?: boolean | undefined;
}