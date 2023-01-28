import { FunctionComponent } from "react";

export const TrackList: FunctionComponent<{tracks: string[] | undefined}> = ({tracks}) => {
    return (
        <div className="flex flex-col gap-2">
        {tracks ? tracks.map((file, index) => <div className="bg-white/20 p-3 rounded text-white" key={index}>{file}</div>) : "Loading tracks..."}
      </div>
    );
}