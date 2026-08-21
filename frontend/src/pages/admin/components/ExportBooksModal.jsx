import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiX } from "react-icons/fi";

const DEFAULT_EXPORT_FILTERS = {
    exportType: "all",
    format: "xlsx",
    department: "",
    subject: "",
    language: "",
    category: "",
    author: "",
    publisher: "",
    issueType: "",
    shelfLocation: "",
    fromDate: "",
    toDate: "",
    publicationYear: "",
    availability: ""
};

export default function ExportBooksModal({ isOpen, onClose, books, initialFilters = {}, onExport, exporting = false }) {
    const [form, setForm] = useState(DEFAULT_EXPORT_FILTERS);

    const options = useMemo(() => {
        const toUniqueValues = (key) => Array.from(new Set((books || [])
            .map(book => book?.[key])
            .filter(Boolean)))
            .sort((a, b) => String(a).localeCompare(String(b)));

        return {
            departments: toUniqueValues("department"),
            subjects: toUniqueValues("subject"),
            languages: toUniqueValues("language"),
            categories: toUniqueValues("category"),
            authors: toUniqueValues("author"),
            publishers: toUniqueValues("publisher"),
            years: toUniqueValues("year"),
        };
    }, [books]);

    useEffect(() => {
        if (!isOpen) return;

        setForm({
            ...DEFAULT_EXPORT_FILTERS,
            exportType: initialFilters.exportType || "all",
            format: initialFilters.format || "xlsx",
            department: initialFilters.department || "",
            subject: initialFilters.subject || "",
            language: initialFilters.language || "",
            category: initialFilters.category || "",
            author: initialFilters.author || "",
            publisher: initialFilters.publisher || "",
            issueType: initialFilters.issueType || "",
            shelfLocation: initialFilters.shelfLocation || "",
            fromDate: initialFilters.fromDate || "",
            toDate: initialFilters.toDate || "",
            publicationYear: initialFilters.publicationYear || "",
            availability: initialFilters.availability || ""
        });
    }, [isOpen, initialFilters]);

    if (!isOpen) return null;

    const disabled = form.exportType === "all";

    const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const handleReset = () => setForm(DEFAULT_EXPORT_FILTERS);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[500] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-xl font-bold text-(--color-primary)">Generate Report</h3>
                        <p className="text-sm text-gray-500 mt-1">Choose between exporting every book or only the books matching selected filters.</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center">
                        <FiX />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="rounded-xl border border-gray-200 p-4 flex items-start gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="exportType"
                                value="all"
                                checked={form.exportType === "all"}
                                onChange={() => updateField("exportType", "all")}
                            />
                            <span>
                                <span className="font-semibold text-gray-800 block">Export All Books</span>
                                <span className="text-xs text-gray-500">Download every book with complete details.</span>
                            </span>
                        </label>
                        <label className="rounded-xl border border-gray-200 p-4 flex items-start gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="exportType"
                                value="filtered"
                                checked={form.exportType === "filtered"}
                                onChange={() => updateField("exportType", "filtered")}
                            />
                            <span>
                                <span className="font-semibold text-gray-800 block">Export Filtered Books</span>
                                <span className="text-xs text-gray-500">Export only books matching one or more optional filters.</span>
                            </span>
                        </label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">File Format</label>
                            <select
                                value={form.format}
                                onChange={(e) => updateField("format", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                            >
                                <option value="xlsx">Excel (.xlsx)</option>
                                <option value="csv">CSV (.csv)</option>
                            </select>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/60">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Optional Filters</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                                <select value={form.department} onChange={(e) => updateField("department", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100">
                                    <option value="">All Departments</option>
                                    {options.departments.map(value => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
                                <select value={form.subject} onChange={(e) => updateField("subject", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100">
                                    <option value="">All Subjects</option>
                                    {options.subjects.map(value => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Language</label>
                                <select value={form.language} onChange={(e) => updateField("language", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100">
                                    <option value="">All Languages</option>
                                    {options.languages.map(value => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                                <select value={form.category} onChange={(e) => updateField("category", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100">
                                    <option value="">All Categories</option>
                                    {options.categories.map(value => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Author</label>
                                <select value={form.author} onChange={(e) => updateField("author", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100">
                                    <option value="">All Authors</option>
                                    {options.authors.map(value => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Publisher</label>
                                <select value={form.publisher} onChange={(e) => updateField("publisher", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100">
                                    <option value="">All Publishers</option>
                                    {options.publishers.map(value => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Issue Type</label>
                                <select value={form.issueType} onChange={(e) => updateField("issueType", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100">
                                    <option value="">All Issue Types</option>
                                    <option value="Issuable">Issuable</option>
                                    <option value="Reference">Reference</option>
                                    <option value="Overnight">Overnight</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location</label>
                                <input value={form.shelfLocation} onChange={(e) => updateField("shelfLocation", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100" placeholder="e.g. A-1" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Publication Year</label>
                                <select value={form.publicationYear} onChange={(e) => updateField("publicationYear", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100">
                                    <option value="">All Years</option>
                                    {options.years.map(value => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Availability</label>
                                <select value={form.availability} onChange={(e) => updateField("availability", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100">
                                    <option value="">All Statuses</option>
                                    <option value="Available">Available</option>
                                    <option value="Issued">Issued</option>
                                    <option value="Reserved">Reserved</option>
                                    <option value="Lost">Lost</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Purchase Date From</label>
                                <input type="date" value={form.fromDate} onChange={(e) => updateField("fromDate", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Purchase Date To</label>
                                <input type="date" value={form.toDate} onChange={(e) => updateField("toDate", e.target.value)} disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-100" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={handleReset} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Reset Filters</button>
                    <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                    <button
                        onClick={() => onExport(form)}
                        disabled={exporting}
                        className="px-5 py-2 bg-(--color-primary) text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                    >
                        <FiDownload /> {exporting ? "Preparing..." : "Generate Report"}
                    </button>
                </div>
            </div>
        </div>
    );
}
