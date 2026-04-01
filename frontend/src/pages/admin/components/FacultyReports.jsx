import { useState, useEffect, useCallback } from "react";
import { FiX, FiPrinter, FiEye, FiRotateCcw } from "react-icons/fi";

export default function FacultyReports({ isOpen, onClose, filters, setFilters, onPreview }) {
    const defaultLocalFilters = { search: "", department: "" };
    const [localFilters, setLocalFilters] = useState({ ...filters });
    const [selectedPreset, setSelectedPreset] = useState("Standard Faculty List");
    const [paperOrientation, setPaperOrientation] = useState("Portrait");
    const [printOption, setPrintOption] = useState("Window");

    const reportPresets = [
        { name: "Standard Faculty List", columns: ["name", "facultyId", "department", "email"] },
        { name: "Full Details", columns: ["name", "facultyId", "department", "designation", "email", "phone"] },
        { name: "Department-wise List", columns: ["department", "name", "facultyId", "designation"] },
        { name: "Faculty Library Activity", columns: ["name", "facultyId", "totalBooks", "issuedBooks", "returnedBooks"] },
    ];

    const handleLoad = useCallback(() => {
        const foundPreset = reportPresets.find(p => p.name === selectedPreset) || reportPresets[0];
        onPreview(foundPreset.columns, printOption, paperOrientation, localFilters, foundPreset.name);
    }, [selectedPreset, printOption, paperOrientation, localFilters, onPreview, reportPresets]);

    const handleClear = () => {
        setLocalFilters(defaultLocalFilters);
        setSelectedPreset("Standard Faculty List");
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleKeys = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter") {
                if (e.target.tagName !== "BUTTON") {
                    handleLoad();
                }
            }
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [isOpen, onClose, handleLoad]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-300 p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="bg-(--color-primary) px-6 py-4 flex justify-between items-center text-white shadow-md relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <FiPrinter size={18} />
                        </div>
                        <span className="font-bold tracking-widest text-sm uppercase">Faculty Report Center</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 overflow-y-auto custom-scrollbar bg-gray-50/50 flex-1 min-h-0">

                    {/* Column 1: Search & Department */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col gap-6 min-h-0 overflow-hidden">
                        <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4">
                            <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                            1. Search Filters
                        </h3>
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Keyword Search</span>
                                <input
                                    type="text"
                                    placeholder="Name or ID..."
                                    value={localFilters.search || ""}
                                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                    className="w-full text-xs font-bold border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:border-(--color-primary) outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">By Department</span>
                                <select
                                    value={localFilters.department || ""}
                                    onChange={(e) => setLocalFilters({ ...localFilters, department: e.target.value })}
                                    className="w-full text-xs font-bold border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 focus:border-(--color-primary) outline-none transition-all cursor-pointer"
                                >
                                    <option value="">All Departments</option>
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="EEE">EEE</option>
                                    <option value="IT">IT</option>
                                    <option value="AIDS">AIDS</option>
                                    <option value="CIVIL">CIVIL</option>
                                    <option value="MECH">MECH</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Standard Formats */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col gap-4 overflow-hidden">
                        <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4">
                            <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                            2. Report Formats
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                            {reportPresets.map(preset => (
                                <div
                                    key={preset.name}
                                    onClick={() => setSelectedPreset(preset.name)}
                                    className={`text-[11px] p-3 cursor-pointer rounded-xl transition-all duration-300 font-bold border ${selectedPreset === preset.name ? "bg-(--color-primary) text-white border-(--color-primary) shadow-md transform translate-x-1" : "text-gray-700 border-transparent hover:border-gray-100 hover:bg-gray-50 select-none"}`}
                                >
                                    {preset.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 3: Orientation & Output */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow flex flex-col gap-4 overflow-hidden">
                        <h3 className="text-(--color-primary) font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-b pb-4">
                            <div className="w-1.5 h-1.5 bg-(--color-primary) rounded-full"></div>
                            3. Page Settings
                        </h3>
                        <div className="mt-2 space-y-6">
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-4">Orientation</span>
                                <div className="flex gap-8">
                                    {["Portrait", "Landscape"].map(opt => (
                                        <label key={opt} className="flex items-center gap-3 text-xs cursor-pointer group">
                                            <input type="radio" checked={paperOrientation === opt} onChange={() => setPaperOrientation(opt)} className="accent-(--color-primary)" />
                                            <span className="font-bold text-gray-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-4">Output Mode</span>
                                <div className="flex gap-8">
                                    {["Window", "Printer"].map(opt => (
                                        <label key={opt} className="flex items-center gap-3 text-xs cursor-pointer group">
                                            <input type="radio" checked={printOption === opt} onChange={() => setPrintOption(opt)} className="accent-(--color-primary)" />
                                            <span className="font-bold text-gray-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-[10px] text-gray-500 font-medium leading-relaxed">
                            Faculty reports reflect real-time academic personnel demographics.
                        </div>
                    </div>
                </div>

                <div className="bg-white border-t border-gray-100 px-8 py-5 flex justify-end items-center gap-6 shadow-2xl relative z-20">
                    <button
                        onClick={handleClear}
                        className="text-gray-400 hover:text-(--color-primary) font-bold text-xs uppercase tracking-widest px-4 transition-all flex items-center gap-2 group"
                    >
                        <FiRotateCcw className="group-hover:-rotate-45 transition-transform" /> Clear Settings
                    </button>
                    <button
                        onClick={handleLoad}
                        className="bg-(--color-primary) text-white px-10 py-4 text-xs font-bold rounded-xl shadow-xl shadow-(--color-primary)/20 hover:opacity-95 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest"
                    >
                        <FiEye size={16} /> Process & Open
                    </button>
                </div>
            </div>
        </div>
    );
}
