import { useState, useEffect } from "react";
import BookTable from "./components/BookTable";
import AdvancedBookFilters from "./components/AdvancedBookFilters";
import BulkUploadModal from "./components/BulkUploadModal";
import ExportBooksModal from "./components/ExportBooksModal";
import {
    FiFileText,
    FiUploadCloud,
    FiTrash2,
    FiPlus,
    FiEdit,
    FiRefreshCw,
    FiSearch,
    FiBook,
    FiInfo
} from "react-icons/fi";
import { CheckCircle, XCircle } from "lucide-react";
import adminService from "./services/adminService";

export default function ManageBooks() {
    const [books, setBooks] = useState([]);
    // allBooks holds every book with no active filters — used exclusively
    // to populate the department / subject / language / category / year
    // dropdowns in the Generate Report modal so they always show real values
    // from the database, not just the current page/filter slice.
    const [allBooks, setAllBooks] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [masterData, setMasterData] = useState({ departments: [], languages: [], subjects: [], publishers: [], vendors: [] });

    // Add copies modal state
    const [showAddCopiesModal, setShowAddCopiesModal] = useState(false);
    const [copiesForm, setCopiesForm] = useState({
        totalCopies: "1",
        startingAccessionNo: "",
        shelfLocation: "",
        issueType: "Issuable",
        purchaseDate: new Date().toISOString().split('T')[0]
    });

    // Search by Accession Number state
    const [searchAccession, setSearchAccession] = useState("");

    // Filters state
    const [filters, setFilters] = useState({
        keyword: "",
        field: "", // blank for global search
        department: "",
        subject: "",
        issueType: "",
        availability: ""
    });

    // Pagination
    const [limit, setLimit] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Form fields state
    const initialFormState = {
        isbn: "",
        title: "",
        subtitle: "",
        author: "",
        publisher: "",
        publicationPlace: "",
        edition: "",
        indianEdition: false,
        year: "",
        price: "",
        departmentId: "",
        languageId: "",
        subjectId: "",
        publisherId: "",
        vendorId: "",
        department: "",
        subject: "",
        language: "",
        category: "",
        bindingType: "",
        callNumber: "",
        contentPages: "",
        textPages: "",
        remarks: "",
        purchaseDate: new Date().toISOString().split('T')[0],
        vendor: "",
        invoiceNumber: "",
        fundSource: "",
        purchaseCost: "",
        giftBook: false,
        giftNote: "",
        totalCopies: "1",
        startingAccessionNo: "",
        accessionNo: "",
        shelfLocation: "",
        issueType: "Issuable",
        status: "Available"
    };
    const [form, setForm] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [loadedBookId, setLoadedBookId] = useState(null);

    // Status text below Accession Number Search
    const [searchStatus, setSearchStatus] = useState(null);

    // Success / Error toast notifications
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    // Auto-hide toast
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast(prev => ({ ...prev, show: false }));
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Reset current page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [departments, languages, subjects, publishers, vendors] = await Promise.all([
                    adminService.getSubEntries('departments'), adminService.getSubEntries('languages'),
                    adminService.getSubEntries('subjects'), adminService.getSubEntries('publishers'),
                    adminService.getSubEntries('vendors')
                ]);
                setMasterData({
                    departments: departments.data || [], languages: languages.data || [], subjects: subjects.data || [],
                    publishers: publishers.data || [], vendors: vendors.data || []
                });
            } catch (error) {
                console.error('Unable to load book master data:', error);
                setToast({ show: true, message: 'Unable to load master-data options.', type: 'error' });
            }
        };
        loadMasterData();
    }, []);

    // Fetch the full unfiltered catalog once on mount so the Generate Report
    // filter dropdowns always contain every department / category / year that
    // exists in the database — not just what is visible on the current page.
    const fetchAllBooks = async () => {
        try {
            const res = await adminService.getBooks({ limit: 99999 });
            if (res.success) setAllBooks(res.data);
        } catch (err) {
            console.error("Error fetching full catalog for report filters:", err);
        }
    };

    // Fetch the filtered/paginated display list; also refreshes full-catalog
    // metadata so Generate Report dropdowns stay in sync with any mutations.
    const fetchBooks = async () => {
        try {
            setLoading(true);
            const res = await adminService.getBooks(filters);
            if (res.success) {
                setBooks(res.data.map(b => ({ ...b, _id: b.id })));
                fetchAllBooks(); // keep report filter dropdowns up to date
            }
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoading(false);
        }
    };

    // Refresh display list whenever filters change
    useEffect(() => {
        fetchBooks();
    }, [filters]);

    // Load full catalog once on mount for report dropdown metadata
    useEffect(() => {
        fetchAllBooks();
    }, []);

    // Accession Number Search / Auto-fill logic
    const handleSearchByAccession = async () => {
        const accessionNo = searchAccession.trim();
        if (!accessionNo) {
            setSearchStatus({ type: "error", message: "Please enter an Accession Number to search." });
            return;
        }

        try {
            setLoading(true);
            setSearchStatus(null);
            const res = await adminService.getBookByAccession(accessionNo);
            if (res.success && res.data) {
                const b = res.data;
                setForm({
                    isbn: b.isbn || "",
                    title: b.title || "",
                    subtitle: b.subtitle || "",
                    author: b.author || "",
                    publisher: b.publisher || "",
                    publicationPlace: b.publicationPlace || "",
                    edition: b.edition || "",
                    indianEdition: !!b.indianEdition,
                    year: b.year || "",
                    price: b.price || "",
                    departmentId: b.departmentId || "",
                    languageId: b.languageId || "",
                    subjectId: b.subjectId || "",
                    publisherId: b.publisherId || "",
                    vendorId: b.vendorId || "",
                    department: b.department || "",
                    subject: b.subject || "",
                    language: b.language || "",
                    category: b.category || "",
                    bindingType: b.bindingType || "",
                    callNumber: b.callNumber || "",
                    contentPages: b.contentPages || "",
                    textPages: b.textPages || "",
                    remarks: b.remarks || "",
                    purchaseDate: b.purchaseDate || new Date().toISOString().split('T')[0],
                    vendor: b.vendor || "",
                    invoiceNumber: b.invoiceNumber || "",
                    fundSource: b.fundSource || "",
                    purchaseCost: b.purchaseCost || "",
                    giftBook: !!b.giftBook,
                    giftNote: b.giftNote || "",
                    totalCopies: b.totalCopies || "",
                    startingAccessionNo: "",
                    accessionNo: b.accessionNo || accessionNo,
                    shelfLocation: b.shelfLocation || "",
                    issueType: b.issueType || "Issuable",
                    status: b.copyStatus || b.status || "Available"
                });
                setIsEditing(true);
                setLoadedBookId(b.id);
                setSearchStatus({ type: "success", message: `Book copy found (Status: ${b.copyStatus || 'Active'}). Details auto-filled.` });
                setToast({ show: true, message: "Book details loaded successfully.", type: "success" });
            }
        } catch (error) {
            setSearchStatus({ type: "info", message: "Accession number does not exist. You can create a new book record." });
            setIsEditing(false);
            setLoadedBookId(null);
            setForm(prev => ({
                ...initialFormState,
                startingAccessionNo: accessionNo
            }));
        } finally {
            setLoading(false);
        }
    };

    // Row selection in table loads details
    const handleRowSelect = (bookId) => {
        const book = books.find(b => b._id === bookId || b.id === bookId);
        if (book) {
            setForm({
                isbn: book.isbn || "",
                title: book.title || "",
                subtitle: book.subtitle || "",
                author: book.author || "",
                publisher: book.publisher || "",
                publicationPlace: book.publicationPlace || "",
                edition: book.edition || "",
                indianEdition: !!book.indianEdition,
                year: book.year || "",
                price: book.price || "",
                departmentId: book.departmentId || "",
                languageId: book.languageId || "",
                subjectId: book.subjectId || "",
                publisherId: book.publisherId || "",
                vendorId: book.vendorId || "",
                department: book.department || "",
                subject: book.subject || "",
                language: book.language || "",
                category: book.category || "",
                bindingType: book.bindingType || "",
                callNumber: book.callNumber || "",
                contentPages: book.contentPages || "",
                textPages: book.textPages || "",
                remarks: book.remarks || "",
                purchaseDate: new Date().toISOString().split('T')[0],
                vendor: book.vendor || "",
                invoiceNumber: book.invoiceNumber || "",
                fundSource: book.fundSource || "",
                purchaseCost: book.purchaseCost || "",
                giftBook: !!book.giftBook,
                giftNote: book.giftNote || "",
                totalCopies: book.totalCopies || "",
                startingAccessionNo: "",
                accessionNo: "",
                shelfLocation: "",
                issueType: "Issuable",
                status: "Available"
            });
            setIsEditing(true);
            setLoadedBookId(book._id || book.id);
            setSearchStatus({ type: "success", message: "Book details loaded from selection." });
            setToast({ show: true, message: "Book details loaded successfully.", type: "success" });

            // Scroll form into view smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Reset Form
    const handleClearForm = () => {
        setForm(initialFormState);
        setIsEditing(false);
        setLoadedBookId(null);
        setSearchStatus(null);
        setSearchAccession("");
    };

    // Validation helper
    const validateForm = () => {
        if (!form.title.trim()) { alert("Book Title is required."); return false; }
        if (!form.author.trim()) { alert("Author is required."); return false; }
        if (!form.departmentId) { alert("Department is required."); return false; }
        if (!form.subjectId) { alert("Subject is required."); return false; }
        if (!form.year) { alert("Year of Publishing is required."); return false; }
        if (!form.price || Number(form.price) < 0) { alert("A valid Book Price is required."); return false; }
        if (!isEditing) {
            if (!form.totalCopies || Number(form.totalCopies) < 1) { alert("Number of Copies must be at least 1."); return false; }
            if (!form.purchaseDate) { alert("Purchase Date is required."); return false; }
        }
        return true;
    };

    // Save Book (New record)
    const handleSaveBook = async () => {
        if (isEditing) {
            alert("You are in edit mode. Click Clear to prepare the form for a new book record.");
            return;
        }
        if (!validateForm()) return;

        try {
            setLoading(true);
            const res = await adminService.addBook(form);
            if (res.success) {
                setToast({ show: true, message: "Book created successfully!", type: "success" });
                handleClearForm();
                fetchBooks();
            }
        } catch (error) {
            alert(error.message || "Error saving book.");
        } finally {
            setLoading(false);
        }
    };

    // Update Book
    const handleUpdateBook = async () => {
        if (!isEditing || !loadedBookId) {
            alert("Please search or select a book record to update.");
            return;
        }
        if (!validateForm()) return;

        try {
            setLoading(true);
            const res = await adminService.editBook(loadedBookId, form);
            if (res.success) {
                setToast({ show: true, message: "Book details updated successfully!", type: "success" });
                fetchBooks();
            }
        } catch (error) {
            alert(error.message || "Error updating book.");
        } finally {
            setLoading(false);
        }
    };

    // Add Copies Submit
    const handleAddCopiesSubmit = async () => {
        if (!loadedBookId) return;
        const copiesVal = parseInt(copiesForm.totalCopies, 10);
        if (isNaN(copiesVal) || copiesVal < 1) {
            alert("Number of copies to add must be at least 1.");
            return;
        }

        try {
            setLoading(true);
            const res = await adminService.addCopies(loadedBookId, copiesForm);
            if (res.success) {
                setToast({ show: true, message: `${copiesVal} copies added successfully!`, type: "success" });
                setShowAddCopiesModal(false);
                setCopiesForm({
                    totalCopies: "1",
                    startingAccessionNo: "",
                    shelfLocation: "",
                    issueType: "Issuable",
                    purchaseDate: new Date().toISOString().split('T')[0]
                });
                fetchBooks();
            }
        } catch (error) {
            alert(error.message || "Error adding copies");
        } finally {
            setLoading(false);
        }
    };

    // Delete Book
    const handleDeleteBook = async () => {
        if (!isEditing || !loadedBookId) {
            alert("Please search or select a book record to delete.");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this book? This will permanently delete all physical copies.")) return;

        try {
            setLoading(true);
            const res = await adminService.deleteBook(loadedBookId);
            if (res.success) {
                setToast({ show: true, message: "Book deleted successfully!", type: "success" });
                handleClearForm();
                fetchBooks();
            }
        } catch (error) {
            alert(error.message || "Error deleting book.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (options) => {
        try {
            setExporting(true);
            const payload = {
                exportType: options.exportType || "all",
                format: options.format || "xlsx",
                department: options.department || "",
                subject: options.subject || "",
                language: options.language || "",
                category: options.category || "",
                author: options.author || "",
                publisher: options.publisher || "",
                issueType: options.issueType || "",
                shelfLocation: options.shelfLocation || "",
                fromDate: options.fromDate || "",
                toDate: options.toDate || "",
                publicationYear: options.publicationYear || "",
                availability: options.availability || ""
            };

            const response = await adminService.exportBooks(payload);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Export request failed");
            }

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("spreadsheet") && !contentType.includes("xlsx") && payload.format === "xlsx") {
                throw new Error("The export endpoint did not return a valid Excel workbook.");
            }

            const blob = await response.blob();
            if (!blob.size) {
                throw new Error("The exported workbook is empty.");
            }

            const disposition = response.headers.get("content-disposition") || "";
            const match = disposition.match(/filename="?([^";]+)"?/i);
            const fileName = match?.[1] || `books_export_${new Date().toISOString().slice(0, 10)}.${payload.format}`;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setShowExportModal(false);
            setToast({ show: true, message: "Books exported successfully.", type: "success" });
        } catch (error) {
            console.error("Export error:", error);
            alert(error.message || "Failed to export books.");
        } finally {
            setExporting(false);
        }
    };

    // Delete single book from table row action
    const handleTableDelete = async (bookId) => {
        if (!window.confirm("Are you sure you want to delete this book? This will permanently delete all physical copies.")) return;
        try {
            setLoading(true);
            const res = await adminService.deleteBook(bookId);
            if (res.success) {
                setToast({ show: true, message: "Book deleted successfully!", type: "success" });
                if (loadedBookId === bookId) {
                    handleClearForm();
                }
                fetchBooks();
            }
        } catch (err) {
            alert(err.message || "Failed to delete book.");
        } finally {
            setLoading(false);
        }
    };

    const processedBooks = [...books].sort((a, b) => {
        const getFirstNum = (str) => {
            const match = String(str || "").match(/\d+/);
            return match ? Number(match[0]) : Infinity;
        };
        const numA = getFirstNum(a.accessionNumbers);
        const numB = getFirstNum(b.accessionNumbers);
        if (numA === Infinity && numB === Infinity) return 0;
        return numA - numB;
    });
    const totalBooksCount = processedBooks.length;
    const paginatedBooks = processedBooks.slice((currentPage - 1) * limit, currentPage * limit);

    return (
        <>
            {/* Top Right Toast Notification */}
            {toast.show && (
                <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1100, display: 'flex', alignItems: 'center', gap: 10, backgroundColor: toast.type === "success" ? "#ecfdf5" : "#fef2f2", color: toast.type === "success" ? "#065f46" : "#991b1b", border: `1px solid ${toast.type === "success" ? "#a7f3d0" : "#fecaca"}`, borderRadius: 12, padding: "12px 20px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", animation: 'slide-in 0.2s ease-out' }}>
                    {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    <span className="text-xs font-semibold">{toast.message}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 font-body">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Manage Catalog</h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">Add, update, and manage your library book collections and copies.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="bg-[#790c0c] hover:bg-[#610a0a] text-white px-4 py-2.5 rounded-xl transition flex items-center gap-2 font-semibold text-xs cursor-pointer shadow-sm active:scale-95"
                    >
                        <FiUploadCloud /> Bulk Upload
                    </button>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 font-semibold text-xs cursor-pointer shadow-sm active:scale-95"
                    >
                        <FiFileText /> Generate Report
                    </button>
                </div>
            </div>

            {/* ── BOOK DETAILS FORM CARD ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4 flex flex-col gap-3">

                {/* Search / Load */}
                <div className="flex gap-2 items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-800 mb-1">Search by Accession Number</label>
                        <input
                            type="text"
                            placeholder="Enter Accession Number"
                            value={searchAccession}
                            onChange={(e) => setSearchAccession(e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#790c0c] outline-none transition"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSearchByAccession}
                        disabled={!searchAccession}
                        className="bg-[#790c0c] hover:bg-[#610a0a] disabled:bg-gray-100 disabled:text-gray-400 text-white px-5 py-2 rounded-lg text-sm font-semibold transition active:scale-95 cursor-pointer flex items-center gap-2 h-[38px]"
                    >
                        <FiSearch /> Load
                    </button>
                    {searchStatus && (
                        <span className={`text-xs font-semibold ml-2 self-center ${searchStatus.type === "success" ? "text-emerald-600" : searchStatus.type === "error" ? "text-rose-600" : "text-amber-600"}`}>
                            {searchStatus.message}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-3">

                    {/* 1. Basic Information */}
                    <h3 className="col-span-full font-bold text-sm text-[#790c0c] border-b border-gray-100 pb-1 mt-1"></h3>

                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Book Title <span className="text-red-500">*</span></label>
                        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Subtitle</label>
                        <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Author <span className="text-red-500">*</span></label>
                        <input type="text" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Publisher</label>
                        <select value={form.publisherId} onChange={e => setForm({ ...form, publisherId: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#790c0c] outline-none cursor-pointer">
                            <option value="">{!form.publisherId && form.publisher ? form.publisher : 'Select Publisher'}</option>
                            {masterData.publishers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Publication Place</label>
                        <input type="text" value={form.publicationPlace} onChange={e => setForm({ ...form, publicationPlace: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">ISBN</label>
                        <input type="text" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Call Number</label>
                        <input type="text" value={form.callNumber} onChange={e => setForm({ ...form, callNumber: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Edition</label>
                            <input type="text" value={form.edition} onChange={e => setForm({ ...form, edition: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                        </div>
                        <div className="flex items-center mt-4 shrink-0">
                            <input type="checkbox" id="indianEdition" checked={form.indianEdition} onChange={e => setForm({ ...form, indianEdition: e.target.checked })} className="mr-1.5 cursor-pointer w-3.5 h-3.5 accent-[#790c0c]" />
                            <label htmlFor="indianEdition" className="text-[11px] font-semibold text-gray-700 cursor-pointer">Indian Ed.</label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Year of Publishing <span className="text-red-500">*</span></label>
                        <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Price (₹) <span className="text-red-500">*</span></label>
                        <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>

                    {/* 2. Classification */}
                    <h3 className="col-span-full font-bold text-sm text-[#790c0c] border-b border-gray-100 pb-1 mt-1"> </h3>

                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Department <span className="text-red-500">*</span></label>
                        <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#790c0c] outline-none cursor-pointer">
                            <option value="">{!form.departmentId && form.department ? form.department : 'Select Department'}</option>
                            {masterData.departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Subject <span className="text-red-500">*</span></label>
                        <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#790c0c] outline-none cursor-pointer">
                            <option value="">{!form.subjectId && form.subject ? form.subject : 'Select Subject'}</option>
                            {masterData.subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Language</label>
                        <select value={form.languageId} onChange={e => setForm({ ...form, languageId: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#790c0c] outline-none cursor-pointer">
                            <option value="">{!form.languageId && form.language ? form.language : 'Select Language'}</option>
                            {masterData.languages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Academic Category</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#790c0c] outline-none cursor-pointer">
                            <option value="">Select Category</option>
                            <option value="General">General</option>
                            <option value="Reference">Reference</option>
                            <option value="Textbook">Textbook</option>
                            <option value="Research">Research</option>
                            <option value="Journal">Journal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Binding Type</label>
                        <select value={form.bindingType} onChange={e => setForm({ ...form, bindingType: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#790c0c] outline-none cursor-pointer">
                            <option value="">Select Binding</option>
                            <option value="Hard Bound">Hard Bound</option>
                            <option value="Paperback">Paperback</option>
                            <option value="Spiral">Spiral</option>
                        </select>
                    </div>

                    {/* 3. Book Details */}
                    <h3 className="col-span-full font-bold text-sm text-[#790c0c] border-b border-gray-100 pb-1 mt-1"></h3>

                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Content Pages</label>
                        <input type="number" value={form.contentPages} onChange={e => setForm({ ...form, contentPages: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Text Pages</label>
                        <input type="number" value={form.textPages} onChange={e => setForm({ ...form, textPages: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Remarks</label>
                        <input type="text" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Purchase Date</label>
                        <input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Vendor</label>
                        <select value={form.vendorId} onChange={e => setForm({ ...form, vendorId: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#790c0c] outline-none cursor-pointer">
                            <option value="">{!form.vendorId && form.vendor ? form.vendor : 'Select Vendor'}</option>
                            {masterData.vendors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Invoice Number</label>
                        <input type="text" value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Fund Source</label>
                        <input type="text" value={form.fundSource} onChange={e => setForm({ ...form, fundSource: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Purchase Cost (₹)</label>
                        <input type="number" step="0.01" value={form.purchaseCost} onChange={e => setForm({ ...form, purchaseCost: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div className="flex items-center pt-[18px]">
                        <input type="checkbox" id="giftBook" checked={form.giftBook} onChange={e => setForm({ ...form, giftBook: e.target.checked })} className="mr-1.5 cursor-pointer w-3.5 h-3.5 accent-[#790c0c]" />
                        <label htmlFor="giftBook" className="text-[11px] font-semibold text-gray-700 cursor-pointer">Gift Book</label>
                    </div>
                    {form.giftBook && (
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Gift Note</label>
                            <input type="text" value={form.giftNote} onChange={e => setForm({ ...form, giftNote: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" placeholder="Enter details about the gift..." />
                        </div>
                    )}

                    {/* 4. Physical Copy Details */}
                    <h3 className="col-span-full font-bold text-sm text-[#790c0c] border-b border-gray-100 pb-1 mt-1"></h3>

                    {!isEditing && (
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Number of Copies</label>
                            <input type="number" min="1" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                        </div>
                    )}
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Rack Location</label>
                        <input type="text" value={form.shelfLocation} onChange={e => setForm({ ...form, shelfLocation: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#790c0c] outline-none" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Issue Type</label>
                        <select value={form.issueType} onChange={e => setForm({ ...form, issueType: e.target.value })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#790c0c] outline-none cursor-pointer">
                            <option value="Issuable">Issuable</option>
                            <option value="Reference">Reference</option>
                            <option value="Overnight">Overnight</option>
                        </select>
                    </div>

                    {isEditing && (
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Current Status (Copy Specific)</label>
                            <div className="flex gap-4 mt-1">
                                <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={form.status === 'Available'} onChange={() => setForm({ ...form, status: 'Available' })} className="w-3.5 h-3.5 accent-[#790c0c] cursor-pointer" /> Available
                                </label>
                                <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={form.status === 'Lost'} onChange={() => setForm({ ...form, status: 'Lost' })} className="w-3.5 h-3.5 accent-[#790c0c] cursor-pointer" /> Lost
                                </label>
                                <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={form.status === 'Damaged'} onChange={() => setForm({ ...form, status: 'Damaged' })} className="w-3.5 h-3.5 accent-[#790c0c] cursor-pointer" /> Damaged
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Action Buttons */}
                <div className="flex flex-wrap justify-between gap-3 pt-3 border-t border-gray-100 mt-1">
                    <div className="flex gap-2 flex-1">
                        <button type="button" onClick={handleSaveBook} disabled={isEditing} className="flex-1 flex justify-center items-center gap-1.5 bg-[#8b0000] hover:bg-[#6b0000] disabled:bg-gray-200 disabled:text-gray-400 text-white py-2 rounded-lg text-[13px] font-bold transition active:scale-95 cursor-pointer">
                            <FiPlus /> Save
                        </button>
                        <button type="button" onClick={handleUpdateBook} disabled={!isEditing} className="flex-1 flex justify-center items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-gray-200 disabled:text-gray-400 text-white py-2 rounded-lg text-[13px] font-bold transition active:scale-95 cursor-pointer">
                            <FiEdit /> Edit
                        </button>
                        <button type="button" onClick={handleDeleteBook} disabled={!isEditing} className="flex-1 flex justify-center items-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-gray-200 disabled:text-gray-400 text-white py-2 rounded-lg text-[13px] font-bold transition active:scale-95 cursor-pointer">
                            <FiTrash2 /> Delete
                        </button>
                    </div>
                    <div className="flex gap-2 flex-1">
                        <button type="button" onClick={handleClearForm} className="flex-1 flex justify-center items-center gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white py-2 rounded-lg text-[13px] font-bold transition active:scale-95 cursor-pointer">
                            <FiPlus /> New
                        </button>
                        <button type="button" onClick={handleClearForm} className="flex-1 flex justify-center items-center gap-1.5 bg-[#6b7280] hover:bg-[#4b5563] text-white py-2 rounded-lg text-[13px] font-bold transition active:scale-95 cursor-pointer">
                            <FiRefreshCw /> Reset
                        </button>
                    </div>
                </div>

            </div>


            {/* Add Copies Modal */}
            {showAddCopiesModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(4px)' }}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 relative w-[90%] max-w-[450px]">
                        <button style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => setShowAddCopiesModal(false)}>
                            <XCircle size={22} className="text-gray-400 hover:text-gray-600" />
                        </button>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Add Physical Copies</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Number of copies to add *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={copiesForm.totalCopies}
                                    onChange={(e) => setCopiesForm({ ...copiesForm, totalCopies: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Starting Accession Number (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1"
                                    value={copiesForm.startingAccessionNo}
                                    onChange={(e) => setCopiesForm({ ...copiesForm, startingAccessionNo: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Shelf A-3"
                                    value={copiesForm.shelfLocation}
                                    onChange={(e) => setCopiesForm({ ...copiesForm, shelfLocation: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Issue Type</label>
                                <select
                                    value={copiesForm.issueType}
                                    onChange={(e) => setCopiesForm({ ...copiesForm, issueType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none cursor-pointer"
                                >
                                    <option value="Issuable">Issuable</option>
                                    <option value="Reference">Reference</option>
                                    <option value="Overnight">Overnight</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Purchase Date *</label>
                                <input
                                    type="date"
                                    value={copiesForm.purchaseDate}
                                    onChange={(e) => setCopiesForm({ ...copiesForm, purchaseDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowAddCopiesModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddCopiesSubmit}
                                className="px-4 py-2 bg-[#01898d] hover:bg-[#007074] text-white rounded-lg text-xs font-semibold transition active:scale-95"
                            >
                                Add Copies
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showExportModal && (
                <ExportBooksModal
                    isOpen={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    books={allBooks}
                    initialFilters={filters}
                    exporting={exporting}
                    onExport={handleExport}
                />
            )}

            {/* Excel bulk upload Modal */}
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
                                setToast({ show: true, message: "Bulk upload successful!", type: "success" });
                                return res;
                            }
                            throw new Error(res.message || "Bulk upload failed");
                        } catch (err) {
                            const message = err?.message || "Bulk upload failed";
                            setToast({ show: true, message, type: "error" });
                            throw new Error(message);
                        } finally {
                            setLoading(false);
                        }
                    }}
                    onClose={() => setShowBulkModal(false)}
                />
            )}
        </>
    );
}
