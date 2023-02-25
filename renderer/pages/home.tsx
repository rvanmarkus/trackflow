import { useQueryClient } from "@tanstack/react-query";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { SyntheticEvent, useCallback, useRef, useState } from "react";
import { Spinner } from "../components/spinner";
import { TrackList } from "../components/track-list";
import { Track } from "../track.types";

import { api } from "../utils/api";

const Home: NextPage = () => {
  // const [musicFolder, setMusicFolder] = useState<string | undefined>(
  //   "/Users/robbert/projects/trackflow/music"
  // );
  const { data: musicFolder, refetch: askMusicFolder } =
    api.example.getMusicFolder.useQuery(null, { enabled: false });
  const openFolder = useCallback(() => {
    console.log("opening folder");
    askMusicFolder();
  }, [askMusicFolder]);
  const {
    data: tracks,
    isError,
    error,
    isLoading: isLoadingTracks,
  } = api.example.getAllTracks.useQuery(musicFolder, {
    enabled: !!musicFolder,
  });
  const { mutateAsync: analyzeBpm, isLoading: isAnalyzing } =
    api.example.analyzeBpmForTrack.useMutation();
  // const openFolder = useCallback(() => {

  //   if (filePaths) {
  //     setMusicFolder(filePaths[0]);
  //   }
  // }, [])
  const formRef = useRef<HTMLFormElement>(null);
  console.log(tracks)
  const utils = api.useContext();
  const optimisticTrackUpdate = useCallback(
    (filename: string, partial: Partial<Track>) =>
      utils.example.getAllTracks.setData(undefined, (data) => {
        if (!data) return;
        return data.map((existing) => {
          if (existing.filename === filename) {
            return { ...existing, ...partial };
          }
          return existing;
        });
      }),
    [utils.example.getAllTracks]
  );
  const analyzeTracks = useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      const form = formRef.current;
      event.preventDefault();

      if (!form || isAnalyzing || !tracks) return;

      const formValues = {
        bpm: (form.elements.namedItem("bpm") as HTMLInputElement).checked,
        move: (form.elements.namedItem("move") as HTMLInputElement).checked,
      };
      console.log({ formValues });

      void (async (formValues) => {
        for (const track of tracks) {
          console.log(track, tracks);
          console.log("hier");

          optimisticTrackUpdate(track.filename, { isAnalyzing: true });
          try {
            const bpm = Number(
              await analyzeBpm({
                filename: track.filename,
                musicFolder,
                ...formValues,
              })
            );

            optimisticTrackUpdate(track.filename, {
              bpm,
              isAnalyzing: false,
            });
          } catch (error) {
            console.log({ error });
          }
        }
      })(formValues);
    },
    [isAnalyzing, tracks, optimisticTrackUpdate, analyzeBpm, musicFolder]
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
            <button onClick={openFolder}>Open folder</button>
            <div className="flex gap-2 p-4 text-xl text-white">
              <input id="bpm" type="checkbox" name="bpm" />
              <label htmlFor="bpm">Analyse BPM</label>
            </div>
            <div className="flex gap-2 p-4 text-xl text-white">
              <input id="move" type="checkbox" name="move" />
              <label htmlFor="move">Move files</label>
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className={`flex max-w-xs gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 ${
                isAnalyzing || isLoadingTracks ? "cursor-wait" : ""
              }`}
            >
              {isAnalyzing && <Spinner />}
              <h3 className="text-2xl font-bold">
                {isAnalyzing ? "Analyzing..." : "Analyze tracks →"}
              </h3>
            </button>
          </form>
          {/* </div> */}
          {isError && <p>{error.message}</p>}
          <TrackList tracks={tracks} />
        </div>
      </main>
    </>
  );
};

export default Home;
