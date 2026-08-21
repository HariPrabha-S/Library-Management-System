import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/auth/login";
import ScrollToTop from "./pages/auth/ScrollToTop";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBooks from "./pages/admin/ManageBooks";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageFaculties from "./pages/admin/ManageFaculties";
import ManageIssues from "./pages/admin/ManageIssues";
import ManageFines from "./pages/admin/ManageFines";
import ManageRequests from "./pages/admin/ManageRequests";
import ManageDigitalResources from "./pages/admin/ManageDigitalResources";
import ManageReservations from "./pages/admin/ManageReservations";
import DepartmentPage from "./pages/admin/subentries/DepartmentPage";
import DepartmentFormPage from "./pages/admin/subentries/DepartmentFormPage";
import LanguagePage from "./pages/admin/subentries/LanguagePage";
import LanguageFormPage from "./pages/admin/subentries/LanguageFormPage";
import VendorPage from "./pages/admin/subentries/VendorPage";
import VendorFormPage from "./pages/admin/subentries/VendorFormPage";
import SubjectPage from "./pages/admin/subentries/SubjectPage";
import SubjectFormPage from "./pages/admin/subentries/SubjectFormPage";
import HolidayPage from "./pages/admin/subentries/HolidayPage";
import HolidayFormPage from "./pages/admin/subentries/HolidayFormPage";
import PublisherPage from "./pages/admin/subentries/PublisherPage";
import PublisherFormPage from "./pages/admin/subentries/PublisherFormPage";
import StudentsByAcademicYear from "./pages/admin/subentries/StudentsByAcademicYear";

// Student
import StudentLayout from "./pages/Student/components/Layout";
import StudentDashboard from "./pages/Student/Dashboard";
import StudentLibrarySelection from "./pages/Student/LibrarySelection";
import StudentBookSearch from "./pages/Student/BookSearch";
import StudentDeptLibrary from "./pages/Student/DepartmentLibrary";
import StudentIssuedBooks from "./pages/Student/IssuedBooks";
import StudentDigitalResources from "./pages/Student/DigitalResources";
import StudentFineManagement from "./pages/Student/FineManagement";
import StudentRequests from "./pages/Student/Requests";
import StudentHistory from "./pages/Student/History";
import StudentProfile from "./pages/Student/Profile";

// Faculty
import FacultyLayout from "./pages/Faculty/components/Layout";
import FacultyDashboard from "./pages/Faculty/Dashboard";
import FacultyLibrarySelection from "./pages/Faculty/LibrarySelection";
import FacultyBookSearch from "./pages/Faculty/BookSearch";
import FacultyDeptLibrary from "./pages/Faculty/DepartmentLibrary";
import FacultyIssuedBooks from "./pages/Faculty/IssuedBooks";
import FacultyDigitalResources from "./pages/Faculty/DigitalResources";
import FacultyFineManagement from "./pages/Faculty/FineManagement";
import FacultyRequests from "./pages/Faculty/Requests";
import FacultyHistory from "./pages/Faculty/History";
import FacultyProfile from "./pages/Faculty/Profile";
import FacultyJournals from "./pages/Faculty/FacultyJournals";

// Route protection wrapper
function ProtectedRoute({ user, allowedRoles, onLogout, children }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            alert("Unauthorized access. Please log in first.");
            navigate("/", { replace: true });
            return;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Wipes all data to prevent session merging
            localStorage.clear();
            sessionStorage.clear();
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            if (onLogout) {
                onLogout();
            }

            alert("Your session has expired or you attempted to access an unauthorized page. Please log in again.");
            navigate("/", { replace: true });
        }
    }, [user, allowedRoles, navigate, onLogout]);

    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        return null;
    }

    return children;
}

