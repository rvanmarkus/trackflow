import { FunctionComponent } from "react";
import { api } from "../utils/api";
import { Spinner } from "./spinner";
import { useCallback } from "react";
import path from "path";
import { Track } from "@prisma/client";
import { DeleteButton } from "./delete-button";

export const TrackList: FunctionComponent = () => {
  const {
    data: tracks,
    refetch,
    isLoading: isLoadingTracks
  } = api.example.getAllTracks.useQuery();
  const { mutate: openFileInFolder } =
    api.example.openFileInFolder.useMutation();
  const { mutate: deleteTrack, isLoading: isDeleting } = api.example.deleteTrack.useMutation({ onSuccess: () => refetch() })
  const onDeleteTrack = useCallback((id: string) => deleteTrack(id), [deleteTrack])
  const onOpenFileInFolder = useCallback(
    (filename: string) => {
      openFileInFolder({ filename });
    },
    [openFileInFolder]
  );
  if (!tracks) return <h3>select tracks...</h3>;

  return (
    <div className="grid grid-cols-6 gap-2 grid-flow-row-dense">
      <header
        className="rounded font-bold p-3 col-span-4 text-white"
      >
        Title
      </header>
      <header
        className="rounded font-bold p-3 col-span-2 text-white"
      >
        BPM
      </header>
      {tracks?.map((track, index) => {
        return (
          <>
            <a
              key={index}
              className="rounded bg-white/20 p-3 col-span-4 break-words text-white"
              onClick={() => onOpenFileInFolder(track.path)}
            >
              {track.title}
            </a>
            <div className="rounded bg-white/20 col-span-1 p-3 text-white">
              {track.bpm ?? "No BPM"}
            </div>
            <div className="flex items-center">
              <DeleteButton disabled={isDeleting} onClick={() => onDeleteTrack(track.id)} />
            </div>
          </>
        );
      })}
    </div>
  );
};
