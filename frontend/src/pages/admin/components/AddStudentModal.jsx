import { useState, useEffect } from "react";
import { X, UserPlus, Mail, Hash, BookOpen, GraduationCap, Phone, Calendar, MapPin } from "lucide-react";
import adminService from "../services/adminService";

const initialFormData = {
    name: "",
    rollNo: "",
    department: "CSE",
    year: "1",
    semester: "1",
    email: "",
    phoneNumber: "",
    dob: "",
    admissionDate: new Date().toISOString().split('T')[0],
    studentId: "",
    status: "Active"
};

export default function AddStudentModal({ setShowModal, refreshStudents }) {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);

    const handleClearAndClose = () => {
        setFormData(initialFormData);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!/^[A-Za-z\s]+$/.test(formData.name)) {
            alert("Validation Error: Name must contain letters and spaces only.");
            return;
        }
        if (!/^\d+$/.test(formData.phoneNumber)) {
            alert("Validation Error: Phone Number must contain numbers only.");
            return;
        }

        try {
            setLoading(true);
            const departmentFullMap = {
                "CSE": "Computer Science & Engineering",
                "IT": "Information Technology",
                "ECE": "Electronics & Communication Engineering",
                "EEE": "Electrical & Electronics Engineering",
                "Mech": "Mechanical Engineering",
                "Civil": "Civil Engineering",
                "AI&DS": "Artificial Intelligence & Data Science",
                "S&H": "Science & Humanities",
            };
            const res = await adminService.addStudent({
                ...formData,
                departmentFull: departmentFullMap[formData.department] || formData.department,
                semester: parseInt(formData.semester)
            });
            if (res.success) {
                alert("Student profile created successfully!");
                refreshStudents();
                setShowModal(false);
            } else {
                alert("Error: " + (res.message || "Failed to add student"));
            }
        } catch (error) {
            console.error("AddStudent error:", error);
            alert("Network error while adding student");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleKeys = (e) => {
            if (e.key === "Escape") handleClearAndClose();
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [formData, loading]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[300] backdrop-blur-md animate-in fade-in duration-300 p-4">
            <div className={`bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto ${loading ? 'opacity-70 pointer-events-none' : ''}`}>

                <button
                    onClick={handleClearAndClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 p-2 rounded-xl"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-(--color-primary) font-heading flex flex-col">
                    Add New Student
                    <span className="text-xs font-normal text-gray-500 mt-1 uppercase tracking-wider">Student Profile Details</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <UserPlus size={12} /> Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Arjun Das"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                            />
                        </div>



                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Hash size={12} /> Register Number (Roll No)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 22CS001"
                                required
                                value={formData.rollNo}
                                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={12} /> Department
                            </label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none cursor-pointer font-bold text-sm"
                            >
                                <option value="CSE">Computer Science Engineering</option>
                                <option value="IT">Information Technology</option>
                                <option value="ECE">Electronics & Communication</option>
                                <option value="EEE">Electrical & Electronics</option>
                                <option value="Mech">Mechanical Engineering</option>
                                <option value="Civil">Civil Engineering</option>
                                <option value="AI&DS">Artificial Intelligence & Data Science</option>
                                <option value="S&H">Science & Humanities</option>
                                <option value="Management">Management</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <GraduationCap size={12} /> Year of Study
                            </label>
                            <select
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none cursor-pointer font-bold text-sm"
                            >
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <GraduationCap size={12} /> Semester
                            </label>
                            <select
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none cursor-pointer font-bold text-sm"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Mail size={12} /> Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="arjun@example.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={12} /> Phone Number
                            </label>
                            <input
                                type="text"
                                placeholder="+91 9876543210"
                                required
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} /> Date of Birth
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                            />
                        </div>


                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleClearAndClose}
                            className="flex-1 px-8 py-3.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-(--color-primary) text-white py-3.5 rounded-xl text-sm font-bold shadow-xl shadow-(--color-primary)/20 hover:opacity-95 items-center justify-center gap-2 flex transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Registering..." : "Save Student Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
