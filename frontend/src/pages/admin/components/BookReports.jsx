import { useState, useEffect, useCallback } from "react";
import { FiX, FiPrinter, FiEye } from "react-icons/fi";

export default function BookReports({ isOpen, onClose, filters, setFilters, onPreview }) {
    const [localFilters, setLocalFilters] = useState({ ...filters });
    const [selectedPreset, setSelectedPreset] = useState("Standard Report Formats");
    const [paperOrientation, setPaperOrientation] = useState("Portrait");
    const [printOption, setPrintOption] = useState("Window");

    const reportPresets = [
        { name: "Standard Report Formats", columns: ["accessionNo", "title", "author", "publisher", "callNumber"] },
        { name: "Acc. No / Title / Author / Publisher / Call No.", columns: ["accessionNo", "title", "author", "publisher", "callNumber"] },
        { name: "Acc. No / Title / Author / Price", columns: ["accessionNo", "title", "author", "price"] },
        { name: "Sl. No / Acc. No / Title / Author", columns: ["accessionNo", "title", "author"] },
        { name: "Accession No. List", columns: ["accessionNo"] },
        { name: "Full Details", columns: ["accessionNo", "title", "subtitle", "author", "publisher", "edition", "yearOfPublishing", "department", "subject", "price", "purchaseDate", "availability"] },
        { name: "Acc. No / Title / Author / Edition / Publisher", columns: ["accessionNo", "title", "author", "edition", "publisher"] },
        { name: "Acc. No / Title / Author / Sub Title / Gift Information", columns: ["accessionNo", "title", "author", "subtitle"] },
        { name: "Acquisition Report", columns: ["purchaseDate", "accessionNo", "title", "author", "publisher", "price", "department"] },
        { name: "Finance Summary", columns: ["purchaseDate", "accessionNo", "title", "publisher", "price"] },
        { name: "Dept Finance Summary", columns: ["department", "quantity", "totalPrice"], isSummary: true },
    ];

    const searchCriteria = [
        { label: "Accession No.", value: "accessionNo" },
        { label: "Title", value: "title" },
        { label: "Sub Title", value: "subtitle" },
        { label: "Author", value: "author" },
        { label: "Edition", value: "edition" },
        { label: "Publisher Name", value: "publisher" },
        { label: "Call Number", value: "callNumber" },
        { label: "Department", value: "department" },
        { label: "Subject", value: "subject" },
        { label: "All", value: "all" },
    ];

    const handleLoad = useCallback(() => {
        const foundPreset = reportPresets.find(p => p.name === selectedPreset) || reportPresets[0];
        onPreview(foundPreset.columns, printOption, paperOrientation, localFilters, foundPreset.name);
    }, [selectedPreset, printOption, paperOrientation, localFilters, onPreview, reportPresets]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            } else if (e.key === "Enter") {
                // Prevent multi-submit if target is already a button
                if (e.target.tagName !== "BUTTON") {
                    handleLoad();
                }
            } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const currentIndex = reportPresets.findIndex(p => p.name === selectedPreset);
                let nextIndex;
                if (e.key === "ArrowDown") {
                    nextIndex = (currentIndex + 1) % reportPresets.length;
                } else {
                    nextIndex = (currentIndex - 1 + reportPresets.length) % reportPresets.length;
                }
                setSelectedPreset(reportPresets[nextIndex].name);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, handleLoad, selectedPreset, reportPresets]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[300] p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[96vh]">

                {/* Header */}
                <div className="bg-[var(--color-primary)] px-5 py-3 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-1 rounded-lg">
                            <FiPrinter size={16} />
                        </div>
                        <span className="font-bold tracking-wide text-sm">Generate Book Reports</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                        <FiX size={18} />
                    </button>
                </div>

                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-hidden bg-gray-50/50 flex-1">
                    {/* Left Column: Search & Presets */}
                    <div className="space-y-4 flex flex-col h-full overflow-hidden">
                        {/* Search Criteria */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col gap-4">
                            <h3 className="text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></div>
                                Search Criteria
                            </h3>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                {searchCriteria.map(item => (
                                    <label key={item.value} className="flex items-center gap-2.5 text-xs cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="searchField"
                                                value={item.value}
                                                checked={localFilters.field === item.value}
                                                onChange={() => setLocalFilters({ ...localFilters, field: item.value })}
                                                className="sr-only"
                                            />
                                            <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${localFilters.field === item.value ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 scale-110" : "border-gray-200 group-hover:border-gray-300"}`}></div>
                                            {localFilters.field === item.value && (
                                                <div className="absolute w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] animate-in zoom-in duration-300"></div>
                                            )}
                                        </div>
                                        <span className={`transition-colors duration-200 ${localFilters.field === item.value ? "text-gray-900 font-bold" : "text-gray-500 font-medium group-hover:text-gray-800"}`}>
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col flex-1 min-h-0 overflow-hidden">
                            <div className="px-6 pt-5 pb-3">
                                <h3 className="text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></div>
                                    Report Categories
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4">
                                <div className="space-y-1">
                                    {reportPresets.map(preset => (
                                        <div
                                            key={preset.name}
                                            onClick={() => setSelectedPreset(preset.name)}
                                            className={`text-xs p-3 cursor-pointer rounded-xl transition-all duration-300 font-semibold ${selectedPreset === preset.name ? "bg-[var(--color-secondary)] text-white shadow-md transform translate-x-1" : "text-gray-600 hover:bg-gray-100/50 hover:text-[var(--color-secondary)]"}`}
                                        >
                                            {preset.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Filters & Print Options */}
                    <div className="space-y-4 flex flex-col h-full">
                        {/* Orientation */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col gap-4">
                            <h3 className="text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></div>
                                Orientation
                            </h3>
                            <div className="flex gap-8">
                                {["Portrait", "Landscape"].map(opt => (
                                    <label key={opt} className="flex items-center gap-3 text-xs cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" name="orientation" checked={paperOrientation === opt} onChange={() => setPaperOrientation(opt)} className="sr-only" />
                                            <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${paperOrientation === opt ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 scale-110" : "border-gray-200 group-hover:border-gray-300"}`}></div>
                                            {paperOrientation === opt && <div className="absolute w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] animate-in zoom-in duration-300"></div>}
                                        </div>
                                        <span className={`font-bold transition-colors ${paperOrientation === opt ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"}`}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Print Options */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col gap-4">
                            <h3 className="text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></div>
                                Print To
                            </h3>
                            <div className="flex gap-8">
                                {["Window", "Printer"].map(opt => (
                                    <label key={opt} className="flex items-center gap-3 text-xs cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" name="printTo" checked={printOption === opt} onChange={() => setPrintOption(opt)} className="sr-only" />
                                            <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${printOption === opt ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 scale-110" : "border-gray-200 group-hover:border-gray-300"}`}></div>
                                            {printOption === opt && <div className="absolute w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] animate-in zoom-in duration-300"></div>}
                                        </div>
                                        <span className={`font-bold transition-colors ${printOption === opt ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"}`}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            className="w-full flex items-center gap-3 text-xs bg-white p-4 rounded-2xl border border-gray-100 shadow-md cursor-pointer hover:bg-gray-50 transition-colors group"
                        >
                            <input type="checkbox" checked readOnly className="w-4 h-4 rounded-md accent-[var(--color-secondary)] cursor-pointer" />
                            <span className="font-bold text-gray-600 group-hover:text-gray-800">Show Selection Condition on Report</span>
                        </button>

                        {/* Date Range & Preview - Bottom Right Section */}
                        <div className="mt-auto bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">From Purchase Date</span>
                                    <input
                                        type="date"
                                        value={localFilters.fromDate || ""}
                                        onChange={(e) => setLocalFilters({ ...localFilters, fromDate: e.target.value })}
                                        className="text-xs border border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[var(--color-secondary)]/20 focus:border-[var(--color-secondary)] outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">To Purchase Date</span>
                                    <input
                                        type="date"
                                        value={localFilters.toDate || ""}
                                        onChange={(e) => setLocalFilters({ ...localFilters, toDate: e.target.value })}
                                        className="text-xs border border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[var(--color-secondary)]/20 focus:border-[var(--color-secondary)] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleLoad}
                                    className="w-full bg-[var(--color-secondary)] text-white hover:opacity-95 py-2.5 text-xs font-bold rounded-xl shadow-lg shadow-[var(--color-secondary)]/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <FiEye size={14} />
                                    Book Purchase
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="bg-white border-t border-gray-100 px-6 py-4 flex justify-end items-center gap-4">
                    <p className="mr-auto text-[10px] text-gray-400 font-medium italic">All reports generated reflect real-time library database state.</p>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 font-bold text-xs px-4 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => onPreview((reportPresets.find(p => p.name === selectedPreset) || reportPresets[0]).columns, printOption, paperOrientation, { ...localFilters, fromDate: null, toDate: null }, (reportPresets.find(p => p.name === selectedPreset) || reportPresets[0]).name)}
                        className="bg-[var(--color-primary)] text-white hover:opacity-95 px-6 py-2 text-xs font-bold rounded-xl shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <FiEye size={14} />
                        Preview
                    </button>
                </div>
            </div>
        </div >
    );
}
