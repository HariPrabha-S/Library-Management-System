import { useState, useEffect, useRef } from "react";
import { FiArrowRight, FiArrowLeft, FiClock, FiUser, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function StudentAttendance() {
    const [mode, setMode] = useState("IN"); // IN or OUT
    const [scannedId, setScannedId] = useState("");
    const [lastScan, setLastScan] = useState(null);
    const [attendance, setAttendance] = useState([
        { id: "1", name: "Arun Kumar", rollNo: "CSE001", type: "IN", time: "09:00 AM" },
        { id: "2", name: "Priya Sharma", rollNo: "ECE015", type: "OUT", time: "10:30 AM" }
    ]);
    const inputRef = useRef(null);

    // Keep the input field focused so the physical scanner always has a target
    useEffect(() => {
        const keepFocus = () => inputRef.current?.focus();
        document.addEventListener("click", keepFocus);
        keepFocus();
        return () => document.removeEventListener("click", keepFocus);
    }, []);

    const handleScan = (e) => {
        e.preventDefault();
        if (!scannedId.trim()) return;

        // Mocking student lookup
        const newRecord = {
            id: Date.now().toString(),
            name: "LMS Student", // In real app, fetch from DB
            rollNo: scannedId,
            type: mode,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setAttendance(prev => [newRecord, ...prev]);
        setLastScan({ ...newRecord, success: true });
        setScannedId("");

        // Clear feedback after 4 seconds
        setTimeout(() => setLastScan(null), 4000);
    };

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)]">
                        Attendance Scanner
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Connect your barcode scanner to track student entry/exit</p>
                </div>

                {/* MODE TOGGLE */}
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setMode("IN")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold ${mode === "IN"
                            ? "bg-teal-500 text-white shadow-md shadow-teal-100"
                            : "text-gray-400 hover:bg-gray-50"
                            }`}
                    >
                        <FiArrowRight /> ENTRY
                    </button>
                    <button
                        onClick={() => setMode("OUT")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold ${mode === "OUT"
                            ? "bg-red-500 text-white shadow-md shadow-red-100"
                            : "text-gray-400 hover:bg-gray-50"
                            }`}
                    >
                        <FiArrowLeft /> EXIT
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* INPUT & FEEDBACK */}
                <div className="flex flex-col gap-6">
                    {/* HIDDEN INPUT FOR SCANNER */}
                    <form onSubmit={handleScan} className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={scannedId}
                            onChange={(e) => setScannedId(e.target.value)}
                            placeholder="Ready to Scan..."
                            className="w-full bg-white border-4 border-[var(--color-primary)]/10 px-6 py-8 rounded-3xl text-3xl font-heading font-black text-center focus:outline-none focus:border-[var(--color-primary)]/30 transition-all placeholder:text-gray-200"
                            autoComplete="off"
                        />
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">
                            Scanner Active
                        </div>
                    </form>

                    {/* STATUS INDICATOR */}
                    <div className={`p-10 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${mode === "IN" ? "bg-teal-50/50 border-teal-100" : "bg-red-50/50 border-red-100"
                        }`}>
                        {!lastScan ? (
                            <>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${mode === "IN" ? "bg-white text-teal-500" : "bg-white text-red-500"
                                    }`}>
                                    <FiUser size={40} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
                                    Waiting for {mode === "IN" ? "Entry" : "Exit"} Scan
                                </h2>
                                <p className="text-gray-500 max-w-xs mt-2 text-sm">
                                    Please scan the student ID barcode or type the Roll Number manualy.
                                </p>
                            </>
                        ) : (
                            <div className="animate-bounce">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto ${lastScan.type === "IN" ? "bg-teal-500 text-white" : "bg-red-500 text-white"
                                    } shadow-xl`}>
                                    <FiCheckCircle size={48} />
                                </div>
                                <h2 className="text-3xl font-heading font-black text-gray-800">
                                    SUCCESSFUL
                                </h2>
                                <p className="text-gray-600 font-medium mt-1">
                                    {lastScan.name} marked as <span className="font-bold">{lastScan.type}</span>
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 mt-2">ID: {lastScan.rollNo}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* LOG SECTION */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <FiClock size={20} className="text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                    </div>

                    <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                        {attendance.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-4 bg-white border border-gray-50 rounded-2xl hover:border-[var(--color-primary)]/10 transition-colors shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <FiUser size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 leading-tight">{log.name}</p>
                                        <p className="text-[10px] text-gray-400">{log.rollNo}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest transition-colors ${log.type === "IN" ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-600"
                                        }`}>
                                        {log.type}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                        <FiClock size={10} /> {log.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* HELPER BOX */}
            <div className="mt-8 p-4 bg-[var(--color-primary)]/5 rounded-2xl flex items-center gap-4 text-[var(--color-primary)] border border-[var(--color-primary)]/10">
                <FiAlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-medium leading-relaxed">
                    <strong>Librarian Tip:</strong> You can click anywhere on the page to automatically re-focus the scanner input. Ensure your barcode scanner is in "Keyboard Emulation" mode (Standard).
                </p>
            </div>
        </div>
    );
}
