import { BeatLoader } from "react-spinners";

interface TableNotFoundProps {
    colSpan?: number;
    message?: string;
}

interface TableLoadingProps {
    colSpan?: number;
}


function TableNotFound({
    colSpan = 1,
    message = " Data tidak tersedia",
}: TableNotFoundProps) {
    return (
        <tr>
            <td
                colSpan={colSpan}
                className="text-center py-16 text-gray-700 dark:text-gray-400"
            >
                {message}
            </td>
        </tr>
    );
}

// TableLoading Component
function TableLoading({ colSpan = 1 }: TableLoadingProps) {
    return (
        <tr>
            <td colSpan={colSpan} className="text-center py-16">
                <div className="sweet-loading">
                    <BeatLoader color="blue" />
                </div>
            </td>
        </tr>
    );
}

export {

    TableNotFound,
    TableLoading,
};