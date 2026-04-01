import { useState, useEffect, useCallback } from "react";
import { FiX, FiPrinter, FiEye, FiRotateCcw, FiDollarSign } from "react-icons/fi";

export default function FineReports({ isOpen, onClose, filters, onPreview }) {
    const defaultLocalFilters = { keyword: "", field: "all", status: "all", fromDate: "", toDate: "", timeRange: "custom" };
    const [localFilters, setLocalFilters] = useState({ ...defaultLocalFilters });
    const [selectedPreset, setSelectedPreset] = useState("Settlement Register");
    const [paperOrientation, setPaperOrientation] = useState("Portrait");
    const [printOption, setPrintOption] = useState("Window");

    const standardPresets = [
        { name: "Settlement Register", columns: ["id", "name", "type", "reason", "amount", "status"] },
        { name: "Outstanding Fines List", columns: ["name", "rollNo", "amount", "reason"] },
        { name: "Revenue Summary", columns: ["date", "amount", "count"], isSummary: true },
        { name: "Student fine Ledger", columns: ["name", "rollNo", "amount", "status"] },
    ];

    const allPresets = [...standardPresets];

    const searchCriteria = [
        { label: "All Fines", value: "all" },
        { label: "Name", value: "name" },
        { label: "Reason", value: "reason" },
        { label: "Student RollNo", value: "rollNo" },
    ];

    const handleTimeRange = (range) => {
        const today = new Date().toISOString().split('T')[0];
        let from = "";

        if (range === "today") from = today;
        else if (range === "month") {
            const d = new Date();
            from = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
        } else if (range === "year") {
            const d = new Date();
            from = new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0];
        }

        setLocalFilters({ ...localFilters, fromDate: from, toDate: today, timeRange: range });
    };

    const handleLoad = useCallback(() => {
        const foundPreset = allPresets.find(p => p.name === selectedPreset) || allPresets[0];
        onPreview(foundPreset.columns, printOption, paperOrientation, localFilters, foundPreset.name);
    }, [selectedPreset, printOption, paperOrientation, localFilters, onPreview, allPresets]);

    const handleClear = () => {
        setLocalFilters(defaultLocalFilters);
        setSelectedPreset("Settlement Register");
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleKeys = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter") handleLoad();
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
                            <FiDollarSign size={18} />
                        </div>
                        <span className="font-bold tracking-widest text-sm uppercase">Financial Report Center</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 overflow-y-auto custom-scrollbar bg-gray-50/50 flex-1 min-h-0">

                    {/* Box 1: Filters */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg flex flex-col gap-6">
                        <div>
                            <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4 mb-4">
                                <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                                1. Search Criteria
                            </h3>
                            <div className="space-y-1">
                                {searchCriteria.map((item) => (
                                    <label key={item.value} className="flex items-center gap-3 text-[11px] cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-all">
                                        <input
                                            type="radio" name="searchField"
                                            checked={localFilters.field === item.value}
                                            onChange={() => setLocalFilters({ ...localFilters, field: item.value })}
                                            className="w-3.5 h-3.5 accent-(--color-primary)"
                                        />
                                        <span className="font-bold text-gray-800">{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2 px-1">Quick Filters</span>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {['Paid', 'Unpaid'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setLocalFilters({ ...localFilters, status: s })}
                                        className={`text-[10px] py-2 rounded-lg font-bold border transition-all ${localFilters.status === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-600 border-gray-100'}`}
                                    >
                                        {s.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {['today', 'month', 'year'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => handleTimeRange(r)}
                                        className={`text-[10px] py-2 rounded-lg font-bold border transition-all ${localFilters.timeRange === r ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-gray-50 text-gray-600 border-gray-100'}`}
                                    >
                                        {r.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Box 2: Formats */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg space-y-4">
                        <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4">
                            <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                            2. Report Formats
                        </h3>
                        <div className="space-y-1">
                            {standardPresets.map((preset) => (
                                <div
                                    key={preset.name}
                                    onClick={() => setSelectedPreset(preset.name)}
                                    className={`text-[11px] p-3 cursor-pointer rounded-lg transition-all font-bold border ${selectedPreset === preset.name ? "bg-(--color-primary) text-white border-(--color-primary)" : "text-gray-600 border-transparent hover:bg-gray-50"}`}
                                >
                                    {preset.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Box 3: Advanced Settings */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg space-y-6 flex flex-col">
                        <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4 mb-4">
                            <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                            3. Settings
                        </h3>

                        <div className="flex-1 space-y-8">
                            <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-4 px-1">Paper Alignment</span>
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
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2 px-1">Keywords</span>
                                <input
                                    type="text"
                                    placeholder="e.g. Lost book, Late return"
                                    value={localFilters.keyword}
                                    onChange={(e) => setLocalFilters({ ...localFilters, keyword: e.target.value })}
                                    className="w-full text-xs border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:border-(--color-primary) outline-none font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-t border-gray-100 px-8 py-5 flex justify-end items-center gap-8 shadow-inner">
                    <button onClick={handleClear} className="text-gray-400 hover:text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all">
                        <FiRotateCcw /> Clear
                    </button>
                    <button
                        onClick={handleLoad}
                        className="bg-(--color-primary) text-white px-10 py-4 text-xs font-bold rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-2 uppercase tracking-widest"
                    >
                        <FiEye size={16} /> Process & Preview
                    </button>
                </div>
            </div>
        </div>
    );
}
