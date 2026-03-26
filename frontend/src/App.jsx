import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBooks from "./pages/admin/ManageBooks";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageFaculties from "./pages/admin/ManageFaculties";
import ManageIssues from "./pages/admin/ManageIssues";
import StudentAttendance from "./pages/admin/StudentAttendance";
import ManageFines from "./pages/admin/ManageFines";

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

function App() {
    return (
        <Routes>

            {/* Auth */}
            <Route path="/" element={<Login />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="books" element={<ManageBooks />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="faculties" element={<ManageFaculties />} />
                <Route path="issues" element={<ManageIssues />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="fines" element={<ManageFines />} />
            </Route>

            {/* Student */}
            <Route path="/student" element={<StudentLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="selection" element={<StudentLibrarySelection />} />
                <Route path="search" element={<StudentBookSearch />} />
                <Route path="dept-library" element={<StudentDeptLibrary />} />
                <Route path="issued" element={<StudentIssuedBooks />} />
                <Route path="resources" element={<StudentDigitalResources />} />
                <Route path="fines" element={<StudentFineManagement />} />
                <Route path="requests" element={<StudentRequests />} />
                <Route path="history" element={<StudentHistory />} />
                <Route path="profile" element={<StudentProfile />} />
            </Route>

            {/* Faculty */}
            <Route path="/faculty" element={<FacultyLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<FacultyDashboard />} />
                <Route path="selection" element={<FacultyLibrarySelection />} />
                <Route path="search" element={<FacultyBookSearch />} />
                <Route path="dept-library" element={<FacultyDeptLibrary />} />
                <Route path="issued" element={<FacultyIssuedBooks />} />
                <Route path="resources" element={<FacultyDigitalResources />} />
                <Route path="fines" element={<FacultyFineManagement />} />
                <Route path="requests" element={<FacultyRequests />} />
                <Route path="history" element={<FacultyHistory />} />
                <Route path="profile" element={<FacultyProfile />} />
                <Route path="journals" element={<FacultyJournals />} />
            </Route>

        </Routes>
    );
}

export default App;