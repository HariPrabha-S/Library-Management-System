import { useState, useEffect } from "react";
import { FiTrash } from "react-icons/fi";
import { BookOpen, XCircle, CheckCircle } from "lucide-react";

export default function BookTable({ books, selectedBooks, filters, setFilters, limit, setLimit, onSelect, onDelete, selectedColumns, isPrintable, reportSummary, isSummary }) {
    const [viewedBook, setViewedBook] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!viewedBook) return;
            if (e.key === 'Escape' || e.key === 'Enter') {
                setViewedBook(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewedBook]);

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
    const columnsToShow = selectedColumns || ["accessionNo", "title", "author", "department", "subject"];
    const isFullDetails = columnsToShow.length > 8;

    return (
        <div className={`bg-white rounded-2xl ${isPrintable ? "print-container" : "p-6 shadow-lg border border-gray-100 overflow-hidden"}`}>

            {/* Table Controls (Limit) - Hide in printable mode */}
            {!isPrintable && (
                <div className="flex justify-between items-center mb-4 text-(--font-body)">
                    <div className="text-sm text-gray-500">
                        Showing {books.length} records
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 font-medium">Show:</span>
                        <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50 focus-within:ring-1 focus-within:ring-(--color-primary) transition-all">
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
                                className="w-16 px-2 py-1.5 text-sm outline-none border-l bg-white text-center font-semibold text-(--color-primary)"
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
                                                <span
                                                    className={`font-semibold ${isPrintable ? "text-black" : "text-gray-900 group-hover:text-(--color-primary) hover:underline transition-colors cursor-pointer"} ${isFullDetails ? "line-clamp-2" : ""}`}
                                                    onClick={(e) => {
                                                        if (!isPrintable) {
                                                            e.stopPropagation();
                                                            setViewedBook(book);
                                                        }
                                                    }}
                                                >
                                                    {book[col]}
                                                </span>
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
                                                    className={`${isFullDetails ? "w-3 h-3" : "w-4 h-4"} rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary) cursor-pointer`}
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
                    {isPrintable && reportSummary && (
                        <tfoot>
                            <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                {columnsToShow.map((col, idx) => (
                                    <td key={`footer-${col}`} className="py-3 px-3 border border-gray-300 text-black">
                                        {col === "title" && "TOTAL RECORDS:"}
                                        {col === "accessionNo" && "SUMMARY"}
                                        {col === "department" && "DEPARTMENT TOTALS"}
                                        {(col === "price" || col === "totalPrice") && `₹${reportSummary.totalPrice.toLocaleString()}`}
                                    </td>
                                ))}
                                <td className="py-3 px-3 border border-gray-300 text-center text-black">
                                    {reportSummary.totalQty}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>

            </div>

            {/* Book Details Modal */}
            {viewedBook && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={(e) => { e.stopPropagation(); setViewedBook(null); }}>
                    <div className="bg-white rounded-2xl animate-fade-in shadow-2xl relative" style={{ maxWidth: 500, width: '90%', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ height: 120, background: 'linear-gradient(135deg, var(--color-primary), #5a0808)', position: 'relative' }}>
                            <button style={{ position: 'absolute', top: 16, right: 16, background: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onClick={() => setViewedBook(null)}>
                                <XCircle size={20} color="var(--text-secondary)" />
                            </button>
                            <div style={{ position: 'absolute', bottom: -30, left: 30, width: 80, height: 110, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                                <BookOpen size={40} color="var(--color-primary)" />
                            </div>
                        </div>

                        <div style={{ padding: '50px 30px 30px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{viewedBook.title}</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>by {viewedBook.author}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>ISBN / Accession</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedBook.isbn || viewedBook.accessionNo}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Subject & Dept</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedBook.subject} ({viewedBook.department})</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Library Section</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedBook.issueType}</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Publisher</label>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedBook.publisher || "-"}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
                                <div>
                                    {viewedBook.availableCopies > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold"><CheckCircle size={12} /> {viewedBook.availableCopies} Available</span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs font-semibold"><XCircle size={12} /> Out of Stock</span>
                                    )}
                                </div>
                                <button
                                    className="px-6 py-2 bg-(--color-primary) hover:bg-[#610a0a] text-white rounded-lg transition-colors font-medium text-sm shadow-md"
                                    onClick={() => setViewedBook(null)}
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper functions for readability
function isHeaderFilterable(col) {
    return ["department", "availability"].includes(col);
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
