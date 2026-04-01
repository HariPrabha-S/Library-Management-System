import { useState, useRef, useEffect } from "react";
import { FiUploadCloud, FiFile, FiCheckCircle, FiAlertCircle, FiDownload } from "react-icons/fi";

/**
 * BulkUploadModal
 * Props:
 *   type      – "book" | "student" | "faculty"
 *   onUpload  – (parsedRows[]) => void
 *   onClose   – () => void
 */

/* Each field has:
   label – human-readable header (matches input placeholder)
   key   – internal state field name
*/
const TEMPLATES = {
    book: {
        fields: [
            { label: "Accession Number", key: "accessionNo" },
            { label: "ISBN", key: "isbn" },
            { label: "Book Title", key: "title" },
            { label: "Subtitle", key: "subtitle" },
            { label: "Author", key: "author" },
            { label: "Publisher", key: "publisher" },
            { label: "Edition", key: "edition" },
            { label: "Year of Publishing", key: "year" },
            { label: "Department", key: "department" },
            { label: "Subject", key: "subject" },
            { label: "Language", key: "language" },
            { label: "Category", key: "category" },
            { label: "Call Number", key: "callNumber" },
            { label: "Shelf Location (Rack)", key: "shelfLocation" },
            { label: "Issue Type", key: "issueType" },
            { label: "Total Copies", key: "totalCopies" },
        ],
        sample: [
            ["ACC101", "978-0-13-468599-1", "Data Structures", "", "Tanenbaum", "Pearson", "3rd", "2020", "CSE", "Programming", "English", "Reference", "CS101", "A-1", "Issuable", "5"],
            ["ACC102", "978-0-11-468322-4", "Operating Systems", "", "Silberschatz", "Wiley", "9th", "2019", "CSE", "Systems", "English", "", "CS102", "A-2", "Reference", "3"],
        ]
    },
    student: {
        fields: [
            { label: "Name", key: "name" },
            { label: "Roll No", key: "rollNo" },
            { label: "Department", key: "department" },
            { label: "Year", key: "year" },
            { label: "Email", key: "email" },
        ],
        sample: [
            ["Arun Kumar", "CSE001", "CSE", "2", "arun@college.edu"],
            ["Priya Sharma", "ECE015", "ECE", "3", "priya@college.edu"],
        ]
    },
    faculty: {
        fields: [
            { label: "Faculty Name", key: "name" },
            { label: "Employee ID", key: "employeeId" },
            { label: "Department", key: "department" },
            { label: "Designation", key: "designation" },
            { label: "Email Address", key: "email" },
        ],
        sample: [
            ["Dr. Rajesh Kumar", "EMP001", "CSE", "Professor", "rajesh@college.edu"],
            ["Dr. Meena Sharma", "EMP002", "ECE", "Associate Professor", "meena@college.edu"],
        ]
    }
};

/* ── helpers ─────────────────────────────────────────────── */

