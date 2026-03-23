import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBooks from "./pages/admin/ManageBooks";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageFaculties from "./pages/admin/ManageFaculties";
import ManageIssues from "./pages/admin/ManageIssues";
import AdminLayout from "./pages/admin/AdminLayout";
import StudentAttendance from "./pages/admin/StudentAttendance";
import ManageFines from "./pages/admin/ManageFines";


function App() {
    return (
        <Routes>

            <Route path="/" element={<Login />} />

            <Route path="/admin" element={<AdminLayout />}>

                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="books" element={<ManageBooks />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="faculties" element={<ManageFaculties />} />
                <Route path="issues" element={<ManageIssues />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="fines" element={<ManageFines />} />

            </Route>

        </Routes>
    );
}

export default App;