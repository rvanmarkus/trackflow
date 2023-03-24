import { DragEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { api } from "../utils/api";
import { TrackList } from "./track-list";

export const TracksInput: React.FunctionComponent = () => {
  const { mutateAsync: addTracks, isLoading, isSuccess, isError, error } = api.example.addTrackFiles.useMutation();
  const {
    data: tracks,
    refetch,
    isLoading: isLoadingTracks
  } = api.example.getAllTracks.useQuery();
  const addFiles = useCallback(async (filePaths?: string[]) => {
    try {
      await addTracks(filePaths)
    }
    catch (e) { console.error(`Error adding track: ${e}`) }
    finally {
      refetch()
    }
  }, [addTracks, refetch]);
  const onAddFiles = useCallback(() => addFiles(), [addFiles])
  const [isTrackListVisible, setTrackListVisible] = useState<boolean>(false)
  const toggleTrackList = useCallback(() => {
    setTrackListVisible((visible) => !visible)
  }, [setTrackListVisible])
  const { mutate: clearAllTracks, isLoading: isDeleting } = api.example.clearAllTracks.useMutation({ onSuccess: () => refetch() });
  const onClearAllTracks = useCallback(async () => {
    setTrackListVisible(false)
    clearAllTracks()
  }, [setTrackListVisible, clearAllTracks])
  useEffect(() => {
    console.log('test')
    const onFileDrop = async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('File droppp')
      const files = Array.from<{ path: string }>((event as unknown as any).dataTransfer.files).map(f => f.path);
      await addFiles(files)
    }
    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    }


    document.addEventListener('drop', onFileDrop)
    document.addEventListener('dragover', onDragOver);
    return () => {
      document.removeEventListener('drop', onFileDrop)
      document.removeEventListener('dragover', onDragOver)
    }

  }, [refetch])
  return (<legend className={`flex flex-col items-center justify-center transition-all ${isTrackListVisible ? 'absolute z-100 w-full' : 'relative'}`}>
    <div className={`w-full p-4 items-center justify-center rounded-xl flex flex-col gap-4 transition-all z-10 border-dashed border-2 ${isError ? 'bg-red-600' : isTrackListVisible ? 'bg-[#15162c]' : tracks?.length ? 'bg-green-600' : 'bg-white/50'}`}>
      {isError && <span>{error.message}</span>}
      {tracks?.length ? <div className="flex items-center justify-between w-full">
        <button type="button" onClick={toggleTrackList} className="rounded p-2 text-xl">
          {isTrackListVisible ? 'Back' : <> Selected {tracks?.length} Tracks</>}
        </button>

        <button
          type="button"
          disabled={isDeleting || !tracks?.length}
          className="disabled:bg-red-100 disabled:text-gray-300 bg-red-600 rounded h-6 w-6 mx-2`"
          onClick={onClearAllTracks}>
          X
        </button>
      </div>

        : <>
          <label className="font-sans text-xl">
            Drag and drop your music files
          </label>
          <button
            onClick={onAddFiles}
            type="button"
            className="uppercase bg-green-700 p-2 text-sm rounded"
          >
            Add Tracks
          </button>
        </>}
      {isTrackListVisible && <TrackList tracks={tracks} />}
    </div>
  </legend>);
};
