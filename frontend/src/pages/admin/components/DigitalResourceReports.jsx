import { useState, useEffect, useCallback } from "react";
import { FiX, FiPrinter, FiEye, FiRotateCcw } from "react-icons/fi";
import { generateReport } from "../utils/reportGenerator";

export default function DigitalResourceReports({ isOpen, onClose, resources }) {
    const defaultLocalFilters = {
        keyword: "",
        type: "",
        status: "",
        timeRange: "custom",
        fromDate: "",
        toDate: ""
    };

    const [localFilters, setLocalFilters] = useState({ ...defaultLocalFilters });
    const [selectedPreset, setSelectedPreset] = useState("Resource Catalog");
    const [paperOrientation, setPaperOrientation] = useState("Portrait");
    const [printOption, setPrintOption] = useState("Window");

    const resourceTypes = ["Journal", "E-Book", "Research Paper", "Video Lecture", "Other"];
    const approvalStatuses = ["Pending", "Approved", "Rejected"];

    const reportPresets = [
        {
            name: "Resource Catalog",
            columns: ["title", "resource_type", "approval_status", "created_at"],
            description: "Full list of all digital resources with type and status."
        },
        {
            name: "Approved Resources",
            columns: ["title", "resource_type", "uploaded_by", "created_at"],
            description: "Only resources that have been approved."
        },
        {
            name: "Pending Review",
            columns: ["title", "resource_type", "uploaded_by", "created_at"],
            description: "Resources awaiting admin review."
        },
        {
            name: "Type Summary",
            columns: ["resource_type", "approval_status", "title"],
            description: "Resources grouped/sorted by type."
        },
        {
            name: "Full Details",
            columns: ["title", "description", "resource_type", "approval_status", "uploaded_by", "created_at"],
            description: "Complete information for all resources."
        },
    ];

    const handleTimeRange = (range) => {
        const today = new Date().toISOString().split("T")[0];
        let from = "";
        if (range === "today") from = today;
        else if (range === "month") {
            const d = new Date();
            from = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
        } else if (range === "year") {
            const d = new Date();
            from = new Date(d.getFullYear(), 0, 1).toISOString().split("T")[0];
        }
        setLocalFilters(prev => ({ ...prev, fromDate: from, toDate: today, timeRange: range }));
    };

    const handleLoad = useCallback(() => {
        const preset = reportPresets.find(p => p.name === selectedPreset) || reportPresets[0];

        // Apply filters to the resources array passed from the parent
        let filtered = [...(resources || [])];

        if (localFilters.keyword) {
            const kw = localFilters.keyword.toLowerCase();
            filtered = filtered.filter(r =>
                (r.title || "").toLowerCase().includes(kw) ||
                (r.description || "").toLowerCase().includes(kw)
            );
        }
        if (localFilters.type) {
            filtered = filtered.filter(r =>
                (r.resource_type || r.type || "") === localFilters.type
            );
        }
        if (localFilters.status) {
            filtered = filtered.filter(r => r.approval_status === localFilters.status);
        }
        if (localFilters.fromDate) {
            filtered = filtered.filter(r =>
                r.created_at && new Date(r.created_at) >= new Date(localFilters.fromDate)
            );
        }
        if (localFilters.toDate) {
            filtered = filtered.filter(r =>
                r.created_at && new Date(r.created_at) <= new Date(localFilters.toDate + "T23:59:59")
            );
        }

        // Flatten uploaded_by for display
        const displayData = filtered.map(r => ({
            ...r,
            uploaded_by: r.uploaded_by?.name || r.uploaded_by_faculty_id || "Library",
            resource_type: r.resource_type || r.type || "-",
            created_at: r.created_at ? new Date(r.created_at).toLocaleDateString("en-GB") : "-",
        }));

        const statusCounts = {
            Approved: filtered.filter(r => r.approval_status === "Approved").length,
            Pending: filtered.filter(r => r.approval_status === "Pending").length,
            Rejected: filtered.filter(r => r.approval_status === "Rejected").length,
        };

        generateReport({
            title: "Digital Resources",
            reportName: preset.name,
            orientation: paperOrientation,
            columns: preset.columns,
            data: displayData,
            summaryFields: [
                { label: "Total Resources", value: displayData.length },
                { label: "Approved", value: statusCounts.Approved },
                { label: "Pending Review", value: statusCounts.Pending },
                { label: "Rejected", value: statusCounts.Rejected },
            ],
        });

        if (printOption === "Printer") {
            // generateReport already opens the window; auto-print is handled there
        }

        onClose();
    }, [selectedPreset, paperOrientation, printOption, localFilters, resources, onClose]);

    const handleClear = () => {
        setLocalFilters({ ...defaultLocalFilters });
        setSelectedPreset("Resource Catalog");
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleKeys = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && e.target.tagName !== "BUTTON") handleLoad();
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [isOpen, onClose, handleLoad]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[300] p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[94vh]">

                {/* Header */}
                <div className="bg-(--color-primary) px-6 py-4 flex justify-between items-center text-white shadow-md">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <FiPrinter size={18} />
                        </div>
                        <span className="font-bold tracking-widest text-sm uppercase">Digital Resources Report Center</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 overflow-y-auto custom-scrollbar bg-gray-50/50 flex-1 min-h-0">

                    {/* Column 1 — Filters */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col gap-5 min-h-0 overflow-hidden">
                        <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4">
                            <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                            1. Filter Criteria
                        </h3>

                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4">
                            {/* Keyword */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Keyword</span>
                                <input
                                    type="text"
                                    placeholder="Search title or description..."
                                    value={localFilters.keyword}
                                    onChange={e => setLocalFilters(prev => ({ ...prev, keyword: e.target.value }))}
                                    className="w-full text-xs font-bold border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:border-(--color-primary) outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>

                            {/* Resource Type */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Resource Type</span>
                                <select
                                    value={localFilters.type}
                                    onChange={e => setLocalFilters(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full text-xs font-bold border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:border-(--color-primary) outline-none transition-all cursor-pointer"
                                >
                                    <option value="">All Types</option>
                                    {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Approval Status */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Approval Status</span>
                                <div className="flex flex-col gap-1">
                                    <label className="flex items-center gap-2 text-[11px] cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                                        <input type="radio" name="drStatus" checked={localFilters.status === ""} onChange={() => setLocalFilters(prev => ({ ...prev, status: "" }))} className="accent-(--color-primary)" />
                                        <span className="font-bold text-gray-700">All Statuses</span>
                                    </label>
                                    {approvalStatuses.map(s => (
                                        <label key={s} className="flex items-center gap-2 text-[11px] cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                                            <input type="radio" name="drStatus" checked={localFilters.status === s} onChange={() => setLocalFilters(prev => ({ ...prev, status: s }))} className="accent-(--color-primary)" />
                                            <span className="font-bold text-gray-700">{s}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Quick date range */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Quick Date Range</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {["today", "month", "year"].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => handleTimeRange(r)}
                                            className={`text-[10px] py-2 rounded-lg font-bold border transition-all ${localFilters.timeRange === r ? "bg-(--color-primary) text-white border-(--color-primary)" : "bg-gray-50 text-gray-600 border-gray-100"}`}
                                        >
                                            {r.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom date range */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Date Range (Custom)</span>
                                <input
                                    type="date"
                                    value={localFilters.fromDate}
                                    onChange={e => setLocalFilters(prev => ({ ...prev, fromDate: e.target.value, timeRange: "custom" }))}
                                    className="w-full text-xs font-bold border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-(--color-primary) outline-none"
                                />
                                <input
                                    type="date"
                                    value={localFilters.toDate}
                                    onChange={e => setLocalFilters(prev => ({ ...prev, toDate: e.target.value, timeRange: "custom" }))}
                                    className="w-full text-xs font-bold border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:border-(--color-primary) outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Column 2 — Report Formats */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col gap-4 overflow-hidden">
                        <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4">
                            <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                            2. Report Format
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1">
                            {reportPresets.map(preset => (
                                <div
                                    key={preset.name}
                                    onClick={() => setSelectedPreset(preset.name)}
                                    className={`p-3 cursor-pointer rounded-xl transition-all duration-200 border ${
                                        selectedPreset === preset.name
                                            ? "bg-(--color-primary) text-white border-(--color-primary) shadow-md"
                                            : "text-gray-700 border-transparent hover:border-gray-100 hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="text-[11px] font-bold">{preset.name}</div>
                                    <div className={`text-[10px] mt-0.5 ${selectedPreset === preset.name ? "text-white/70" : "text-gray-400"}`}>
                                        {preset.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 3 — Page Settings */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col gap-6 overflow-hidden">
                        <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4">
                            <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                            3. Page Settings
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-3">Orientation</span>
                                <div className="flex gap-8">
                                    {["Portrait", "Landscape"].map(opt => (
                                        <label key={opt} className="flex items-center gap-3 text-xs cursor-pointer">
                                            <input type="radio" checked={paperOrientation === opt} onChange={() => setPaperOrientation(opt)} className="accent-(--color-primary)" />
                                            <span className="font-bold text-gray-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-3">Output Mode</span>
                                <div className="flex gap-8">
                                    {["Window", "Printer"].map(opt => (
                                        <label key={opt} className="flex items-center gap-3 text-xs cursor-pointer">
                                            <input type="radio" checked={printOption === opt} onChange={() => setPrintOption(opt)} className="accent-(--color-primary)" />
                                            <span className="font-bold text-gray-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-[10px] text-gray-500 font-medium leading-relaxed">
                            Reports include all resources matching the selected filters. Filtering is performed on the currently loaded data set.
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-gray-100 px-8 py-5 flex justify-end items-center gap-8 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
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
