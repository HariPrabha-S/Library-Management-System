import { useState } from "react";
import { FiX, FiPrinter, FiEye } from "react-icons/fi";

export default function StudentReports({ isOpen, onClose, search, setSearch, onPreview }) {
    const [localSearch, setLocalSearch] = useState(search || "");
    const [selectedPreset, setSelectedPreset] = useState("Standard Student List");
    const [paperOrientation, setPaperOrientation] = useState("Portrait");
    const [printOption, setPrintOption] = useState("Window");

    const reportPresets = [
        { name: "Standard Student List", columns: ["name", "rollNo", "department", "email"] },
        { name: "Full Details", columns: ["name", "rollNo", "department", "year", "email"] },
        { name: "Department-wise List", columns: ["department", "name", "rollNo"] },
        { name: "Library Activity", columns: ["name", "rollNo", "totalBooks", "issuedBooks", "returnedBooks", "fine"] },
    ];

    if (!isOpen) return null;

    const handleLoad = () => {
        const foundPreset = reportPresets.find(p => p.name === selectedPreset) || reportPresets[0];
        onPreview(foundPreset.columns, printOption, paperOrientation, localSearch, foundPreset.name);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-2 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[96vh]">
                <div className="bg-[var(--color-primary)] px-5 py-3 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-1 rounded-lg">
                            <FiPrinter size={16} />
                        </div>
                        <span className="font-bold tracking-wide text-sm">Generate Student Reports</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                        <FiX size={18} />
                    </button>
                </div>

                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-y-auto bg-gray-50/50">
                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-xl bg-white shadow-sm relative pt-3 flex flex-col h-64">
                            <span className="absolute -top-3 left-3 bg-[var(--color-primary)] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm z-10">Report Categories</span>
                            <div className="mt-1 flex-1 overflow-y-auto custom-scrollbar px-1.5 pb-1.5">
                                <div className="space-y-0.5">
                                    {reportPresets.map(preset => (
                                        <div
                                            key={preset.name}
                                            onClick={() => setSelectedPreset(preset.name)}
                                            className={`text-[10px] p-2 cursor-pointer rounded-lg transition-all duration-200 font-medium ${selectedPreset === preset.name ? "bg-[var(--color-secondary)] text-white shadow-md transform translate-x-1" : "text-gray-700 hover:bg-[var(--color-secondary)]/5 hover:text-[var(--color-secondary)]"}`}
                                        >
                                            {preset.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm relative pt-5">
                            <span className="absolute -top-3 left-3 bg-[var(--color-primary)] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">Data Filter</span>
                            <div className="mt-1 flex flex-col gap-1.5">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Search Keyword</span>
                                <input
                                    type="text"
                                    placeholder="Enter keyword..."
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    className="border border-gray-200 w-full px-3 py-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all bg-gray-50/50"
                                />
                            </div>
                        </div>

                        <div className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm relative pt-5">
                            <span className="absolute -top-3 left-3 bg-[var(--color-primary)] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">Orientation</span>
                            <div className="flex gap-4 mt-1">
                                {["Portrait", "Landscape"].map(opt => (
                                    <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" name="orientation" checked={paperOrientation === opt} onChange={() => setPaperOrientation(opt)} className="sr-only" />
                                            <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${paperOrientation === opt ? "border-[var(--color-secondary)] scale-110" : "border-gray-300 group-hover:border-gray-400"}`}></div>
                                            {paperOrientation === opt && <div className="absolute w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] animate-in fade-in zoom-in duration-200"></div>}
                                        </div>
                                        <span className={`font-medium ${paperOrientation === opt ? "text-gray-900" : "text-gray-600"}`}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm relative pt-5">
                            <span className="absolute -top-3 left-3 bg-[var(--color-primary)] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">Print To</span>
                            <div className="flex gap-4 mt-1">
                                {["Window", "Printer"].map(opt => (
                                    <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" name="printTo" checked={printOption === opt} onChange={() => setPrintOption(opt)} className="sr-only" />
                                            <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${printOption === opt ? "border-[var(--color-secondary)] scale-110" : "border-gray-300 group-hover:border-gray-400"}`}></div>
                                            {printOption === opt && <div className="absolute w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] animate-in fade-in zoom-in duration-200"></div>}
                                        </div>
                                        <span className={`font-medium ${printOption === opt ? "text-gray-900" : "text-gray-600"}`}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={onClose}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2 text-xs font-bold rounded-xl transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLoad}
                        className="bg-[var(--color-primary)] text-white hover:opacity-95 px-7 py-2 text-xs font-bold rounded-xl shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <FiEye size={14} />
                        Preview
                    </button>
                </div>
            </div>
        </div>
    );
}
