import { FC } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export interface PaginationProps {
    /** current page (1‑based) */
    currentPage: number;
    /** how many rows per page */
    rowsPerPage: number;
    /** total number of rows in the dataset */
    totalItems: number;
    /** dropdown options for rows per page */
    rowsPerPageOptions?: number[];
    /** called with new page when user clicks prev/next */
    onPageChange: (page: number) => void;
    /** called with new rows‑per‑page; parent should reset page to 1 */
    onRowsPerPageChange: (rowsPerPage: number) => void;
    /** optional extra classes */
    className?: string;
}

const Pagination: FC<PaginationProps> = ({
    currentPage,
    rowsPerPage,
    totalItems,
    rowsPerPageOptions = [5, 10, 15],
    onPageChange,
    onRowsPerPageChange,
    className = "",
}) => {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

    return (
        <div
            className={`mt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 px-3 sm:px-6 ${className}`}
        >
            {/* Rows‑per‑page selector */}
            <div className="flex items-center space-x-2">
                <p className="text-greyText text-base sm:text-lg">Rows per page:</p>
                <select
                    value={rowsPerPage}
                    onChange={(e) => onRowsPerPageChange(+e.target.value)}
                    className="text-sm text-greyText border rounded p-1 outline-none"
                >
                    {rowsPerPageOptions.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            </div>

            {/* Page info + nav */}
            <div className="text-base xl:text-xl sm:text-xl text-black flex items-center">
                <span>
                    {startIndex + 1}-{endIndex} of {totalItems}
                </span>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="ml-4"
                >
                    <IoIosArrowBack
                        className={`text-xl sm:text-xl text-greyText ${currentPage === 1 ? "opacity-50" : ""
                            }`}
                    />
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-4"
                >
                    <IoIosArrowForward
                        className={`text-xl sm:text-xl text-greyText ${currentPage === totalPages ? "opacity-50" : ""
                            }`}
                    />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
