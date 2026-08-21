const API_URL = '/api/admin';

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

    const contentType = response.headers.get('content-type') || '';
    let payload = null;

    if (contentType.includes('application/json')) {
        payload = await response.json().catch(() => null);
    } else {
        payload = await response.text().catch(() => '');
    }

    if (!response.ok) {
        const message = payload?.message || payload?.error || (typeof payload === 'string' && payload) || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload ?? {};
};

const adminService = {
    // Dashboard Stats
    getDashboardStats: async () => {
        return request(`${API_URL}/dashboard/stats`);
    },
    getDashboardRequests: async () => {
        return request(`${API_URL}/dashboard/requests`);
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
    exportBooks: async (payload) => {
        return fetch(`${API_URL}/books/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
    },
    getBookByAccession: async (accessionNo) => {
        return request(`${API_URL}/books/accession/${accessionNo}`);
    },
    addCopies: async (id, data) => {
        return request(`${API_URL}/books/${id}/copies`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    getBookCopies: async (id) => {
        return request(`${API_URL}/books/${id}/copies`);
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
    getStudentBatches: async () => {
        return request(`${API_URL}/students/batches`);
    },
    bulkUpdateStudentAcademic: async (data) => {
        return request(`${API_URL}/students/bulk-update-academic`, {
            method: 'PUT',
            body: JSON.stringify(data)
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
    returnBook: async (id, data = {}) => {
        return request(`${API_URL}/issues/${id}/return`, { method: 'PUT', body: JSON.stringify(data) });
    },
    renewBook: async (id, data = {}) => {
        return request(`${API_URL}/issues/${id}/renew`, { method: 'PUT', body: JSON.stringify(data) });
    },
    markBookLost: async (id, data = {}) => {
        return request(`${API_URL}/issues/${id}/lost`, { method: 'PUT', body: JSON.stringify(data) });
    },

    // Fines (Manage Fines)
    getFines: async (params) => {
        return request(`${API_URL}/fines`, { params });
    },
    clearFine: async (id) => {
        return request(`${API_URL}/fines/${id}/clear`, { method: 'PUT' });
    },

    // Sub Entries / master data
    getSubEntries: async (type) => request(`${API_URL}/subentries/${type}`),
    getSubEntry: async (type, id) => request(`${API_URL}/subentries/${type}/${id}`),
    addSubEntry: async (type, data) => request(`${API_URL}/subentries/${type}`, { method: 'POST', body: JSON.stringify(data) }),
    editSubEntry: async (type, id, data) => request(`${API_URL}/subentries/${type}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSubEntry: async (type, id) => request(`${API_URL}/subentries/${type}/${id}`, { method: 'DELETE' }),

    // Profile Photo Upload
    uploadProfilePhoto: async (formData) => {
        const response = await fetch('/api/profile/upload-photo', {
            method: 'POST',
            body: formData
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Upload failed');
        return data;
    }
};

export default adminService;
