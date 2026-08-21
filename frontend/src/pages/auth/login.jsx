import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLE_CONFIG = {
    student: { label: "Register Number", placeholder: "Enter your Register Number" },
    faculty: { label: "Faculty ID", placeholder: "Enter your faculty ID" },
    admin: { label: "Admin Username", placeholder: "Enter your admin username" },
};

export default function Login({ onLoginSuccess }) {
    const [role, setRole] = useState("student");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Clear any previous session details completely
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        try {
            const payload = {
                user_id: identifier,
                email: identifier,
                username: identifier,
                password,
                role,
            };

            console.log('[AUTH] Sending login request', { role, identifier });
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            // Read raw response text first to avoid JSON parse throwing on empty/non-JSON bodies
            const raw = await res.text();
            console.log('[AUTH] Login response', { status: res.status, raw });
            let data = null;
            try {
                data = raw ? JSON.parse(raw) : null;
            } catch (parseErr) {
                // Response wasn't JSON
                const snippet = raw && raw.length > 200 ? raw.slice(0, 200) + '...' : raw;
                throw new Error(`Server returned unexpected response: ${snippet || '<empty response>'}`);
            }

            if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.role);
            localStorage.setItem('userId', data.userId);

            if (onLoginSuccess) onLoginSuccess(data.user);

            if (data.role === 'student') navigate('/student/dashboard');
            else if (data.role === 'faculty') navigate('/faculty/dashboard');
            else navigate('/admin/dashboard');

        } catch (err) {
            setError(err.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* LEFT - Gradient panel */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#7f1d1d] via-[#6b7b73] to-[#0e7b72] text-white items-center justify-center p-12">
                <div className="max-w-lg">
                    <h1 className="text-4xl font-serif font-bold mb-6">Library Management System</h1>
                    <h2 className="text-3xl font-serif font-bold leading-tight mb-6">Organizing Knowledge,<br />Empowering Learning</h2>
                    <p className="text-lg opacity-90">Search books, manage borrowings, track due dates, and access academic resources from one unified platform.</p>
                </div>
            </div>

            {/* RIGHT - Login card */}
            <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 p-6">
                <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl">

                    <h2 className="text-2xl font-serif font-bold text-center mb-1">Welcome Back</h2>
                    <p className="text-center text-gray-500 mb-6">Sign in to your LMS account</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
                    )}

                    <form className="space-y-4" onSubmit={handleLogin}>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Login As</label>
                            <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-[#01898d]">
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{ROLE_CONFIG[role].label}</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#01898d]"
                                placeholder={ROLE_CONFIG[role].placeholder}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-28 focus:outline-none focus:ring-2 focus:ring-[#01898d]"
                                    placeholder={role === 'student' ? 'Enter your password' : 'Enter your password'}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 inline-flex items-center px-4 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#7b0b0b] text-white py-3 rounded-lg hover:opacity-95 transition font-medium tracking-wide disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                    </form>



                </div>
            </div>

        </div>
    );
}