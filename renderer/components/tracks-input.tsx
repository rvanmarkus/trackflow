import { DragEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { api } from "../utils/api";
import { DeleteButton } from "./delete-button";
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
  return (
    <div className={`w-full p-4 items-center justify-center rounded-xl flex flex-col gap-4 transition-all z-10 ${isError ? 'bg-red-600' : isTrackListVisible ? 'bg-[#15162c] shadow-xl' : tracks?.length ? 'bg-green-600' : 'bg-white/50'} ${isTrackListVisible ? 'absolute z-100 w-full' : 'relative h-full'}`}>
      {isError && <span>{error.message}</span>}
      {tracks?.length ? <div className="flex items-center justify-between w-full">
        <button type="button" onClick={toggleTrackList} className="rounded p-2 text-md grow">
          {isTrackListVisible ? 'Back' : <> Selected {tracks?.length} Tracks</>}
        </button>

        {!isTrackListVisible && <DeleteButton disabled={isDeleting || !tracks?.length} onClick={onClearAllTracks} />}
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
      {isTrackListVisible && <TrackList />}
    </div>
  );
};
