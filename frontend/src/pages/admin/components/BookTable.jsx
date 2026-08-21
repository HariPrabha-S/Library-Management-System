import { useState, useEffect } from "react";
import { FiTrash2, FiEye, FiEdit2, FiTrash } from "react-icons/fi";
import { BookOpen, XCircle, CheckCircle } from "lucide-react";
import adminService from "../services/adminService";

export default function BookTable({ 
    books, 
    selectedBooks, 
    filters, 
    setFilters, 
    limit, 
    setLimit, 
    onSelect, 
    onDelete, 
    selectedColumns, 
    isPrintable, 
    reportSummary, 
    isSummary,
    activeBookId,
    currentPage = 1,
    setCurrentPage = () => {},
    totalBooksCount = 0
}) {
    const [viewedBook, setViewedBook] = useState(null);
    const [activeTab, setActiveTab] = useState("details");
    const [copies, setCopies] = useState([]);
    const [loadingCopies, setLoadingCopies] = useState(false);

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

    useEffect(() => {
        if (!viewedBook) {
            setCopies([]);
            setActiveTab("details");
            return;
        }

        const fetchCopies = async () => {
            setLoadingCopies(true);
            try {
                const res = await adminService.getBookCopies(viewedBook.id);
                if (res.success) {
                    setCopies(res.copies || []);
                } else {
                    console.error("Failed to load copies:", res.message);
                }
            } catch (err) {
                console.error("Error fetching copies:", err);
            } finally {
                setLoadingCopies(false);
            }
        };

        fetchCopies();
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
        year: "Year",
        department: "Department",
        subject: "Subject",
        availability: "Status",
        price: "Price",
        purchaseDate: "Purchase Date",
        totalCopies: "Copies",
        availableCopies: "Available",
        issueType: "Issue Type",
        status: "Status"
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Determine columns for printable report
    const columnsToShow = selectedColumns || ["accessionNo", "title", "author", "department", "subject"];
    const isFullDetails = columnsToShow.length > 8;

    // --- RENDER PRINTABLE MODE ---
    if (isPrintable) {
        return (
            <div className="bg-white rounded-2xl print-container">
                <table className="w-full text-left border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-300 text-gray-700 text-sm font-semibold leading-tight">
                            {columnsToShow.map(col => (
                                <th key={col} className="border border-gray-300 px-3 py-3 font-semibold text-black">
                                    {fieldDisplayNames[col] || col}
                                </th>
                            ))}
                            {!isSummary && <th className="border border-gray-300 px-3 py-3 text-center text-black font-semibold">Available</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {books.length === 0 ? (
                            <tr>
                                <td colSpan={columnsToShow.length + 1} className="text-center py-6 text-gray-400">
                                    No books found
                                </td>
                            </tr>
                        ) : (
                            books.map((book) => (
                                <tr key={book._id || book.id} className="border-b border-gray-300 text-sm leading-tight">
                                    {columnsToShow.map(col => (
                                        <td key={col} className="border border-gray-300 px-3 py-2.5 text-black">
                                            {(col === "price" || col === "totalPrice") ? (
                                                <span>₹{(book[col] || 0).toLocaleString()}</span>
                                            ) : (
                                                <span>{book[col] || "-"}</span>
                                            )}
                                        </td>
                                    ))}
                                    {!isSummary && (
                                        <td className="border border-gray-300 px-3 py-2.5 text-center text-black font-semibold">
                                            {book.availableCopies}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                    {reportSummary && (
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
        );
    }

    // --- RENDER NORMAL DASHBOARD MODE ---
    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 overflow-hidden">
            
            {/* Table Header Controls */}
            <div className="flex justify-between items-center mb-4 font-body">
                <div className="text-sm text-gray-500 font-medium">
                    Showing {books.length} of {totalBooksCount} records
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 font-medium">Show:</span>
                    <select
                        value={limit}
                        onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#790c0c]"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
            
            {/* Table wrapper */}
            <div className="overflow-x-auto custom-scrollbar border border-gray-100 rounded-xl">
                <table className="w-full text-left min-w-[1100px] border-collapse">
                    <thead>
                        <tr className="border-b bg-gray-50/50 text-gray-700 text-sm font-semibold leading-tight">
                            {/* Selection circle header */}
                            <th className="py-4 px-3 w-[50px] text-center"></th>
                            <th className="py-4 px-3 min-w-[200px]">Title</th>
                            <th className="py-4 px-3 min-w-[150px]">Accession Numbers</th>
                            <th className="py-4 px-3 min-w-[150px]">Author</th>
                            <th className="py-4 px-3 min-w-[150px]">Department</th>
                            <th className="py-4 px-3 min-w-[120px]">Subject</th>
                            <th className="py-4 px-3 text-center w-[80px]">Copies</th>
                            <th className="py-4 px-3 text-center w-[80px]">Available</th>
                            <th className="py-4 px-3 text-center w-[100px]">Issue Type</th>
                            <th className="py-4 px-3 text-center w-[130px]">Status</th>
                            <th className="py-4 px-3 text-center sticky right-0 bg-white border-l w-[120px] z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.length === 0 ? (
                            <tr>
                                <td colSpan="11" className="text-center py-8 text-gray-400 font-medium">
                                    No books found
                                </td>
                            </tr>
                        ) : (
                            books.map((book) => {
                                const isSelected = (book._id || book.id) === activeBookId;
                                return (
                                    <tr
                                        key={book._id || book.id}
                                        className={`border-b last:border-none transition duration-150 text-sm leading-tight text-gray-600 hover:bg-gray-50/80 cursor-pointer ${isSelected ? "bg-[#790c0c]/5 hover:bg-[#790c0c]/10" : ""}`}
                                        onClick={() => onSelect(book._id || book.id)}
                                    >
                                        {/* Radio Indicator Column */}
                                        <td className="py-4 px-3 text-center">
                                            <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-[#790c0c] bg-[#790c0c]" : "border-gray-300"}`}>
                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                        </td>
                                        {/* Title (Link style) */}
                                        <td className="py-4 px-3">
                                            <span 
                                                className="font-bold text-gray-900 hover:text-[#790c0c] hover:underline cursor-pointer transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewedBook(book);
                                                }}
                                            >
                                                {book.title}
                                            </span>
                                        </td>
                                        {/* Accession Numbers Range */}
                                        <td className="py-4 px-3 font-semibold text-gray-800">
                                            {book.accessionNumbers || "-"}
                                        </td>
                                        {/* Author */}
                                        <td className="py-4 px-3">{book.author || "-"}</td>
                                        {/* Department */}
                                        <td className="py-4 px-3 text-xs">{book.department || "-"}</td>
                                        {/* Subject */}
                                        <td className="py-4 px-3 text-xs">{book.subject || "-"}</td>
                                        {/* Total Copies */}
                                        <td className="py-4 px-3 text-center font-medium">{book.totalCopies || 0}</td>
                                        {/* Available Copies */}
                                        <td className="py-4 px-3 text-center">
                                            <span className={`inline-flex items-center justify-center min-w-[30px] h-5 px-1.5 rounded-full text-[10px] font-bold ${book.availableCopies > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                                                {book.availableCopies || 0}
                                            </span>
                                        </td>
                                        {/* Issue Type */}
                                        <td className="py-4 px-3 text-center text-xs font-semibold text-gray-600">
                                            {book.issueType || "Issuable"}
                                        </td>
                                        {/* Status Badge */}
                                        <td className="py-4 px-3 text-center">
                                            {(() => {
                                                const total = parseInt(book.totalCopies || 0, 10);
                                                const available = parseInt(book.availableCopies || 0, 10);
                                                let statusText = "Fully Issued";
                                                let badgeClass = "badge-danger";
                                                if (available === total && total > 0) {
                                                    statusText = "Available";
                                                    badgeClass = "badge-success";
                                                } else if (available > 0) {
                                                    statusText = "Partially Available";
                                                    badgeClass = "bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full text-xs font-semibold";
                                                }
                                                return (
                                                    <span className={badgeClass}>
                                                        {statusText}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        {/* Actions Column */}
                                        <td className="py-4 px-3 sticky right-0 bg-white group-hover:bg-gray-50 border-l transition-colors z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewedBook(book);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-[#790c0c] hover:bg-[#790c0c]/5 rounded-lg transition-all"
                                                    title="View details"
                                                >
                                                    <FiEye size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelect(book._id || book.id);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-[#01898d] hover:bg-[#01898d]/5 rounded-lg transition-all"
                                                    title="Edit book"
                                                >
                                                    <FiEdit2 size={13} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(book._id || book.id);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete book"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalBooksCount > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center mt-5 pt-4 border-t border-gray-100 gap-4">
                    <div className="text-sm text-gray-500 font-medium">
                        Showing {Math.min(totalBooksCount, (currentPage - 1) * limit + 1)} to {Math.min(totalBooksCount, currentPage * limit)} of {totalBooksCount} entries
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer text-xs font-semibold"
                            >
                                First
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer text-xs font-semibold"
                            >
                                Prev
                            </button>
                            
                            {/* Page numbers */}
                            {Array.from({ length: Math.ceil(totalBooksCount / limit) }).map((_, idx) => {
                                const pageNum = idx + 1;
                                const isNear = Math.abs(currentPage - pageNum) <= 1;
                                const isEdge = pageNum === 1 || pageNum === Math.ceil(totalBooksCount / limit);
                                
                                if (!isNear && !isEdge) {
                                    if (pageNum === 2 || pageNum === Math.ceil(totalBooksCount / limit) - 1) {
                                        return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                                    }
                                    return null;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${currentPage === pageNum ? "bg-[#790c0c] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"} cursor-pointer`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalBooksCount / limit), prev + 1))}
                                disabled={currentPage === Math.ceil(totalBooksCount / limit)}
                                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer text-xs font-semibold"
                            >
                                Next
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.ceil(totalBooksCount / limit))}
                                disabled={currentPage === Math.ceil(totalBooksCount / limit)}
                                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer text-xs font-semibold"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Book Details Modal */}
            {viewedBook && (
                <div 
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} 
                    onClick={(e) => { e.stopPropagation(); setViewedBook(null); }}
                >
                    <div className="bg-white rounded-2xl animate-fade-in shadow-2xl relative" style={{ maxWidth: 500, width: '90%', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ height: 120, background: 'linear-gradient(135deg, var(--color-primary), #5a0808)', position: 'relative' }}>
                            <button style={{ position: 'absolute', top: 16, right: 16, background: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onClick={() => setViewedBook(null)}>
                                <XCircle size={20} color="var(--text-secondary)" />
                            </button>
                            <div style={{ position: 'absolute', bottom: -30, left: 30, width: 80, height: 110, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', padding: 8 }}>
                                <BookOpen size={40} color="var(--color-primary)" />
                            </div>
                        </div>

                        <div style={{ padding: '50px 30px 30px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{viewedBook.title}</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 15 }}>by {viewedBook.author}</p>

                            {/* Tabs Control */}
                            <div className="flex border-b border-gray-200 mb-4 text-xs font-semibold">
                                <button 
                                    className={`pb-2 mr-4 border-b-2 transition-all ${activeTab === 'details' ? 'border-[#790c0c] text-[#790c0c]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setActiveTab('details')}
                                >
                                    Book Info
                                </button>
                                <button 
                                    className={`pb-2 border-b-2 transition-all ${activeTab === 'copies' ? 'border-[#790c0c] text-[#790c0c]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setActiveTab('copies')}
                                >
                                    View Copies ({copies.length})
                                </button>
                            </div>

                            {activeTab === "details" ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>ISBN</label>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedBook.isbn || "-"}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Year / Edition</label>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedBook.year || "-"} {viewedBook.edition ? `(${viewedBook.edition})` : ""}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Subject & Dept</label>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedBook.subject || "-"} ({viewedBook.department || "-"})</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Publisher</label>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedBook.publisher || "-"}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Price</label>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>₹{Number(viewedBook.price || 0).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Category / Lang</label>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{viewedBook.category || "-"} / {viewedBook.language || "-"}</p>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Remarks</label>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{viewedBook.remarks || "No remarks."}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-h-[220px] overflow-y-auto border border-gray-200 rounded-lg custom-scrollbar mb-5">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b text-gray-600 font-semibold">
                                                <th className="p-2.5">Accession No</th>
                                                <th className="p-2.5">Shelf</th>
                                                <th className="p-2.5">Status</th>
                                                <th className="p-2.5">Issue Type</th>
                                                <th className="p-2.5 text-center">Times Issued</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingCopies ? (
                                                <tr><td colSpan="5" className="text-center py-4 text-gray-400">Loading copies...</td></tr>
                                            ) : copies.length === 0 ? (
                                                <tr><td colSpan="5" className="text-center py-4 text-gray-400">No copies found</td></tr>
                                            ) : (
                                                copies.map(copy => (
                                                    <tr key={copy.id} className="border-b last:border-none hover:bg-gray-50">
                                                        <td className="p-2.5 font-bold text-gray-800">{copy.accessionNo}</td>
                                                        <td className="p-2.5 text-gray-500">{copy.shelfLocation || "-"}</td>
                                                        <td className="p-2.5">
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                                copy.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                                copy.status === 'Issued' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                                                'bg-gray-100 text-gray-700 border border-gray-200'
                                                            }`}>
                                                                {copy.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-2.5 text-gray-500">{copy.issueType}</td>
                                                        <td className="p-2.5 text-center font-medium text-gray-700">{copy.timesIssued || 0}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTop: '1px solid var(--border-light)' }}>
                                <div>
                                    {viewedBook.availableCopies > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold"><CheckCircle size={12} /> {viewedBook.availableCopies} Available</span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs font-semibold"><XCircle size={12} /> Out of Stock</span>
                                    )}
                                </div>
                                <button
                                    className="px-5 py-2 bg-[#790c0c] hover:bg-[#610a0a] text-white rounded-lg transition-colors font-semibold text-xs shadow-sm cursor-pointer"
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
