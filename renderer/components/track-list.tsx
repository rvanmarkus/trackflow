import { FormEventHandler, FunctionComponent } from "react";
import { api } from "../utils/api";
import { Spinner } from "./spinner";
import { useCallback } from "react";
import path from "path";
import { Track } from "@prisma/client";
import { DeleteButton } from "./delete-button";

export const TrackList: FunctionComponent = () => {
  const {
    data: tracks,
  } = api.example.getAllTracks.useQuery();

  if (!tracks) return <h3>select tracks...</h3>;

  return (
    <div className="grid grid-cols-8 gap-2 grid-flow-row-dense">
      <header
        className="rounded font-bold p-1 col-span-4 text-white"
      >
        Title
      </header>
      <header
        className="rounded font-bold p-1 col-span-2 text-white"
      >
        Artist
      </header>
      <header
        className="rounded font-bold p-1 col-span-1 text-white"
      >
        BPM
      </header>
      <div></div>
      {tracks?.map((track, index) => <div className="col-span-8" key={index}><TrackListItem track={track} /></div>)}
    </div>
  );
};

const TrackListItem: React.FunctionComponent<{ track: Track }> = ({ track }) => {
  const {
    refetch
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
  const { mutate: analyzeBpm } = api.example.analyzeBpmForTrack.useMutation()
  const onAnalyzeBpm = useCallback(() => {
    analyzeBpm({ bpm: true, id: track.id })
  }, [analyzeBpm])
  const { mutate: updateTrack, isLoading } = api.example.updateTrack.useMutation()
  const onTrackEdit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
    console.log('track edit')
    event.stopPropagation();
    event.preventDefault();
    const trackData = {
      title: (event.currentTarget.elements.namedItem('title') as HTMLInputElement).value,
      artist: (event.currentTarget.elements.namedItem('artist') as HTMLInputElement).value,
    }
    console.log({ trackData })
    updateTrack({ id: track.id, ...trackData });
  }, [track]);
  return (
    <form className="grid grid-cols-8 gap-2 grid-flow-row-dense z-100" onSubmit={onTrackEdit} id={track.id}>
      <input
        className="rounded bg-white/20 p-2 col-span-4 break-words text-white items-center flex disabled:bg-white/10 focus:bg-white/30"
        defaultValue={track.title}
        name="title"
        disabled={isLoading}
      />
      <input
        className="rounded bg-white/20 p-2 col-span-2 break-words text-white items-center flex disabled:bg-white/10 focus:bg-white/30"
        defaultValue={track.artist}
        name="artist"
        disabled={isLoading}
      />
      <div className="rounded bg-white/20 p-2 text-white items-center flex">
        {track.bpm ?? "No BPM"}
        <button type="button" onClick={onAnalyzeBpm} title="Analyze BPM only this track">👂</button>
      </div>
      <div className="flex items-center gap-2 p-2">
        <button disabled={isLoading} type="submit"> Save</button>
        <DeleteButton disabled={isDeleting} onClick={() => onDeleteTrack(track.id)} />
        <button
          type="button"
          onClick={() => onOpenFileInFolder(track.path)}
          className="text-md h-6 w-6 bg-blue-500 rounded text-center leading-5" title="Open in file explorer" >
          🔍
        </button>
      </div>
    </form>
  )
}