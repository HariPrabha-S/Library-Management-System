# Library Management System (LMS)

A comprehensive, full-stack web application designed to streamline library operations for academic institutions. This system provides advanced tools for librarians to manage inventory and circulation, while offering students and faculty a rich portal to search, reserve, and track library resources.

---

## 🚀 Key Features

### 🔐 Authentication & Roles
- **Role Access**: Secure, role-based login tailored for Students/Faculty (Members) and Librarians (Admin).
- **JWT Authentication**: Token-based security ensuring safe API access.

### 📚 Catalog & Inventory Management
- **Centralized Book Catalog**: Add, update, and track books with metadata (ISBN, Subject, Category, Semester).
- **Physical Copy Tracking**: Manage individual book copies (accession numbers) and their exact shelf locations.
- **Master Entries**: Manage underlying lookup data like Departments, Subjects, Vendors, Publishers, and Languages.
- **Bulk Import**: Quickly populate the catalog by uploading bulk records.

### 🔄 Circulation & Transactions
- **Issue & Return**: Seamlessly issue books to members and process returns.
- **Renewals**: Allow extensions on book due dates.
- **Overdue Management**: Track overdue books dynamically based on actual due dates.
- **Fine Calculation**: Automated fine calculation utilizing dynamic rules, taking into account configured database holidays and grace periods.
- **Lost Books**: Mark copies as lost and automatically generate appropriate penalties/fines.

### 📅 Reservations & Requests
- **OPAC Search (Online Public Access Catalog)**: Members can search the catalog by title, author, or ISBN in real-time.
- **Queue-based Reservations**: Members can place holds on unavailable books. The system uses a FIFO (First-In, First-Out) queue.
- **Automated Pickup Processing**: When a book is returned, it is automatically assigned to the next member in the reservation queue.
- **Notifications**: Members are notified when a reserved book is ready for pickup.

### 💻 Digital Resources
- **Resource Repository**: Catalog and share eBooks, eJournals, and study materials.
- **Faculty Uploads**: Faculty members can upload resources which can be approved and published by the library admin.

### 👥 User Management
- **Student & Faculty Profiles**: Manage comprehensive profiles, including academic details (Roll No, Department, Batch, Semester).
- **Borrowing History**: Users can view their active issues, past returns, and pending fines.
- **Bulk Upload**: Import student/faculty records in bulk via CSV/Excel.

### 📊 Dashboards & Reporting
- **Admin Dashboard**: At-a-glance metrics for total books, issued books, available inventory, overdue counts, and pending requests.
- **Member Dashboard**: Personalized view of current borrowings, upcoming due dates, fines, and recent activity.
- **Printable Reports**: Generate and print detailed audit reports for inventory, fines, and student records.

### ⚙️ System Settings
- **Holiday Configuration**: Define library holidays in the database, which automatically integrate with the fine calculation engine.
- **Policy Settings**: Manage rules like maximum borrow limits, fine amounts, and checkout durations.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, React Router v6, Tailwind CSS, Lucide React (Icons), Vite
- **Backend**: Node.js, Express.js
- **Database**: MySQL, Sequelize ORM

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server

### 1. Database Setup
Ensure you have a MySQL server running and create a blank database (e.g., `library_db`). The system (Sequelize) will automatically sync and create the required tables upon starting.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure your environment variables in `.env`:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=library_db
   DB_USER=root
   DB_PASS=your_password
   ```
5. Start the backend server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

---

## 📂 Project Structure

```
Library-Management-System/
├── backend/                  # Node.js & Express API
│   ├── config/               # Database and environment configs
│   ├── controllers/          # Business logic and request handlers (Admin & Public)
│   ├── middleware/           # Auth and error handling middlewares
│   ├── models/               # Sequelize Database Models (Book, Issue, User, Fine, etc.)
│   ├── routes/               # Express API route definitions
│   ├── utils/                # Helper functions (Fines, Reports, Bulk Uploads)
│   ├── uploads/              # Storage for uploaded files/resources
│   └── server.js             # Main application entry point
│
└── frontend/                 # React Frontend
    ├── src/
    │   ├── assets/           # Static images and icons
    │   ├── components/       # Shared UI components (Modals, Tables, Alerts)
    │   ├── pages/
    │   │   ├── admin/        # Admin portal (Manage Issues, Books, Users, Settings)
    │   │   ├── Student/      # Member portal (Dashboard, OPAC Search, Profile)
    │   │   └── Auth/         # Login and authentication views
    │   ├── services/         # Axios API clients for backend communication
    │   ├── utils/            # Frontend helpers (Formatters, Validators)
    │   ├── App.jsx           # Main router configuration
    │   └── main.jsx          # React DOM entry point
    ├── tailwind.config.js    # Tailwind styling configuration
    └── package.json          # Frontend dependencies
```

---

## 🤝 Contributing
Contributions are always welcome! Feel free to fork the repository, create a feature branch, and submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
