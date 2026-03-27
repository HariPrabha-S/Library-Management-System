import { useState, useEffect, useRef } from "react";
import { FiClock, FiUser, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function StudentAttendance() {
    const [scannedId, setScannedId] = useState("");
    const [lastScan, setLastScan] = useState(null);
    const [attendance, setAttendance] = useState([
        { id: "1", name: "Arun Kumar", rollNo: "CSE001", type: "IN", time: "09:00 AM" },
        { id: "2", name: "Priya Sharma", rollNo: "ECE015", type: "OUT", time: "10:30 AM" }
    ]);
    const inputRef = useRef(null);
    const studentsIn = attendance.filter((record) => record.type === "IN");
    const studentsOut = attendance.filter((record) => record.type === "OUT");
    const activeTone = {
        panel: "from-white via-white to-slate-50",
        border: "border-slate-200/80",
        accent: "text-teal-600",
        softBg: "bg-teal-50",
        softText: "text-teal-700",
        ring: "shadow-teal-100/80",
        dashed: "border-teal-200",
    };

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

        const rollNo = scannedId.trim();
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setAttendance((prev) => {
            const existingIn = prev.find((record) => record.rollNo === rollNo && record.type === "IN");
            const nextType = existingIn ? "OUT" : "IN";
            const newRecord = {
                id: Date.now().toString(),
                name: existingIn?.name || "LMS Student", // In real app, fetch from DB
                rollNo,
                type: nextType,
                time,
            };

            setLastScan({ ...newRecord, success: true });

            const withoutExisting = prev.filter((record) => record.rollNo !== rollNo);
            return [newRecord, ...withoutExisting];
        });
        setScannedId("");

        // Clear feedback after 4 seconds
        setTimeout(() => setLastScan(null), 4000);
    };

    const moveStudentsToOut = (rollNumbers) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setAttendance((prev) => {
            const studentsToMove = prev.filter((record) => record.type === "IN" && rollNumbers.includes(record.rollNo));
            const remaining = prev.filter((record) => !rollNumbers.includes(record.rollNo));
            const moved = studentsToMove.map((student) => ({
                ...student,
                id: `${student.rollNo}-${Date.now()}`,
                type: "OUT",
                time,
            }));
            return [...moved, ...remaining];
        });
    };

    const clearInStudents = () => {
        moveStudentsToOut(studentsIn.map((student) => student.rollNo));
    };

    const clearOutStudents = () => {
        setAttendance((prev) => prev.filter((record) => record.type !== "OUT"));
    };

    return (
        <div className="animate-fade-in mx-auto max-w-7xl px-2 md:px-3">
            {/* HEADER */}
            <div className="mb-8 rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="max-w-2xl">
                        <p className="mb-3 inline-flex items-center rounded-full border border-[var(--color-primary)]/10 bg-[var(--color-primary)]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-primary)]">
                            Live Desk Scanner
                        </p>
                        <h1 className="font-heading text-4xl font-bold text-[var(--color-primary)]">
                            Attendance Scanner
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Keep the scanner focused, scan once for in, scan again for out, and track both tables live.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 xl:items-end">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Today</p>
                                <p className="mt-1 text-xl font-black text-slate-800">{attendance.length}</p>
                            </div>
                            <div className="rounded-2xl border border-teal-100 bg-teal-50/80 px-4 py-3 text-center shadow-[0_12px_30px_rgba(20,184,166,0.12)]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-500">In Students</p>
                                <p className="mt-1 text-xl font-black text-teal-700">{studentsIn.length}</p>
                            </div>
                            <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-center shadow-[0_12px_30px_rgba(244,63,94,0.12)]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500">Out Records</p>
                                <p className="mt-1 text-xl font-black text-rose-700">{studentsOut.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
                {/* INPUT & FEEDBACK */}
                <div className="min-w-0 flex flex-col gap-6">
                    {/* HIDDEN INPUT FOR SCANNER */}
                    <form
                        onSubmit={handleScan}
                        className={`relative overflow-hidden rounded-[2rem] border bg-gradient-to-br ${activeTone.panel} p-6 shadow-[0_26px_75px_rgba(15,23,42,0.12)] ${activeTone.border}`}
                    >
                        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/60 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/70 blur-2xl" />
                        <div className="relative z-10 mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                                    Scanner Active
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Ready to capture student in and out attendance.
                                </p>
                            </div>
                            <div className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] ${activeTone.softBg} ${activeTone.softText}`}>
                                Auto Toggle Scan
                            </div>
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={scannedId}
                            onChange={(e) => setScannedId(e.target.value)}
                            placeholder="Ready to Scan..."
                            className={`relative z-10 w-full rounded-[1.75rem] border border-white/80 bg-white/90 px-6 py-9 text-center text-3xl font-heading font-black text-slate-700 outline-none transition-all placeholder:text-slate-200 focus:border-white focus:bg-white focus:shadow-2xl ${activeTone.ring}`}
                            autoComplete="off"
                        />
                        <div className="relative z-10 mt-4 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                            <span>Scanner input stays focused automatically</span>
                            <span>Press Enter after manual entry</span>
                        </div>
                    </form>

                    {/* STATUS INDICATOR */}
                    <div className={`rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_26px_75px_rgba(15,23,42,0.12)]`}>
                        {!lastScan ? (
                            <>
                                <div className={`rounded-[1.75rem] border-2 border-dashed ${activeTone.dashed} bg-white px-8 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_45px_rgba(15,23,42,0.06)]`}>
                                    <div className={`mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-white text-4xl shadow-[0_18px_40px_rgba(15,23,42,0.14)] ${activeTone.accent}`}>
                                        <FiUser size={42} />
                                    </div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">
                                        Awaiting Scan
                                    </p>
                                    <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-slate-800 sm:text-3xl">
                                        Waiting for Student Scan
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
                                        Scan the student barcode or type the roll number manually. If the student is already in, the next scan moves them to out.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-[1.75rem] bg-white px-8 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_45px_rgba(15,23,42,0.06)]">
                                <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 text-white shadow-[0_18px_40px_rgba(20,184,166,0.25)]">
                                    <FiCheckCircle size={48} />
                                </div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">
                                    Scan Complete
                                </p>
                                <h2 className="mt-3 text-4xl font-heading font-black text-slate-800">
                                    Successful
                                </h2>
                                <p className="mt-2 text-base font-medium text-slate-600">
                                    {lastScan.name} moved to <span className="font-bold">{lastScan.type === "IN" ? "In Students" : "Out Students"}</span>
                                </p>
                                <div className="mx-auto mt-6 flex max-w-xs items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-left shadow-sm">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Roll No</p>
                                        <p className="text-sm font-bold text-slate-700">{lastScan.rollNo}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</p>
                                        <p className={`text-sm font-bold ${lastScan.type === "IN" ? "text-teal-600" : "text-rose-600"}`}>{lastScan.type}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* LOG SECTION */}
                <div className="min-w-0 flex flex-col gap-6">
                    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_26px_75px_rgba(15,23,42,0.12)]">
                        <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.1)] ring-1 ring-slate-100">
                                    <FiClock size={20} className="text-slate-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--color-primary)]">In Students</h2>
                                    <p className="text-sm text-slate-400">Students currently present in the library</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-600 shadow-[0_8px_24px_rgba(20,184,166,0.12)] ring-1 ring-teal-100">
                                    {studentsIn.length} students
                                </div>
                                <button
                                    onClick={clearInStudents}
                                    className="inline-flex items-center justify-center rounded-full border border-rose-100 bg-gradient-to-b from-white to-rose-50 px-5 py-2.5 text-xs font-bold tracking-[0.08em] text-rose-600 shadow-[0_10px_28px_rgba(244,63,94,0.14)] transition hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-[0_14px_32px_rgba(244,63,94,0.18)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                    disabled={studentsIn.length === 0}
                                >
                                    Remove All In
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto p-5 sm:p-6">
                            {studentsIn.length === 0 ? (
                                <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(15,23,42,0.05)]">
                                    No students are currently marked in.
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 md:hidden">
                                        {studentsIn.map((student) => (
                                            <div key={student.id} className="rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-base font-bold text-slate-800">{student.name}</p>
                                                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{student.rollNo}</p>
                                                    </div>
                                                    <span className="shrink-0 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-black tracking-[0.2em] text-teal-700">IN</span>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between gap-3">
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                                        <FiClock size={10} /> {student.time}
                                                    </span>
                                                    <button
                                                        onClick={() => moveStudentsToOut([student.rollNo])}
                                                        className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                                                    >
                                                        Move to Out
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="hidden overflow-hidden rounded-[1.6rem] border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.07)] md:block">
                                        <table className="w-full table-fixed text-left">
                                            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                                            <tr>
                                                <th className="w-[28%] px-4 py-4 lg:px-6">Student</th>
                                                <th className="w-[20%] px-4 py-4 lg:px-6">Roll No</th>
                                                <th className="w-[16%] px-4 py-4 lg:px-6">Status</th>
                                                <th className="w-[18%] px-4 py-4 text-right lg:px-6">Scanned</th>
                                                <th className="w-[18%] px-4 py-4 text-right lg:px-6">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentsIn.map((student) => (
                                                <tr key={student.id} className="border-t border-slate-100 bg-white text-sm text-slate-600">
                                                    <td className="px-4 py-4 font-bold text-slate-800 lg:px-6">
                                                        <span className="block truncate">{student.name}</span>
                                                    </td>
                                                    <td className="px-4 py-4 uppercase tracking-[0.12em] text-slate-500 lg:px-6">{student.rollNo}</td>
                                                    <td className="px-4 py-4 lg:px-6">
                                                        <span className="rounded-full bg-teal-100 px-3 py-1 text-[11px] font-black tracking-[0.2em] text-teal-700">
                                                            IN
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right lg:px-6">
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                                            <FiClock size={10} /> {student.time}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right lg:px-6">
                                                    <button
                                                        onClick={() => moveStudentsToOut([student.rollNo])}
                                                        className="rounded-full border border-rose-100 bg-gradient-to-b from-white to-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 shadow-[0_8px_20px_rgba(244,63,94,0.12)] transition hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-[0_12px_24px_rgba(244,63,94,0.16)]"
                                                    >
                                                        Move Out
                                                    </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_26px_75px_rgba(15,23,42,0.12)]">
                        <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-rose-50/40 to-white p-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.1)] ring-1 ring-slate-100">
                                    <FiClock size={20} className="text-slate-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--color-primary)]">Out Students</h2>
                                    <p className="text-sm text-slate-400">Students who have scanned out of the library</p>
                                </div>
                            </div>
                            <div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
                                {studentsOut.length} students
                            </div>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto p-5 sm:p-6">
                            {studentsOut.length === 0 ? (
                                <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(15,23,42,0.05)]">
                                    No students are currently marked out.
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 md:hidden">
                                        {studentsOut.map((student) => (
                                            <div key={student.id} className="rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-base font-bold text-slate-800">{student.name}</p>
                                                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{student.rollNo}</p>
                                                    </div>
                                                    <span className="shrink-0 rounded-full bg-rose-100 px-3 py-1 text-[11px] font-black tracking-[0.2em] text-rose-700">OUT</span>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between gap-3">
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                                        <FiClock size={10} /> {student.time}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-300">Recorded</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="hidden overflow-hidden rounded-[1.6rem] border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.07)] md:block">
                                        <table className="w-full table-fixed text-left">
                                            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                                            <tr>
                                                <th className="w-[28%] px-4 py-4 lg:px-6">Student</th>
                                                <th className="w-[20%] px-4 py-4 lg:px-6">Roll No</th>
                                                <th className="w-[16%] px-4 py-4 lg:px-6">Status</th>
                                                <th className="w-[18%] px-4 py-4 text-right lg:px-6">Scanned</th>
                                                <th className="w-[18%] px-4 py-4 text-right lg:px-6">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentsOut.map((student) => (
                                                <tr key={student.id} className="border-t border-slate-100 bg-white text-sm text-slate-600">
                                                    <td className="px-4 py-4 font-bold text-slate-800 lg:px-6">
                                                        <span className="block truncate">{student.name}</span>
                                                    </td>
                                                    <td className="px-4 py-4 uppercase tracking-[0.12em] text-slate-500 lg:px-6">{student.rollNo}</td>
                                                    <td className="px-4 py-4 lg:px-6">
                                                        <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-black tracking-[0.2em] text-rose-700">
                                                            OUT
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right lg:px-6">
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                                            <FiClock size={10} /> {student.time}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-xs font-medium text-slate-300 lg:px-6">
                                                        Recorded
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* HELPER BOX */}
            <div className="mt-8 flex items-start gap-4 rounded-[1.8rem] border border-[var(--color-primary)]/10 bg-gradient-to-r from-[var(--color-primary)]/6 via-white to-[var(--color-primary)]/3 p-5 text-[var(--color-primary)] shadow-[0_22px_55px_rgba(121,12,12,0.1)]">
                <div className="mt-0.5 rounded-2xl bg-white p-3 shadow-[0_12px_28px_rgba(121,12,12,0.12)]">
                    <FiAlertCircle size={20} className="shrink-0" />
                </div>
                <p className="text-sm font-medium leading-7">
                    <strong>Librarian Tip:</strong> You can click anywhere on the page to automatically re-focus the scanner input. Ensure your barcode scanner is in "Keyboard Emulation" mode (Standard).
                </p>
            </div>
        </div>
    );
}
