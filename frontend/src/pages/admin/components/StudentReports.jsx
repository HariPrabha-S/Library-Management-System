import { useState, useEffect, useCallback } from "react";
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

    const handleLoad = useCallback(() => {
        const foundPreset = reportPresets.find(p => p.name === selectedPreset) || reportPresets[0];
        onPreview(foundPreset.columns, printOption, paperOrientation, localSearch, foundPreset.name);
    }, [selectedPreset, printOption, paperOrientation, localSearch, onPreview, reportPresets]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            } else if (e.key === "Enter") {
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

                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-hidden bg-gray-50/50 flex-1">
                    <div className="space-y-4 flex flex-col h-full overflow-hidden">
                        {/* Report Categories */}
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

                        {/* Preview - Bottom Right Section */}
                        <div className="mt-auto pt-4 shadow-md bg-white p-4 rounded-2xl border border-gray-100">
                            <button
                                onClick={handleLoad}
                                className="w-full bg-[var(--color-secondary)] text-white hover:opacity-95 py-4 text-sm font-bold rounded-2xl shadow-xl shadow-[var(--color-secondary)]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <FiEye size={18} />
                                Preview Report
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-t border-gray-100 px-6 py-4 flex justify-end items-center gap-4">
                    <p className="mr-auto text-[10px] text-gray-400 font-medium italic">Reports reflect real-time student demographic data.</p>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 font-bold text-xs px-4 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
