import { DragEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { api } from "../utils/api";

export const TracksInput: React.FunctionComponent = () => {
  const { mutateAsync: addTracks, isLoading, isSuccess, isError, error } = api.example.addTrackFiles.useMutation();
  const {
    data: tracks,
    refetch,
    isLoading: isLoadingTracks
  } = api.example.getAllTracks.useQuery();
  const openFolder = useCallback(() => {
    console.log("opening folder");
    addTracks();
  }, [addTracks]);

  const [isDragging, setDragging] = useState<boolean>()

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
      await addTracks(Array.from<{ path: string }>((event as unknown as any).dataTransfer.files).map(f => f.path))
      refetch()
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
  return (<legend className="flex flex-col items-center justify-center p-4 relative w-96">
    <div onDragEnter={onDragEnter} onDragLeave={onDragLeave} className={`absolute top-0 left-0 w-full h-full z-10 ${isDragging && 'z-20'}`}></div>
    <div className={`w-full border-dashed border-2 p-12 items-center justify-center rounded-xl flex flex-col gap-4 transition-all z-10 ${isDragging ? 'bg-[hsl(280,100%,70%)] h-48' : isError ? 'bg-red-600' : 'bg-white/50'}`}>
      {isDragging ? <p className="font-sans text-2xl"> Drop here </p> : isError ? <span>{error.message}</span> : <><label className="font-sans text-xl">
        Drag and drop your music files{" "}
        <span className="italic">or </span>
        <button
          onClick={openFolder}
          type="button"
          className="uppercase bg-green-700 p-2 text-sm "
        >
          Add Tracks
        </button>
      </label>
      </>}

      <h2>{isLoadingTracks ? 'Loading tracks...' : `${tracks.length} Tracks`}</h2>
    </div>
  </legend>);
};
