import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLE_CONFIG = {
    student: { label: "Roll Number", placeholder: "Enter your roll number" },
    faculty: { label: "Faculty ID", placeholder: "Enter your faculty ID" },
    admin: { label: "Admin ID", placeholder: "Enter your admin ID" },
};

export default function Login() {
    const [role, setRole] = useState("student");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "student") navigate("/student/dashboard");
        else if (role === "faculty") navigate("/faculty/dashboard");
    };

    return (
        <div className="min-h-screen flex">

            {/* LEFT SIDE – LMS Branding */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#790c0c] to-[#01898d] text-white items-center justify-center p-12">
                <div>

                    {/* 🔥 Added font-heading */}
                    <h1 className="text-4xl font-heading font-bold mb-6">
                        Library Management System
                    </h1>

                    {/* 🔥 Added font-heading + bigger for serif impact */}
                    <h2 className="text-4xl font-heading font-bold leading-tight mb-8">
                        Organizing Knowledge,
                        <br />
                        Empowering Learning
                    </h2>

                    <p className="text-lg opacity-90">
                        Search books, manage borrowings, track due dates,
                        and access academic resources from one unified platform.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE – LOGIN CARD */}
            <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 p-6">
                <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl">

                    {/* 🔥 Added font-heading */}
                    <h2 className="text-2xl font-heading font-bold text-center mb-2">
                        Welcome Back
                    </h2>

                    <p className="text-center text-gray-500 mb-6">
                        Sign in to your LMS account
                    </p>

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                Login As
                            </label>
                            <div className="relative">
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 font-medium outline-none focus:bg-white focus:border-(--color-primary) focus:ring-4 focus:ring-(--color-primary)/5 transition-all cursor-pointer pr-10"
                                >
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-(--color-primary) transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {ROLE_CONFIG[role].label}
                            </label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#01898d]"
                                placeholder={ROLE_CONFIG[role].placeholder}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#01898d]"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#790c0c] text-white py-3 rounded-lg hover:opacity-90 transition font-medium tracking-wide"
                        >
                            Sign In
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}