function downloadTemplate(type) {
    const { fields, sample } = TEMPLATES[type];
    const headers = fields.map(f => f.label);
    const rows = [headers, ...sample];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_upload_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function parseCSV(text) {
    const lines = text.trim().split("\n");
    return lines.map(line => {
        const cols = [];
        let cur = "", inQ = false;
        for (const ch of line) {
            if (ch === '"') { inQ = !inQ; }
            else if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
            else { cur += ch; }
        }
        cols.push(cur.trim());
        return cols;
    });
}

/* Strip spaces/special chars for fuzzy column matching */
function normalize(str) {
    return str?.toString().toLowerCase().replace(/[^a-z0-9]/g, "") || "";
}

/* ── component ───────────────────────────────────────────── */

export default function BulkUploadModal({ type, onUpload, onClose }) {
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null); // { rows }
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const inputRef = useRef();

    const tpl = TEMPLATES[type];
    const label = type.charAt(0).toUpperCase() + type.slice(1);

    useEffect(() => {
        const handleKeys = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && preview && !success) {
                handleConfirm();
            }
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [onClose, preview, success]);

    /* Map raw rows (2-D array) to objects using label → key mapping */
    function processRawRows(rawRows) {
        if (!rawRows || rawRows.length < 2) {
            setError("File must have at least a header row and one data row.");
            return;
        }

        const fileHeaders = rawRows[0].map(h => normalize(h));
        const dataRows = rawRows.slice(1).filter(row => row.some(c => c !== "" && c != null));

        if (dataRows.length === 0) {
            setError("No data rows found after the header.");
            return;
        }

        /* Build label→index map using fuzzy match (label OR key) */
        const colIndex = {};
        tpl.fields.forEach(({ label: lbl, key }) => {
            const normLabel = normalize(lbl);
            const normKey = normalize(key);
            const idx = fileHeaders.findIndex(h => h === normLabel || h === normKey);
            colIndex[key] = idx; // -1 if not found → empty string
        });

        const parsed = dataRows.map((row, i) => {
            const obj = { _id: Date.now() + i };
            tpl.fields.forEach(({ key }) => {
                const idx = colIndex[key];
                obj[key] = idx !== -1 ? (row[idx]?.toString().trim() || "") : "";
            });
            return obj;
        });

        setPreview({ rows: parsed });
        setError("");
    }

    async function handleFile(f) {
        setFile(f);
        setError("");
        setPreview(null);
        setSuccess(false);

        const name = f.name.toLowerCase();

        if (name.endsWith(".csv")) {
            const text = await f.text();
            processRawRows(parseCSV(text));
            return;
        }

        if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
            if (!window.XLSX) {
                const script = document.createElement("script");
                script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
                script.onload = () => readXLSX(f);
                script.onerror = () => setError("Failed to load Excel parser. Try using a CSV file instead.");
                document.head.appendChild(script);
            } else {
                readXLSX(f);
            }
            return;
        }

        setError("Unsupported file type. Please upload a .xlsx, .xls, or .csv file.");
    }

    function readXLSX(f) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb = window.XLSX.read(e.target.result, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rawRows = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
                processRawRows(rawRows);
            } catch {
                setError("Could not read the Excel file. Please check the format.");
            }
        };
        reader.readAsArrayBuffer(f);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }

    function handleConfirm() {
        if (!preview) return;
        onUpload(preview.rows);
        setSuccess(true);
        setTimeout(onClose, 1200);
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-400 p-4">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
                style={{ animation: "fadeInScale 0.25s ease" }}
            >
                <style>{`@keyframes fadeInScale{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="font-heading text-2xl font-bold text-(--color-primary)">
                            Bulk Upload {label}s
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Upload a <strong>.xlsx</strong>, <strong>.xls</strong>, or <strong>.csv</strong> file with the required columns.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        title="Close"
                        style={{
                            width: "2rem", height: "2rem", borderRadius: "50%",
                            border: "1.5px solid #e5e7eb", background: "#f3f4f6",
                            cursor: "pointer", fontSize: "1.1rem", color: "#6b7280",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#6b7280"; }}
                    >✕</button>
                </div>

                <div className="px-8 py-6 space-y-5">

                    {/* ── Required Columns Info ── */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Required Excel / CSV Columns
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {tpl.fields.map(({ label: lbl, key }) => (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 shadow-sm"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-(--color-primary) inline-block" />
                                    {lbl}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Download Template ── */}
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
                        <div>
                            <p className="text-sm font-semibold text-blue-800">Download Template</p>
                            <p className="text-xs text-blue-600">
                                Pre-filled CSV with the exact column headers and sample rows.
                            </p>
                        </div>
                        <button
                            onClick={() => downloadTemplate(type)}
                            className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 transition px-4 py-2 rounded-lg whitespace-nowrap"
                        >
                            <FiDownload /> Download Template
                        </button>
                    </div>

                    {/* ── Drop Zone ── */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current.click()}
                        style={{
                            border: `2px dashed ${dragOver ? "var(--color-primary)" : "#d1d5db"}`,
                            background: dragOver ? "rgba(100,30,30,0.04)" : "#fafafa",
                            borderRadius: "1rem",
                            padding: "2.5rem 1rem",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "0.75rem",
                            cursor: "pointer",
                            transition: "border-color 0.2s, background 0.2s",
                        }}
                    >
                        <FiUploadCloud style={{ fontSize: "2.5rem", color: dragOver ? "var(--color-primary)" : "#9ca3af" }} />
                        {file ? (
                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                <FiFile className="text-green-600" />
                                <span>{file.name}</span>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 font-medium text-sm">Drag & drop your file here, or click to browse</p>
                                <p className="text-xs text-gray-400">Supported: .xlsx · .xls · .csv</p>
                            </>
                        )}
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            style={{ display: "none" }}
                            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                        />
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <FiAlertCircle className="text-lg flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* ── Preview Table ── */}
                    {preview && !success && (
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                Preview —{" "}
                                <span className="text-(--color-primary)">
                                    {preview.rows.length} record(s)
                                </span>{" "}
                                detected
                                {preview.rows.length > 5 && (
                                    <span className="text-gray-400 font-normal ml-1">
                                        (showing first 5)
                                    </span>
                                )}
                            </p>
                            <div className="overflow-x-auto rounded-xl border border-gray-200 text-xs">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-600">
                                            {tpl.fields.map(({ label: lbl, key }) => (
                                                <th
                                                    key={key}
                                                    className="px-3 py-2.5 text-left font-semibold whitespace-nowrap border-b border-gray-200"
                                                >
                                                    {lbl}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.rows.slice(0, 5).map((row, i) => (
                                            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                                                {tpl.fields.map(({ key }) => (
                                                    <td key={key} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                                                        {row[key] || (
                                                            <span className="text-gray-300 italic">—</span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        {preview.rows.length > 5 && (
                                            <tr>
                                                <td
                                                    colSpan={tpl.fields.length}
                                                    className="px-3 py-2 text-center text-gray-400 italic"
                                                >
                                                    … and {preview.rows.length - 5} more row(s)
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Success Banner ── */}
                    {success && (
                        <div className="flex items-center gap-3 text-green-700 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                            <FiCheckCircle className="text-2xl flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Import Successful!</p>
                                <p className="text-xs">All records have been added.</p>
                            </div>
                        </div>
                    )}

                    {/* ── Actions ── */}
                    {!success && (
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!preview}
                                className="px-6 py-2 bg-(--color-primary) text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                            >
                                <FiUploadCloud />
                                {preview
                                    ? `Import ${preview.rows.length} Record${preview.rows.length !== 1 ? "s" : ""}`
                                    : "Import"}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
