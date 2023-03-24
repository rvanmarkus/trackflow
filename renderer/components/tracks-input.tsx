import { DragEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { api } from "../utils/api";

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
  const { mutate: clearAllTracks, isLoading: isDeleting } = api.example.clearAllTracks.useMutation({ onSuccess: () => refetch() });

  const [isDragging, setDragging] = useState<boolean>(false)
  const [isTrackListVisible, setTrackListVisible] = useState<boolean>(false)
  const toggleTrackList = useCallback(() => {
    setTrackListVisible((visible) => !visible)
  }, [setTrackListVisible])
  const onDragEnter = useCallback<DragEventHandler>((event) => {
    setDragging(true)
  }, [setDragging])
  const onDragLeave = useCallback<DragEventHandler>((event) => {
    setDragging(false)
  }, [setDragging])

  useEffect(() => {
    console.log('test')
    const onFileDrop = async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('File droppp')
      setDragging(false)
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

  }, [setDragging, refetch])
  return (<legend className={`flex flex-col items-center justify-center transition-all ${isTrackListVisible ? 'absolute z-100 w-full' : 'relative w-96'}`}>
    <div onDragEnter={onDragEnter} onDragLeave={onDragLeave} className={`absolute top-0 left-0 w-full h-full z-10 ${isDragging && 'z-20'}`}></div>
    <div className={`w-full p-6 items-center justify-center rounded-xl flex flex-col gap-4 transition-all z-10 border-dashed border-2 ${isDragging ? 'bg-[hsl(280,100%,70%)] h-48' : isError ? 'bg-red-600' : isTrackListVisible ? 'bg-white' : 'bg-white/50'}`}>
      {isDragging && <p className="font-sans text-md"> Drop here </p>}
      {isError && <span>{error.message}</span>}
      {tracks?.length ? <div>
        <button onClick={toggleTrackList} className="rounded p-2 bg-teal-600">
          {isTrackListVisible ? 'Back' : `Show ${tracks?.length} Tracks`}
        </button>
        <button
          type="button"
          disabled={isDeleting || !tracks?.length}
          className="rounded p-2 mx-3 disabled:bg-red-100 bg-red-600 text-white  disabled:text-red-300"
          onClick={() => clearAllTracks()}>
          Clear
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

    </div>
  </legend>);
};
