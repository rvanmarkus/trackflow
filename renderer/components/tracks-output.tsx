import { api } from "../utils/api";

export const TracksOutput = () => {
  const { refetch: getOutputFolder, data: outputFolder } = api.example.getOutputFolder.useQuery(undefined, { enabled: false });

  return (
      <button
        type="button"
        onClick={() => getOutputFolder()}
        className={`rounded-xl h-full p-4 text-white break-words ${outputFolder ? 'bg-green-600 hover:bg-green-500 text-md' : 'bg-white/10 hover:bg-white/20 '}`}>
        {outputFolder ?? 'Select destination folder'}
      </button>
  );
};