function App() {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch (e) {
            return null;
        }
    });

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
    };

    return (
        <>
            <ScrollToTop />
            <Routes>

                {/* Auth */}
                <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />

                {/* Admin */}
                <Route path="/admin" element={
                    <ProtectedRoute user={user} allowedRoles={['admin']} onLogout={handleLogout}>
                        <AdminLayout user={user} onLogout={handleLogout} />
                    </ProtectedRoute>
                }>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="books" element={<ManageBooks />} />
                    <Route path="students" element={<ManageStudents />} />
                    <Route path="faculties" element={<ManageFaculties />} />
                    <Route path="issues" element={<ManageIssues />} />
                    <Route path="fines" element={<ManageFines />} />
                    <Route path="requests" element={<ManageRequests />} />
                    <Route path="resources" element={<ManageDigitalResources />} />
                    <Route path="reservations" element={<ManageReservations />} />
                    <Route path="subentries/department" element={<DepartmentPage />} />
                    <Route path="subentries/department/form" element={<DepartmentFormPage />} />
                    <Route path="subentries/language" element={<LanguagePage />} />
                    <Route path="subentries/language/form" element={<LanguageFormPage />} />
                    <Route path="subentries/vendors" element={<VendorPage />} />
                    <Route path="subentries/vendors/form" element={<VendorFormPage />} />
                    <Route path="subentries/subject" element={<SubjectPage />} />
                    <Route path="subentries/subject/form" element={<SubjectFormPage />} />
                    <Route path="subentries/holiday" element={<HolidayPage />} />
                    <Route path="subentries/holiday/form" element={<HolidayFormPage />} />
                    <Route path="subentries/publisher" element={<PublisherPage />} />
                    <Route path="subentries/publisher/form" element={<PublisherFormPage />} />
                    <Route path="subentries/academic-year-students" element={<StudentsByAcademicYear />} />
                </Route>

                {/* Student */}
                <Route path="/student" element={
                    <ProtectedRoute user={user} allowedRoles={['student']} onLogout={handleLogout}>
                        <StudentLayout user={user} onLogout={handleLogout} />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<StudentDashboard user={user} />} />
                    <Route path="selection" element={<StudentLibrarySelection user={user} />} />
                    <Route path="search" element={<StudentBookSearch user={user} />} />
                    <Route path="dept-library" element={<StudentDeptLibrary user={user} />} />
                    <Route path="department" element={<StudentDeptLibrary user={user} />} />
                    <Route path="issued" element={<StudentIssuedBooks user={user} />} />
                    <Route path="resources" element={<StudentDigitalResources user={user} />} />
                    <Route path="fines" element={<StudentFineManagement user={user} />} />
                    <Route path="requests" element={<StudentRequests user={user} />} />
                    <Route path="history" element={<StudentHistory user={user} />} />
                    <Route path="profile" element={<StudentProfile user={user} />} />
                </Route>

                {/* Faculty */}
                <Route path="/faculty" element={
                    <ProtectedRoute user={user} allowedRoles={['faculty']} onLogout={handleLogout}>
                        <FacultyLayout user={user} onLogout={handleLogout} />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<FacultyDashboard user={user} />} />
                    <Route path="selection" element={<FacultyLibrarySelection user={user} />} />
                    <Route path="search" element={<FacultyBookSearch user={user} />} />
                    <Route path="dept-library" element={<FacultyDeptLibrary user={user} />} />
                    <Route path="department" element={<FacultyDeptLibrary user={user} />} />
                    <Route path="issued" element={<FacultyIssuedBooks user={user} />} />
                    <Route path="resources" element={<FacultyDigitalResources user={user} />} />
                    <Route path="fines" element={<FacultyFineManagement user={user} />} />
                    <Route path="requests" element={<FacultyRequests user={user} />} />
                    <Route path="history" element={<FacultyHistory user={user} />} />
                    <Route path="profile" element={<FacultyProfile user={user} />} />
                    <Route path="journals" element={<FacultyJournals user={user} />} />
                </Route>

            </Routes>
        </>
    );
}

export default App;