import { useState, useEffect } from "react";
import { X, UserPlus, Mail, Hash, BookOpen, Briefcase, Calendar, Phone, Award, Star } from "lucide-react";
import adminService from "../services/adminService";

const initialFormData = {
    name: "",
    employeeId: "",
    department: "CSE",
    designation: "",
    qualification: "",
    joiningDate: new Date().toISOString().split('T')[0],
    experienceYears: "",
    specialization: "",
    email: "",
    phone: "",
    gender: "Male",
};

export default function AddFacultyModal({ setShowModal, refreshFaculties }) {
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
        if (!/^\d+$/.test(formData.phone)) {
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
                "Management": "Management"
            };
            const res = await adminService.addFaculty({
                ...formData,
                departmentFull: departmentFullMap[formData.department] || formData.department,
                experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : 0
            });
            if (res.success) {
                alert("Faculty profile created successfully!");
                refreshFaculties();
                setShowModal(false);
            } else {
                alert("Error: " + (res.message || "Failed to add Faculty"));
            }
        } catch (error) {
            console.error("AddFaculty error:", error);
            alert("Network error while adding Faculty");
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
                    Add New Faculty
                    <span className="text-xs font-normal text-gray-500 mt-1 uppercase tracking-wider">Faculty Details & Position</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5 col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <UserPlus size={12} /> Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Dr. Meenakshi Sharma"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Hash size={12} /> Faculty ID (Employee ID)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. NSCIT001"
                                required
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
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
                                <option value="CSE">Computer Science & Engineering (CSE)</option>
                                <option value="IT">Information Technology (IT)</option>
                                <option value="ECE">Electronics & Communication (ECE)</option>
                                <option value="EEE">Electrical & Electronics (EEE)</option>
                                <option value="Mech">Mechanical Engineering (Mech)</option>
                                <option value="Civil">Civil Engineering (Civil)</option>
                                <option value="AI&DS">Artificial Intelligence & Data Science (AI&DS)</option>
                                <option value="S&H">Science & Humanities (S&H)</option>
                                <option value="Management">Management</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={12} /> Designation
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. HOD / Professor"
                                required
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none font-bold text-sm"
                            />
                        </div>



                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gender</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all outline-none cursor-pointer font-bold text-sm"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Mail size={12} /> Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="e.g. name@nscet.edu.in"
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
                                placeholder="e.g. 9876543210"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                            {loading ? "Registering..." : "Complete Faculty Setup"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
