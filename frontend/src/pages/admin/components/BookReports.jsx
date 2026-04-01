import { useState, useEffect, useCallback } from "react";
import { FiX, FiPrinter, FiEye, FiRotateCcw } from "react-icons/fi";

export default function BookReports({ isOpen, onClose, filters, setFilters, onPreview }) {
    const defaultLocalFilters = { keyword: "", field: "accessionNo", department: "", subject: "", issueType: "", availability: "", fromDate: "", toDate: "" };
    const [localFilters, setLocalFilters] = useState({ ...filters });
    const [selectedPreset, setSelectedPreset] = useState("Standard Report Format");
    const [paperOrientation, setPaperOrientation] = useState("Portrait");
    const [printOption, setPrintOption] = useState("Window");

    const standardPresets = [
        { name: "Standard Report Format", columns: ["accessionNo", "title", "author", "publisher", "callNumber"] },
        { name: "Acc. No / Title / Author / Publisher / Call No.", columns: ["accessionNo", "title", "author", "publisher", "callNumber"] },
        { name: "Acc. No / Title / Author / Price", columns: ["accessionNo", "title", "author", "price"] },
        { name: "Sl. No / Acc. No / Title / Author", columns: ["accessionNo", "title", "author"] },
        { name: "Accession No. List", columns: ["accessionNo"] },
        { name: "Full Details", columns: ["accessionNo", "title", "subtitle", "author", "publisher", "edition", "yearOfPublishing", "department", "subject", "price", "purchaseDate", "availability"] },
        { name: "Acc. No / Title / Author / Edition / Publisher", columns: ["accessionNo", "title", "author", "edition", "publisher"] },
        { name: "Acc. No / Title / Author / Sub Title / Gift Information", columns: ["accessionNo", "title", "author", "subtitle"] },
    ];

    const summaryPresets = [
        { name: "Acquisition Report", columns: ["purchaseDate", "accessionNo", "title", "author", "publisher", "price", "department"] },
        { name: "Finance Summary", columns: ["purchaseDate", "accessionNo", "title", "publisher", "price"] },
        { name: "Dept Finance Summary", columns: ["department", "quantity", "totalPrice"], isSummary: true },
        { name: "Department Statistics", columns: ["department", "quantity"], isSummary: true },
    ];

    const allPresets = [...standardPresets, ...summaryPresets];

    const searchCriteria = [
        { label: "Accession No.", value: "accessionNo" }, { label: "Title", value: "title" },
        { label: "Sub Title", value: "subtitle" }, { label: "Author", value: "author" },
        { label: "Edition", value: "edition" }, { label: "Publisher Name", value: "publisher" },
        { label: "Call Number", value: "callNumber" }, { label: "Department", value: "department" },
        { label: "Subject", value: "subject" }, { label: "All", value: "all" },
    ];

    const handleLoad = useCallback(() => {
        const foundPreset = allPresets.find(p => p.name === selectedPreset) || allPresets[0];
        onPreview(foundPreset.columns, printOption, paperOrientation, localFilters, foundPreset.name);
    }, [selectedPreset, printOption, paperOrientation, localFilters, onPreview, allPresets]);

    const handleClear = () => {
        setLocalFilters(defaultLocalFilters);
        setSelectedPreset("Standard Report Format");
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleKeys = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter") {
                if (e.target.tagName !== "TEXTAREA" && e.target.tagName !== "BUTTON") {
                    handleLoad();
                }
            }
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [isOpen, onClose, handleLoad]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[300] p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[94vh]">

                {/* Header */}
                <div className="bg-(--color-primary) px-6 py-4 flex justify-between items-center text-white shadow-md relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <FiPrinter size={18} />
                        </div>
                        <span className="font-bold tracking-widest text-sm uppercase">Report Generation Center</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 overflow-y-auto custom-scrollbar bg-gray-50/50 flex-1 min-h-0">

                    {/* Box 1: Search */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col gap-6 min-h-0 overflow-hidden">
                        <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4">
                            <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                            1. Search Criteria
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-0.5">
                            {searchCriteria.map((item, idx) => (
                                <label key={item.value} className={`flex items-center gap-3 text-[11px] cursor-pointer group p-2 hover:bg-gray-50 rounded-xl transition-all ${idx !== searchCriteria.length - 1 ? "border-b border-gray-50/50" : ""}`}>
                                    <input
                                        type="radio" name="searchField"
                                        checked={localFilters.field === item.value}
                                        onChange={() => setLocalFilters({ ...localFilters, field: item.value })}
                                        className="w-3.5 h-3.5 accent-(--color-primary)"
                                    />
                                    <span className={`font-bold tracking-tight transition-colors ${localFilters.field === item.value ? "text-gray-900" : "text-gray-800 group-hover:text-gray-900"}`}>
                                        {item.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-gray-50 mt-auto">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2 px-1">Search Keywords</span>
                            <input
                                type="text"
                                placeholder={`Enter search keywords...`}
                                value={localFilters.keyword || ""}
                                onChange={(e) => setLocalFilters({ ...localFilters, keyword: e.target.value })}
                                className="w-full text-xs border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 outline-none transition-all font-bold placeholder:font-medium"
                            />
                        </div>
                    </div>

                    {/* Box 2: Standard Formats */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col gap-4 overflow-hidden">
                        <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4">
                            <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                            2. Standard Formats
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-0.5">
                            {standardPresets.map((preset, idx) => (
                                <div
                                    key={preset.name}
                                    onClick={() => setSelectedPreset(preset.name)}
                                    className={`text-[11px] p-3 cursor-pointer rounded-lg transition-all font-bold border ${selectedPreset === preset.name ? "bg-(--color-primary) text-white border-(--color-primary) shadow-md" : "text-gray-600 border-transparent hover:bg-gray-50"} ${idx !== standardPresets.length - 1 ? "border-b border-gray-50/50" : ""}`}
                                >
                                    {preset.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Box 3: Summary Reports & Settings */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col gap-4 overflow-hidden">
                        <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4">
                            <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                            3. Summary Reports
                        </h3>
                        <div className="space-y-0.5">
                            {summaryPresets.map((preset, idx) => (
                                <div
                                    key={preset.name}
                                    onClick={() => setSelectedPreset(preset.name)}
                                    className={`text-[11px] p-3 cursor-pointer rounded-lg transition-all font-bold border ${selectedPreset === preset.name ? "bg-(--color-primary) text-white border-(--color-primary) shadow-md" : "text-gray-700 border-transparent hover:bg-gray-50"} ${idx !== summaryPresets.length - 1 ? "border-b border-gray-50/50" : ""}`}
                                >
                                    {preset.name}
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto pt-6 border-t space-y-6">
                            <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-4 px-1">Page Orientation</span>
                                <div className="flex gap-8 px-1">
                                    {["Portrait", "Landscape"].map(opt => (
                                        <label key={opt} className="flex items-center gap-3 text-[11px] cursor-pointer group">
                                            <input type="radio" checked={paperOrientation === opt} onChange={() => setPaperOrientation(opt)} className="w-4 h-4 accent-(--color-primary)" />
                                            <span className="font-bold text-gray-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-4 px-1">Output Delivery</span>
                                <div className="flex gap-8 px-1">
                                    {["Window", "Printer"].map(opt => (
                                        <label key={opt} className="flex items-center gap-3 text-[11px] cursor-pointer group">
                                            <input type="radio" checked={printOption === opt} onChange={() => setPrintOption(opt)} className="w-4 h-4 accent-(--color-primary)" />
                                            <span className="font-bold text-gray-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-t border-gray-100 px-8 py-5 flex justify-end items-center gap-8 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] relative z-20">
                    <button
                        onClick={handleClear}
                        className="text-gray-400 hover:text-(--color-primary) font-bold text-xs uppercase tracking-widest px-4 transition-all flex items-center gap-2 group"
                    >
                        <FiRotateCcw className="group-hover:-rotate-45 transition-transform" /> Clear Settings
                    </button>
                    <button
                        onClick={handleLoad}
                        className="bg-(--color-primary) text-white px-12 py-4 text-xs font-bold rounded-xl shadow-2xl shadow-(--color-primary)/20 hover:opacity-95 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest"
                    >
                        <FiEye size={18} /> Process & Open
                    </button>
                </div>
            </div>
        </div>
    );
}
