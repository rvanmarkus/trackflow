import { FunctionComponent } from "react";
import { Track } from "../track.types";
import { Spinner } from "./spinner";

export const TrackList: FunctionComponent<{ tracks: Track[] | undefined }> = ({
  tracks,
}) => {
  if (!tracks) return <Spinner>Loading tracks...</Spinner>;

  return (
    <div className="flex flex-col gap-2">
      {tracks.map((file, index) => {
        return (
          <div className={`flex gap-2 ${file.isAnalyzing ? 'animate-pulse' : ''}`} key={index}>
            <div className="rounded bg-white/20 p-3 text-white">
              {file.title}
            </div>
            <div className="rounded bg-white/20 p-3 text-white">{file.bpm ?? 'No BPM'}</div>
          </div>
        );
      })}
    </div>
  );
};
