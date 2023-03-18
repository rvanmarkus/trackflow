import { Track } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { SyntheticEvent, useCallback, useRef, useState } from "react";
import { Spinner } from "../components/spinner";
import { TrackList } from "../components/track-list";

import { api } from "../utils/api";

const Home: NextPage = () => {
  const [progess, setProgress] = useState(0);
  const { mutate: askMusicFolder } =
    api.example.addTrackFiles.useMutation();
  const { refetch: getOutputFolder, data: outputFolder } =
    api.example.getOutputFolder.useQuery(undefined, { enabled: false });

  const openFolder = useCallback(() => {
    console.log("opening folder");
    askMusicFolder();
  }, [askMusicFolder]);
  const {
    data: tracks,
    isError,
    error,
    isLoading: isLoadingTracks,
  } = api.example.getAllTracks.useQuery();

  const {
    mutateAsync: analyzeAllTracks,
    isLoading: isAnalyzing,
    isSuccess,
  } = api.example.analyzeAllTracks.useMutation();

  const formRef = useRef<HTMLFormElement>(null);
  const utils = api.useContext();
  const optimisticTrackUpdate = useCallback(
    (filename: string, partial: Partial<Track>) =>
      utils.example.getAllTracks.setData(undefined, (data) => {
        if (!data) return;
        return data.map((existing) => {
          if (existing.file === filename) {
            return { ...existing, ...partial };
          }
          return existing;
        });
      }),
    [utils.example.getAllTracks]
  );
  const onTrackAnalyseFinish = useCallback(
    ({
      filename,
      bpm,
    }: {
      filename?: string;
      bpm?: number;
      title?: string;
      artist?: string;
      isAnalyzing?: boolean;
    }): void => {
      setProgress((progress) => progress + 1);
      console.log(`received realtime update ${filename} ${bpm}`);
      optimisticTrackUpdate(filename, {
        bpm,
      });
    },
    [optimisticTrackUpdate, setProgress, tracks]
  );

  api.example.trackAnalyseUpdates.useSubscription(undefined, {
    onData: onTrackAnalyseFinish,
  });
  console.log({ progess, tracks });
  const analyzeTracks = useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      const form = formRef.current;
      event.preventDefault();
      setProgress(0);
      if (!form || isAnalyzing || !tracks) return;

      const formValues = {
        keepOriginalFiles: false,
      };
      void (async (formValues) => {
        try {
          await analyzeAllTracks({ ...formValues, outputFolder });
        } catch (error) {
          console.log({ error });
        }
      })(formValues);
    },
    [
      isAnalyzing,
      tracks,
      optimisticTrackUpdate,
      analyzeAllTracks,
      setProgress,
    ]
  );
  const progressWidth = (progess / tracks?.length ?? 0) * 100;
  const Seperator = () => (
    <div className="w-[2px] bg-white h-4 m-0 rounded"></div>
  );
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Track<span className="text-[hsl(280,100%,70%)]">Flow</span>
          </h1>
          {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8"> */}
          <form
            onSubmit={analyzeTracks}
            ref={formRef}
            className="flex flex-col items-center justify-center"
          >
            <legend className="flex flex-col items-center p-4">
              <div className="bg-white/50 border-dashed border-2 p-12 text-center flex gap-4">
                <label className="font-sans text-xl">
                  Drag and drop your music files{" "}
                  <span className="italic">or</span>
                </label>
                <button
                  onClick={openFolder}
                  type="button"
                  className="uppercase bg-green-700 p-2 text-sm"
                >
                  Open folder
                </button>
              </div>
            </legend>
            <Seperator />
            <legend className="flex flex-col items-center p-4">

              <button onClick={() => getOutputFolder()} className="rounded-xl bg-white/10 p-4 text-white hover:bg-white/2">{outputFolder ?? 'Select destination folder'}</button>
            </legend>
            <Seperator />

            <button
              type="submit"
              disabled={isAnalyzing}
              className={`flex max-w-xs gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 relative overflow-hidden ${isAnalyzing || isLoadingTracks ? "cursor-wait" : ""
                }`}
            >
              {isAnalyzing && <Spinner />}
              <h3 className="text-2xl font-bold z-10">
                {isSuccess ? (
                  <>Completed &#x2713; </>
                ) : isAnalyzing ? (
                  "Scanning tracks..."
                ) : (
                  "Scan tracks→"
                )}
              </h3>

              <div
                className="z-0 absolute h-full bg-green-600 top-0 left-0 transition-width"
                style={{ width: `${isAnalyzing ? progressWidth : 0}%` }}
              ></div>
            </button>
          </form>
          {/* </div> */}
          {isError && <p>{error.message}</p>}
          <TrackList tracks={tracks as Track[]} />
        </div>
      </main>
    </>
  );
};

export default Home;
