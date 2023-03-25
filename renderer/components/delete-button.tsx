import { Spinner } from "./spinner";

export const DeleteButton: React.FunctionComponent<{ disabled?: boolean, loading?: boolean, onClick: () => void }> = ({ disabled, onClick, loading }) => (<button
    type="button"
    disabled={disabled}
    className="disabled:bg-red-100 disabled:text-gray-300 bg-red-600 rounded h-6 w-6"
    onClick={onClick}>
    {loading && <Spinner />}
    X
</button>)