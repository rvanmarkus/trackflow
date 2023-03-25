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
    <div className="grid grid-cols-5 gap-2 grid-flow-row-dense">
      <header
        className="rounded font-bold p-3 col-span-4 text-white"
      >
        Title
      </header>
      <header
        className="rounded font-bold p-3 text-white"
      >
        BPM
      </header>
      {tracks?.map((file, index) => {
        return (
          <>
            <a
              key={index}
              className="rounded bg-white/20 p-3 col-span-4 break-words text-white"
              onClick={() => onOpenFileInFolder(file.path)}
            >
              {file.title}
            </a>
            <div className="rounded bg-white/20 p-3 text-white">
              {file.bpm ?? "No BPM"}
            </div>
          </>
        );
      })}
    </div>
  );
};
