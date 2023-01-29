import { FunctionComponent } from "react";
import { Track } from "../track.types";

export const TrackList: FunctionComponent<{ tracks: Track[] | undefined }> = ({ tracks }) => {
  if (!tracks) return <>Loading tracks...</>

  return (
    <div className="flex flex-col gap-2">
      {tracks.map((file, index) => (
        <div className="flex gap-2"  key={index}>
          <div className="bg-white/20 p-3 rounded text-white" >
            {file.title}
          </div>
          <div className="bg-white/20 p-3 rounded text-white">
                  {file.bpm}
            </div>
        </div>

      ))}
    </div>
  );
}