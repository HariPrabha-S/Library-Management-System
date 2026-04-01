const API_URL = 'http://localhost:5000/api/admin';

const request = async (url, options = {}) => {
    const { params, ...rest } = options;
    let fullUrl = url;

    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, value);
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            fullUrl += `?${queryString}`;
        }
    }

    const response = await fetch(fullUrl, {
        ...rest,
        headers: {
            'Content-Type': 'application/json',
            ...rest.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
};

const adminService = {
    // Dashboard Stats
    getDashboardStats: async () => {
        return request(`${API_URL}/dashboard/stats`);
    },
    getOverdueQueue: async () => {
        return request(`${API_URL}/dashboard/overdue`);
    },
    getDashboardRequests: async () => {
        return request(`${API_URL}/dashboard/requests`);
    },
    getDashboardRecent: async () => {
        return request(`${API_URL}/dashboard/recent`);
    },

    // Books Module
    getBooks: async (params) => {
        return request(`${API_URL}/books`, { params });
    },
    addBook: async (data) => {
        return request(`${API_URL}/books`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    editBook: async (id, data) => {
        return request(`${API_URL}/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    deleteBook: async (id) => {
        return request(`${API_URL}/books/${id}`, { method: 'DELETE' });
    },
    bulkDeleteBooks: async (ids) => {
        return request(`${API_URL}/books/bulk`, {
            method: 'DELETE',
            body: JSON.stringify({ ids })
        });
    },
    bulkUploadBooks: async (booksData) => {
        return request(`${API_URL}/books/bulk-upload`, {
            method: 'POST',
            body: JSON.stringify({ books: booksData })
        });
    },

    // Students Module 
    getStudents: async (params) => {
        return request(`${API_URL}/students`, { params });
    },
    addStudent: async (data) => {
        return request(`${API_URL}/students`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    editStudent: async (id, data) => {
        return request(`${API_URL}/students/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    deleteStudent: async (id) => {
        return request(`${API_URL}/students/${id}`, { method: 'DELETE' });
    },
    bulkDeleteStudents: async (ids) => {
        return request(`${API_URL}/students/bulk`, {
            method: 'DELETE',
            body: JSON.stringify({ ids })
        });
    },
    bulkUploadStudents: async (studentsData) => {
        return request(`${API_URL}/students/bulk-upload`, {
            method: 'POST',
            body: JSON.stringify({ students: studentsData })
        });
    },

    // Faculty Module
    getFaculties: async (params) => {
        return request(`${API_URL}/faculties`, { params });
    },
    addFaculty: async (data) => {
        return request(`${API_URL}/faculties`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    editFaculty: async (id, data) => {
        return request(`${API_URL}/faculties/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    deleteFaculty: async (id) => {
        return request(`${API_URL}/faculties/${id}`, { method: 'DELETE' });
    },
    bulkDeleteFaculties: async (ids) => {
        return request(`${API_URL}/faculties/bulk`, {
            method: 'DELETE',
            body: JSON.stringify({ ids })
        });
    },
    bulkUploadFaculties: async (facultyData) => {
        return request(`${API_URL}/faculties/bulk-upload`, {
            method: 'POST',
            body: JSON.stringify({ faculties: facultyData })
        });
    },

    // Requests (e.g. from Dashboard)
    getRequests: async (params) => {
        return request(`${API_URL}/requests`, { params });
    },
    approveRequest: async (id) => {
        return request(`${API_URL}/requests/approve/${id}`, { method: 'POST' });
    },
    rejectRequest: async (id) => {
        return request(`${API_URL}/requests/reject/${id}`, { method: 'POST' });
    },
    revertRequest: async (id) => {
        return request(`${API_URL}/requests/revert/${id}`, { method: 'POST' });
    },

    // Issues / Records Module
    getIssues: async (params) => {
        return request(`${API_URL}/issues`, { params });
    },
    issueBook: async (data) => {
        return request(`${API_URL}/issues`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    returnBook: async (id) => {
        return request(`${API_URL}/issues/${id}/return`, { method: 'PUT' });
    },
    revertReturn: async (id) => {
        return request(`${API_URL}/issues/${id}/revert`, { method: 'PUT' });
    },

    // Fines (Manage Fines)
    getFines: async (params) => {
        return request(`${API_URL}/fines`, { params });
    },
    clearFine: async (id) => {
        return request(`${API_URL}/fines/${id}/clear`, { method: 'PUT' });
    },
    revertFine: async (id) => {
        return request(`${API_URL}/fines/${id}/revert`, { method: 'PUT' });
    }
};

export default adminService;
