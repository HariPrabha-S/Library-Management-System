import { useState, useEffect } from "react";
import BookTable from "../../components/admin/BookTable";
import BookFilters from "../../components/admin/BookFilters";
import AdvancedBookFilters from "../../components/admin/AdvancedBookFilters";
import AddBookModal from "../../components/admin/AddBookModal";
import BookReports from "../../components/admin/BookReports";
import { FiFileText, FiArrowLeft } from "react-icons/fi";
export default function ManageBooks() {

    const [books, setBooks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBooks, setSelectedBooks] = useState([]);
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
    const [reportConfig, setReportConfig] = useState(null); // { columns: [], printOption: "" }



    useEffect(() => {
        const dummyBooks = [
            { _id: "1", title: "Database Management Systems", author: "Navathe", isbn: "9780133970777", accessionNo: "ACC001", department: "CSE", publisher: "Pearson", subject: "Databases", issueType: "Reference", availableCopies: 5, price: 850, purchaseDate: "2024-01-15", createdAt: new Date() },
            { _id: "2", title: "Operating System Concepts", author: "Silberschatz", isbn: "9781118063330", accessionNo: "ACC002", department: "CSE", publisher: "Wiley", subject: "OS", issueType: "Stack", availableCopies: 2, price: 1200, purchaseDate: "2024-02-10", createdAt: new Date() },
            { _id: "3", title: "Digital Electronics", author: "Morris Mano", isbn: "9780132733304", accessionNo: "ACC003", department: "ECE", publisher: "Prentice Hall", subject: "Electronics", issueType: "Stack", availableCopies: 4, price: 950, purchaseDate: "2024-01-20", createdAt: new Date() },
            { _id: "4", title: "Theory of Computation", author: "Michael Sipser", isbn: "9781133187790", accessionNo: "ACC004", department: "CSE", publisher: "Cengage", subject: "Theory", issueType: "Reference", availableCopies: 0, price: 1100, purchaseDate: "2024-03-05", createdAt: new Date() },
            { _id: "5", title: "Microprocessors & Interfacing", author: "Douglas Hall", isbn: "9780070601673", accessionNo: "ACC005", department: "ECE", publisher: "McGraw Hill", subject: "Hardware", issueType: "Stack", availableCopies: 3, price: 780, purchaseDate: "2024-02-25", createdAt: new Date() },
            { _id: "6", title: "Network Security Essentials", author: "William Stallings", isbn: "9780133370430", accessionNo: "ACC006", department: "IT", publisher: "Pearson", subject: "Security", issueType: "Reference", availableCopies: 6, price: 1500, purchaseDate: "2024-03-12", createdAt: new Date() },
            { _id: "7", title: "Structural Analysis", author: "R.C. Hibbeler", isbn: "9780132573122", accessionNo: "ACC007", department: "CIVIL", publisher: "Prentice Hall", subject: "Structures", issueType: "Stack", availableCopies: 2, price: 2100, purchaseDate: "2024-01-05", createdAt: new Date() },
            { _id: "8", title: "Engineering Mechanics", author: "Meriam & Kraige", isbn: "9780470614815", accessionNo: "ACC008", department: "MECH", publisher: "Wiley", subject: "Mechanics", issueType: "Stack", availableCopies: 5, price: 1850, purchaseDate: "2024-02-15", createdAt: new Date() },
            { _id: "9", title: "Antennas and Wave Propagation", author: "John D. Kraus", isbn: "9780070656147", accessionNo: "ACC009", department: "ECE", publisher: "McGraw Hill", subject: "Antennas", issueType: "Reference", availableCopies: 1, price: 920, purchaseDate: "2024-03-20", createdAt: new Date() },
            { _id: "10", title: "Power System Engineering", author: "Kothari & Nagrath", isbn: "9780070647916", accessionNo: "ACC010", department: "EEE", publisher: "Tata McGraw Hill", subject: "Power Systems", issueType: "Stack", availableCopies: 4, price: 1350, purchaseDate: "2024-01-28", createdAt: new Date() },
            { _id: "11", title: "Software Engineering", author: "Ian Sommerville", isbn: "9780133943030", accessionNo: "ACC011", department: "IT", publisher: "Pearson", subject: "Software", issueType: "Stack", availableCopies: 8, price: 1150, purchaseDate: "2024-02-05", createdAt: new Date() },
            { _id: "12", title: "Deep Learning", author: "Ian Goodfellow", isbn: "9780262035613", accessionNo: "ACC012", department: "AIDS", publisher: "MIT Press", subject: "AI", issueType: "Reference", availableCopies: 3, price: 3500, purchaseDate: "2024-03-01", createdAt: new Date() },
            { _id: "13", title: "Python Machine Learning", author: "Sebastian Raschka", isbn: "9781789955750", accessionNo: "ACC013", department: "AIDS", publisher: "Packt", subject: "ML", issueType: "Stack", availableCopies: 7, price: 1250, purchaseDate: "2024-02-28", createdAt: new Date() },
            { _id: "14", title: "Cloud Computing", author: "Rajkumar Buyya", isbn: "9780123848727", accessionNo: "ACC014", department: "IT", publisher: "Morgan Kaufmann", subject: "Cloud", issueType: "Stack", availableCopies: 2, price: 1400, purchaseDate: "2024-01-12", createdAt: new Date() },
            { _id: "15", title: "Fluid Mechanics", author: "Yunus Cengel", isbn: "9780073380322", accessionNo: "ACC015", department: "MECH", publisher: "McGraw Hill", subject: "Fluids", issueType: "Stack", availableCopies: 0, price: 1650, purchaseDate: "2024-03-10", createdAt: new Date() },
        ];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBooks(dummyBooks);
    }, []);
    const handleSelect = (id) => {
        setSelectedBooks((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        setBooks((prev) =>
            prev.filter((book) => !selectedBooks.includes(book._id))
        );
        setSelectedBooks([]);
    };
    const handleDelete = (id) => {

        setBooks((prev) => prev.filter((book) => book._id !== id));
    };

    // ✅ processedBooks MUST come before return
    const processedBooks = books.filter((book) => {

        let matchKeyword = true;

        if (filters.keyword) {
            const fieldValue = book[filters.field]?.toLowerCase() || "";
            matchKeyword = fieldValue.includes(filters.keyword.toLowerCase());
        }

        let matchDepartment = true;
        if (filters.department) {
            matchDepartment = book.department
                ?.toLowerCase()
                .includes(filters.department.toLowerCase());
        }

        let matchSubject = true;
        if (filters.subject) {
            matchSubject = book.subject
                ?.toLowerCase()
                .includes(filters.subject.toLowerCase());
        }

        let matchIssueType = true;
        if (filters.issueType) {
            matchIssueType = book.issueType === filters.issueType;
        }

        let matchAvailability = true;
        if (filters.availability === "available") {
            matchAvailability = book.availableCopies > 0;
        }

        if (filters.availability === "issued") {
            matchAvailability = book.availableCopies === 0;
        }

        let matchDate = true;
        if (filters.fromDate || filters.toDate) {
            const purchaseDate = book.purchaseDate ? new Date(book.purchaseDate) : null;
            if (purchaseDate) {
                if (filters.fromDate && purchaseDate < new Date(filters.fromDate)) matchDate = false;
                if (filters.toDate && purchaseDate > new Date(filters.toDate)) matchDate = false;
            } else {
                matchDate = false; // No date to compare against
            }
        }

        return (
            matchKeyword &&
            matchDepartment &&
            matchSubject &&
            matchIssueType &&
            matchAvailability &&
            matchDate
        );

    });

    const isFinanceReport = reportConfig?.name === "Finance Summary";
    const isDeptSummary = reportConfig?.name === "Dept Finance Summary";

    const reportSummary = (isFinanceReport || isDeptSummary) ? processedBooks.reduce((acc, book) => ({
        totalQty: acc.totalQty + 1,
        totalPrice: acc.totalPrice + (book.price || 0)
    }), { totalQty: 0, totalPrice: 0 }) : null;

    let displayBooks = processedBooks;
    if (isDeptSummary) {
        const deptMap = processedBooks.reduce((acc, book) => {
            const dept = book.department || "General";
            if (!acc[dept]) {
                acc[dept] = { _id: dept, department: dept, quantity: 0, totalPrice: 0 };
            }
            acc[dept].quantity += 1;
            acc[dept].totalPrice += (book.price || 0);
            return acc;
        }, {});
        displayBooks = Object.values(deptMap);
    }

    return (
        <>
            <div className={`flex justify-between items-center mb-6 ${reportConfig ? "no-print" : ""}`}>
                <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)]">
                    Manage Books
                </h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="bg-white text-[var(--color-secondary)] border border-[var(--color-secondary)] px-5 py-2 rounded-xl hover:bg-[var(--color-secondary)]/5 transition flex items-center gap-2 font-semibold"
                    >
                        <FiFileText />
                        Generate Report
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl hover:opacity-90 transition flex items-center gap-2 font-semibold shadow-lg shadow-[var(--color-primary)]/10"
                    >
                        <span>+ Add Book</span>
                    </button>
                </div>
            </div>

            {/* Report Preview Header */}
            {reportConfig && (
                <div className="bg-[var(--color-secondary)]/10 border-l-4 border-[var(--color-secondary)] p-4 mb-6 flex justify-between items-center rounded-r-lg no-print">
                    <div className="flex items-center gap-3">
                        <FiFileText className="text-[var(--color-secondary)] text-xl" />
                        <div>
                            <h3 className="font-bold text-gray-900">Report Preview Mode</h3>
                            <p className="text-xs text-gray-600">Displaying selected columns for printing/export.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setReportConfig(null)}
                        className="flex items-center gap-1 text-sm font-bold text-[var(--color-primary)] hover:underline transition"
                    >
                        <FiArrowLeft />
                        Exit Preview
                    </button>
                </div>
            )}

            <div className={reportConfig ? "no-print" : ""}>
                <AdvancedBookFilters
                    filters={filters}
                    setFilters={setFilters}
                />
            </div>
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
            {selectedBooks.length > 0 && (
                <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4"
                >
                    Delete Selected
                </button>
            )}

            {showModal && (
                <AddBookModal
                    setShowModal={setShowModal}
                    setBooks={setBooks}
                />
            )}

            <BookReports
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                filters={filters}
                setFilters={setFilters}
                onPreview={(columns, printOption, paperOrientation, passedFilters, reportName) => {
                    if (passedFilters) {
                        setFilters(passedFilters);
                    }
                    setReportConfig({
                        columns,
                        printOption,
                        paperOrientation,
                        name: reportName,
                        isSummary: reportName === "Dept Finance Summary"
                    });
                    setShowReportModal(false);

                    // Inject print orientation style
                    const styleId = "print-orientation-style";
                    let styleElement = document.getElementById(styleId);
                    if (!styleElement) {
                        styleElement = document.createElement("style");
                        styleElement.id = styleId;
                        document.head.appendChild(styleElement);
                    }
                    styleElement.innerHTML = `@media print { @page { size: ${paperOrientation.toLowerCase()}; } }`;

                    if (printOption === "Printer") {
                        setTimeout(() => {
                            window.print();
                            // Optional: clear config after print if needed,
                            // but usually user wants to see it first or return.
                        }, 500);
                    }
                }}
            />
        </>
    );
}