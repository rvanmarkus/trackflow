import { api } from "../utils/api";

export const TracksOutput = () => {
  const { refetch: getOutputFolder, data: outputFolder } = api.example.getOutputFolder.useQuery(undefined, { enabled: false });

  return (
    <legend className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => getOutputFolder()}
        className={`rounded-xl p-4 text-white ${outputFolder ? 'bg-green-600 hover:bg-green-500' : 'bg-white/10 hover:bg-white/20 '}`}>
        {outputFolder ?? 'Select destination folder'}
      </button>
    </legend>
  );
};
