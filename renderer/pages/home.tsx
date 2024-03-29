import { Track } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { SyntheticEvent, useCallback, useRef, useState } from "react";
import { Spinner } from "../components/spinner";
import { TrackList } from "../components/track-list";

import { api } from "../utils/api";
import { TracksInput } from "../components/tracks-input";
import { TracksOutput } from "../components/tracks-output";
const Home: NextPage = () => {
  const [progress, setProgress] = useState(0);
  const [latestTrack, setLatestTrack] = useState<{ title: string, bpm: number } | undefined>()
  const { data: outputFolder } =
    api.example.getOutputFolder.useQuery(undefined, { enabled: false });

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


  const onTrackAnalyseFinish = useCallback(
    ({ title, bpm }: Partial<Track>): void => {
      setProgress((progress) => progress + 1);
      setLatestTrack({ title, bpm })
      console.log(`received realtime update ${title} ${bpm}`);
    },
    [setProgress, setLatestTrack]
  );

  api.example.trackAnalyseUpdates.useSubscription(undefined, {
    onData: onTrackAnalyseFinish
  });
  console.log({ progess: progress, tracks });
  const analyzeTracks = useCallback(
    () => {
      setProgress(0);
      if (isAnalyzing) return;

      const formValues = {
        exportFiles: isSuccess,
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
      analyzeAllTracks,
      setProgress,
      outputFolder,
      isSuccess
    ]
  );
  const progressWidth = (progress / tracks?.length ?? 0) * 100;

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
          <div
            className="grid items-center w-full gap-4 grid-cols-2 relative"
          >
            {isSuccess ? <TracksOutput /> : <TracksInput />}
            
            <button
              type="button"
              onClick={analyzeTracks}
              disabled={isAnalyzing && !tracks?.length}
              className={`flex h-full gap-4 ${isAnalyzing ? 'w-full' : ''} items-center rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 relative overflow-hidden ${isAnalyzing || isLoadingTracks || !outputFolder ? "opacity-50" : ""
                }`}
            >
              {isAnalyzing && <Spinner />}
              <h3 className="text-xl font-bold w-full relative z-10">
                {(isSuccess && outputFolder) ? <>Copy files</> : (isSuccess) ? (
                  <>Completed &#x2713; </>
                ) : isAnalyzing ? (
                  latestTrack ? `Finished ${latestTrack.title?.substring(latestTrack.title.length - 20)}` : "Scanning tracks..."
                ) : (
                  "Scan tracks →"
                )}
              </h3>
              <div
                className="z-0 absolute h-full bg-green-600 top-0 left-0 transition-width"
                style={{ width: `${isAnalyzing ? progressWidth : 0}%` }}
              ></div>
            </button>
          </div>
          {isError && <p>{error.message}</p>}
        </div>
      </main>
    </>
  );
};

export default Home;
