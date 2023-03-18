import { FunctionComponent } from "react";
import { api } from "../utils/api";
import { Spinner } from "./spinner";
import { useCallback } from "react";
import path from "path";
import { Track } from "@prisma/client";

export const TrackList: FunctionComponent<{
  tracks: Track[] | undefined;
}> = ({ tracks }) => {
  const { mutate: openFileInFolder } =
    api.example.openFileInFolder.useMutation();
  const onOpenFileInFolder = useCallback(
    (filename: string) => {
      openFileInFolder({ filename });
    },
    [openFileInFolder]
  );
  if (!tracks) return <h3>select tracks...</h3>;

  return (
    <div className="flex flex-col gap-2">
      {tracks?.map((file, index) => {
        return (
          <div
            className={`flex gap-2 ${!file.bpm ? "animate-pulse" : ""}`}
            key={index}
          >
            <a
              className="rounded bg-white/20 p-3 text-white"
              onClick={() => onOpenFileInFolder(file.file)}
            >
              {file.title}
            </a>
            <div className="rounded bg-white/20 p-3 text-white">
              {file.bpm ?? "No BPM"}
            </div>
          </div>
        );
      })}
    </div>
  );
};
