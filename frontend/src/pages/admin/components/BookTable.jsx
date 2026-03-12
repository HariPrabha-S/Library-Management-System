import { FiTrash } from "react-icons/fi";

export default function BookTable({ books, selectedBooks, filters, setFilters, limit, setLimit, onSelect, onDelete, selectedColumns, isPrintable, reportSummary, isSummary }) {

    // Map of internal field names to display names
    const fieldDisplayNames = {
        title: "Title",
        author: "Author",
        isbn: "ISBN",
        accessionNo: "Accession No",
        subtitle: "Subtitle",
        publisher: "Publisher",
        callNumber: "Call Number",
        edition: "Edition",
        yearOfPublishing: "Year",
        department: "Dept.",
        subject: "Subject",
        issueType: "Issue Type",
        availability: "Status",
        price: "Price",
        purchaseDate: "Purchase Date",
        quantity: "Total Books",
        totalPrice: "Total Value"
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Determine which columns to show
    const columnsToShow = selectedColumns || ["accessionNo", "title", "author", "department", "subject", "issueType"];
    const isFullDetails = columnsToShow.length > 8;

    return (
        <div className={`bg-white rounded-2xl ${isPrintable ? "print-container" : "p-6 shadow-lg border border-gray-100 overflow-hidden"}`}>

            {/* Table Controls (Limit) - Hide in printable mode */}
            {!isPrintable && (
                <div className="flex justify-between items-center mb-4 text-[var(--font-body)]">
                    <div className="text-sm text-gray-500">
                        Showing {books.length} records
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 font-medium">Show:</span>
                        <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50 focus-within:ring-1 focus-within:ring-[var(--color-primary)] transition-all">
                            <select
                                value={[10, 100, 1000].includes(limit) ? limit : "custom"}
                                onChange={(e) => {
                                    if (e.target.value !== "custom") {
                                        setLimit(Number(e.target.value));
                                    }
                                }}
                                className="pl-3 pr-1 py-1.5 text-sm outline-none bg-transparent border-none cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={100}>100</option>
                                <option value={1000}>1000</option>
                                <option value="custom">Custom</option>
                            </select>
                            <input
                                type="number"
                                min="1"
                                max="5000"
                                value={limit}
                                onChange={(e) => setLimit(Math.max(1, Math.min(5000, Number(e.target.value))))}
                                className="w-16 px-2 py-1.5 text-sm outline-none border-l bg-white text-center font-semibold text-[var(--color-primary)]"
                                placeholder="Qty"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className={isPrintable ? "" : "overflow-x-auto custom-scrollbar border border-gray-100 rounded-xl"}>

                <table className={`w-full text-left ${isPrintable ? "border-collapse border border-gray-300" : isFullDetails ? "min-w-[1500px]" : "min-w-[1200px]"}`}>
                    <thead>
                        <tr className={`${isPrintable ? "bg-gray-50 border-b border-gray-300" : "border-b"} text-gray-700 ${isFullDetails ? "text-[10px]" : "text-sm"} font-semibold leading-tight`}>
                            {columnsToShow.map(col => (
                                <th key={col} className={`${isFullDetails ? "py-2.5 px-2" : "py-4 px-3"} ${!isPrintable ? (isFullDetails ? "min-w-[110px]" : "min-w-[150px]") : ""} ${isPrintable ? "border border-gray-300 px-3" : ""}`}>
                                    <div className="flex flex-col gap-1">
                                        <span className={isPrintable ? "text-black" : ""}>{fieldDisplayNames[col] || col}</span>

                                        {/* Header Filters - Hide in printable mode */}
                                        {!isPrintable && renderHeaderFilter(col, filters, handleFilterChange)}
                                    </div>
                                </th>
                            ))}
                            {!isSummary && <th className={`py-4 px-3 text-center ${isPrintable ? "border border-gray-300 px-3 text-center text-black" : "min-w-[100px]"}`}>Available</th>}
                            {!isPrintable && <th className="py-4 px-3 text-center sticky right-0 bg-white border-l min-w-[100px] z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">Actions</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {books.length === 0 ? (
                            <tr>
                                <td colSpan={columnsToShow.length + (isPrintable ? 1 : 2)} className="text-center py-6 text-gray-400">
                                    No books found
                                </td>
                            </tr>
                        ) : (
                            books.map((book) => (
                                <tr
                                    key={book._id}
                                    className={`${isPrintable ? "border-b border-gray-300" : "border-b last:border-none hover:bg-gray-50 transition"} ${isFullDetails ? "text-[10px]" : "text-sm"} cursor-pointer leading-tight`}
                                    onClick={() => !isPrintable && onSelect(book._id)}
                                >
                                    {columnsToShow.map(col => (
                                        <td key={col} className={`${isFullDetails ? "py-2.5 px-2" : "py-4 px-3"} ${isPrintable ? "border border-gray-300 px-3" : ""}`}>
                                            {col === "title" ? (
                                                <span className={`font-semibold ${isPrintable ? "text-black" : "text-gray-900 group-hover:text-[var(--color-primary)] transition-colors"} ${isFullDetails ? "line-clamp-2" : ""}`}>{book[col]}</span>
                                            ) : (col === "price" || col === "totalPrice") ? (
                                                <span className={isPrintable ? "text-black" : "text-gray-600 font-semibold text-nowrap"}>₹{(book[col] || 0).toLocaleString()}</span>
                                            ) : (
                                                <span className={isPrintable ? "text-black" : "text-gray-600"}>{book[col] || "-"}</span>
                                            )}
                                        </td>
                                    ))}
                                    {!isSummary && (
                                        <td className={`${isFullDetails ? "py-2 px-1" : "py-4 px-3"} text-center ${isPrintable ? "border border-gray-300 text-center" : ""}`}>
                                            <span className={isPrintable ? "text-black font-semibold" : `inline-flex items-center justify-center min-w-[30px] h-5 px-1.5 rounded-full ${isFullDetails ? "text-[9px]" : "text-[10px]"} font-bold ${book.availableCopies > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                                                {book.availableCopies}
                                            </span>
                                        </td>
                                    )}

                                    {!isPrintable && (
                                        <td className={`${isFullDetails ? "py-2 px-2" : "py-4 px-3"} sticky right-0 bg-white group-hover:bg-gray-50 border-l transition-colors z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]`}>
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBooks.includes(book._id)}
                                                    onChange={() => { }} // Controlled by row click
                                                    className={`${isFullDetails ? "w-3 h-3" : "w-4 h-4"} rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer`}
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(book._id);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete book"
                                                >
                                                    <FiTrash size={isFullDetails ? 12 : 14} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>

                    {reportSummary && (
                        <tfoot>
                            <tr className="bg-gray-100/80 font-bold border-t-2 border-gray-300">
                                {columnsToShow.map((col, idx) => (
                                    <td key={`footer-${col}`} className={`py-4 px-3 ${isPrintable ? "border border-gray-300 text-black" : "text-gray-900"}`}>
                                        {col === "title" && "TOTAL RECORDS:"}
                                        {col === "accessionNo" && "SUMMARY"}
                                        {col === "department" && "TOTALS"}
                                        {(col === "price" || col === "totalPrice") && `₹${reportSummary.totalPrice.toLocaleString()}`}
                                    </td>
                                ))}
                                <td className={`py-4 px-3 text-center ${isPrintable ? "border border-gray-300 text-black" : "text-gray-900"}`}>
                                    {reportSummary.totalQty}
                                </td>
                                {!isPrintable && <td className="bg-gray-100/80 border-l"></td>}
                            </tr>
                        </tfoot>
                    )}
                </table>

            </div>
        </div>
    );
}

// Helper functions for readability
function isHeaderFilterable(col) {
    return ["department", "issueType", "availability"].includes(col);
}

function renderHeaderFilter(col, filters, handleFilterChange) {
    if (col === "department") {
        return (
            <select
                value={filters.department}
                onChange={(e) => handleFilterChange("department", e.target.value)}
                className="font-normal text-xs border rounded px-1 py-0.5 outline-none bg-white"
            >
                <option value="">All</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="IT">IT</option>
                <option value="AIDS">AIDS</option>
                <option value="CIVIL">CIVIL</option>
                <option value="MECH">MECH</option>
            </select>
        );
    }
    if (col === "issueType") {
        return (
            <select
                value={filters.issueType}
                onChange={(e) => handleFilterChange("issueType", e.target.value)}
                className="font-normal text-xs border rounded px-1 py-0.5 outline-none bg-white"
            >
                <option value="">All</option>
                <option value="Reference">Reference</option>
                <option value="Stack">Stack</option>
            </select>
        );
    }
    if (col === "availability") {
        return (
            <select
                value={filters.availability}
                onChange={(e) => handleFilterChange("availability", e.target.value)}
                className="font-normal text-xs border rounded px-1 py-0.5 outline-none bg-white"
            >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="issued">Issued</option>
            </select>
        );
    }
    return null;
}
