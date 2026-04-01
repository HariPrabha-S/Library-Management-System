import { useState, useEffect } from "react";
import BookTable from "./components/BookTable";
import AdvancedBookFilters from "./components/AdvancedBookFilters";
import AddBookModal from "./components/AddBookModal";
import BookReports from "./components/BookReports";
import BulkUploadModal from "./components/BulkUploadModal";
import { FiFileText, FiArrowLeft, FiUploadCloud, FiTrash2 } from "react-icons/fi";
import adminService from "./services/adminService";

export default function ManageBooks() {
    const [books, setBooks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        keyword: "",
        field: "title",
        department: "",
        subject: "",
        issueType: "",
        availability: "",
        fromDate: "",
        toDate: ""
    });

    const [limit, setLimit] = useState(10);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportConfig, setReportConfig] = useState(null);
    const [prevFilters, setPrevFilters] = useState(null);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const res = await adminService.getBooks(filters);
            if (res.success) {
                // Ensure backend IDs map to _id if frontend expects it, or update components to use id
                setBooks(res.data.map(b => ({ ...b, _id: b.id })));
            }
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [filters]);

    const handleSelect = (id) => {
        setSelectedBooks((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedBooks.length} books?`)) return;
        try {
            await adminService.deleteBulkBooks(selectedBooks);
            setSelectedBooks([]);
            fetchBooks();
        } catch (error) {
            alert("Failed to delete books");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this book?")) return;
        try {
            await adminService.deleteBook(id);
            fetchBooks();
        } catch (error) {
            alert("Failed to delete book");
        }
    };

    // Filter logic if backend search isn't exhaustive or for instant UI feedback
    const processedBooks = books.filter((book) => {
        let matchKeyword = true;
        if (filters.keyword) {
            const fieldValue = book[filters.field]?.toString().toLowerCase() || "";
            matchKeyword = fieldValue.includes(filters.keyword.toLowerCase());
        }
        return matchKeyword;
    });

    const isDeptSummary = reportConfig?.name === "Dept Finance Summary";
    const isDeptStats = reportConfig?.name === "Department Statistics";

    const reportSummary = processedBooks.reduce((acc, book) => ({
        totalQty: acc.totalQty + 1,
        totalPrice: acc.totalPrice + (book.price || 0)
    }), { totalQty: 0, totalPrice: 0 });

    let displayBooks = processedBooks;
    if (isDeptSummary || isDeptStats) {
        const deptMap = processedBooks.reduce((acc, book) => {
            const dept = book.department || "General";
            if (!acc[dept]) acc[dept] = { _id: dept, department: dept, quantity: 0, totalPrice: 0 };
            acc[dept].quantity += 1;
            acc[dept].totalPrice += (book.price || 0);
            return acc;
        }, {});
        displayBooks = Object.values(deptMap);
    }

    return (
        <>
            <div className={`flex justify-between items-center mb-6 ${reportConfig ? "no-print" : ""}`}>
                <h1 className="font-heading text-3xl font-bold text-(--color-primary)">
                    Manage Books
                </h1>

                <div className="flex gap-3">
                    <button onClick={() => setShowReportModal(true)} className="bg-white text-(--color-secondary) border border-(--color-secondary) px-5 py-2 rounded-xl hover:bg-(--color-secondary)/5 transition flex items-center gap-2 font-semibold">
                        <FiFileText /> Generate Report
                    </button>
                    <button onClick={() => setShowBulkModal(true)} className="bg-white text-(--color-secondary) border border-(--color-secondary) px-5 py-2 rounded-xl hover:bg-(--color-secondary)/5 transition flex items-center gap-2 font-semibold">
                        <FiUploadCloud /> Upload Excel
                    </button>
                    <button onClick={() => setShowModal(true)} className="bg-(--color-primary) text-white px-5 py-2 rounded-xl hover:opacity-90 transition flex items-center gap-2 font-semibold shadow-lg shadow-(--color-primary)/10">
                        <span>+ Add Book</span>
                    </button>
                </div>
            </div>

            {reportConfig && (
                <div className="bg-(--color-secondary)/10 border-l-4 border-(--color-secondary) p-4 mb-6 flex justify-between items-center rounded-r-lg no-print">
                    <div className="flex items-center gap-3">
                        <FiFileText className="text-(--color-secondary) text-xl" />
                        <div>
                            <h3 className="font-bold text-gray-900">Report Preview Mode</h3>
                            <p className="text-xs text-gray-600">Displaying selected columns for printing/export.</p>
                        </div>
                    </div>
                    <button onClick={() => {
                        if (prevFilters) setFilters(prevFilters);
                        setReportConfig(null);
                        setPrevFilters(null);
                    }} className="flex items-center gap-1 text-sm font-bold text-(--color-primary) hover:underline transition">
                        <FiArrowLeft /> Exit Preview
                    </button>
                </div>
            )}

            <div className={reportConfig ? "no-print" : ""}>
                <AdvancedBookFilters filters={filters} setFilters={setFilters} />
            </div>

            <div className={loading ? "opacity-50" : ""}>
                <BookTable
                    books={displayBooks.slice(0, limit)}
                    selectedBooks={selectedBooks}
                    filters={filters}
                    setFilters={setFilters}
                    limit={limit}
                    setLimit={setLimit}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                    selectedColumns={reportConfig?.columns}
                    isPrintable={!!reportConfig}
                    reportSummary={reportSummary}
                    isSummary={reportConfig?.isSummary}
                />
            </div>

            {selectedBooks.length > 0 && (
                <button onClick={handleBulkDelete} className="bg-red-600 text-white px-6 py-2 rounded-xl mt-4 font-bold shadow-lg">
                    Delete Selected ({selectedBooks.length})
                </button>
            )}

            {showModal && <AddBookModal setShowModal={setShowModal} refreshBooks={fetchBooks} />}

            {showBulkModal && (
                <BulkUploadModal
                    type="book"
                    onUpload={async (data) => {
                        try {
                            setLoading(true);
                            const res = await adminService.bulkUploadBooks(data);
                            if (res.success) {
                                fetchBooks();
                                setShowBulkModal(false);
                            } else {
                                alert(res.message || "Bulk upload failed");
                            }
                        } catch (err) {
                            alert("Network error during bulk upload");
                        } finally {
                            setLoading(false);
                        }
                    }}
                    onClose={() => setShowBulkModal(false)}
                />
            )}

            <BookReports
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                filters={filters}
                setFilters={setFilters}
                onPreview={async (columns, printOption, paperOrientation, passedFilters, reportName) => {
                    try {
                        setLoading(true);
                        const res = await adminService.getBooks({ ...passedFilters, limit: 1000 });
                        if (res.success) {
                            let displayData = res.data;

                            // Summary Mapping
                            if (reportName === "Dept Finance Summary" || reportName === "Department Statistics") {
                                const deptMap = res.data.reduce((acc, book) => {
                                    const dept = book.department || "General";
                                    if (!acc[dept]) acc[dept] = { department: dept, quantity: 0, totalPrice: 0 };
                                    acc[dept].quantity += 1;
                                    acc[dept].totalPrice += (book.price || 0);
                                    return acc;
                                }, {});
                                displayData = Object.values(deptMap);
                            }

                            // Generate and open in new tab
                            const reportWindow = window.open("", "_blank");
                            const reportHtml = `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Library Report - ${reportName}</title>
                                    <style>
                                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                                        @media print { @page { size: ${paperOrientation.toLowerCase()}; margin: 1.5cm; } }
                                        body { font-family: 'Inter', system-ui, sans-serif; padding: 100px 60px 60px 60px; color: #1a1a1a; line-height: 1.5; background: #fdfdfd; }
                                        .controls { position: fixed; top: 30px; right: 30px; display: flex; gap: 12px; z-index: 1000; }
                                        .btn { border: none; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; alignItems: center; gap: 8px; }
                                        .btn-print { background: #800000; color: white; box-shadow: 0 4px 15px rgba(128,0,0,0.25); }
                                        .btn-print:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(128,0,0,0.35); }
                                        .btn-close { background: white; color: #444; border: 1px solid #ddd; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                                        .btn-close:hover { background: #f8f8f8; color: #000; }
                                        
                                        .report-container { background: white; max-width: 1200px; margin: 0 auto; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border-radius: 8px; padding: 60px; }
                                        
                                        .header { position: relative; margin-bottom: 50px; }
                                        .header-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #eee; padding-bottom: 25px; }
                                        .header-title-area { flex: 1; }
                                        .header h1 { font-size: 32px; font-weight: 800; color: #800000; margin: 0; letter-spacing: -0.025em; text-transform: uppercase; }
                                        .header h2 { font-size: 16px; font-weight: 600; color: #666; margin: 8px 0 0; text-transform: uppercase; letter-spacing: 1.5px; }
                                        
                                        .header-info-bar { display: flex; justify-content: space-between; margin-top: 25px; padding-top: 15px; font-size: 13px; font-weight: 600; color: #888; border-top: 1px solid #f0f0f0; }
                                        .header-info-item b { color: #333; margin-left: 4px; }
                                        
                                        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; font-size: 12px; border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
                                        th { background: #f9fafb; color: #374151; font-weight: 700; text-align: left; padding: 14px 16px; border-bottom: 2.5px solid #800000; text-transform: uppercase; letter-spacing: 0.5px; }
                                        td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #4b5563; font-weight: 500; }
                                        tr:last-child td { border-bottom: none; }
                                        tr:hover { background: #fafafa; }
                                        
                                        .summary-box { margin-left: auto; width: fit-content; min-width: 320px; margin-top: 40px; padding: 25px; background: #fdfdfd; border: 2px solid #f3f4f6; border-radius: 16px; display: grid; grid-template-columns: 1fr auto; gap: 15px; }
                                        .summary-label { font-size: 13px; font-weight: 600; color: #666; }
                                        .summary-value { font-size: 15px; font-weight: 800; color: #1a1a1a; text-align: right; }
                                        .summary-total { border-top: 1px dashed #ddd; margin-top: 10px; padding-top: 15px; grid-column: span 2; display: flex; justify-content: space-between; align-items: baseline; }
                                        .summary-total .summary-value { color: #800000; font-size: 20px; }

                                        .footer-note { margin-top: 60px; text-align: center; color: #9ca3af; font-size: 11px; font-style: italic; border-top: 1px solid #eee; padding-top: 25px; }

                                        @media print { 
                                            .controls { display: none !important; }
                                            body { padding: 0 !important; background: white !important; }
                                            .report-container { box-shadow: none !important; padding: 0 !important; max-width: 100% !important; }
                                            th { border-bottom-width: 3px !important; }
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="controls">
                                        <button class="btn btn-close" onclick="window.close()">Close (Esc)</button>
                                        <button class="btn btn-print" onclick="window.print()">Print Report</button>
                                    </div>

                                    <div class="report-container">
                                        <div class="header">
                                            <div class="header-top">
                                                <div class="header-title-area">
                                                    <h1>Central Library Management System</h1>
                                                    <h2>${reportName}</h2>
                                                </div>
                                            </div>
                                            <div class="header-info-bar">
                                                <div class="header-info-item">Generation Date: <b>${new Date().toLocaleDateString()}</b></div>
                                                <div class="header-info-item">Orientation: <b>${paperOrientation}</b></div>
                                                <div class="header-info-item">Total Records: <b>${displayData.length}</b></div>
                                            </div>
                                        </div>

                                        <table>
                                            <thead>
                                                <tr>
                                                    ${columns.map(col => `<th>${col.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>`).join('')}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${displayData.map(row => `
                                                    <tr>
                                                        ${columns.map(col => `<td>${row[col] || "-"}</td>`).join('')}
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>

                                        ${reportName.includes("Summary") || reportName.includes("Statistics") ? "" : `
                                            <div class="summary-box">
                                                <span class="summary-label">Total Volume Count:</span>
                                                <span class="summary-value">${displayData.length}</span>
                                                <div class="summary-total">
                                                    <span class="summary-label">Report Total Valuation:</span>
                                                    <span class="summary-value">₹${displayData.reduce((sum, b) => sum + (Number(b.price) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        `}

                                        <div class="footer-note">
                                            This document represents an official automated extraction from the Central Library Management System. <br/>
                                            Verified as of ${new Date().toLocaleString()} • Generated by LMS Admin Portal
                                        </div>
                                    </div>

                                    <script>
                                        window.onkeydown = function(e) {
                                            if (e.key === "Escape") window.close();
                                        };
                                        ${printOption === "Printer" ? "setTimeout(() => window.print(), 1000);" : ""}
                                    </script>
                                </body>
                                </html>
                            `;
                            reportWindow.document.write(reportHtml);
                            reportWindow.document.close();
                            setShowReportModal(false);
                            reportWindow.document.write(reportHtml);
                            reportWindow.document.close();
                            setShowReportModal(false);
                        }
                    } catch (error) {
                        console.error(error);
                    } finally {
                        setLoading(false);
                    }
                }}
            />
        </>
    );
}
