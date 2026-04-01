-- Database: lms_db
CREATE DATABASE IF NOT EXISTS lms_db;
USE lms_db;

-- Table: admins
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: books
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accession_no VARCHAR(50) NOT NULL UNIQUE,
    isbn VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    author VARCHAR(255),
    publisher VARCHAR(255),
    edition VARCHAR(50),
    year INT,
    department VARCHAR(100),
    subject VARCHAR(100),
    language VARCHAR(50),
    category VARCHAR(100),
    call_number VARCHAR(50),
    shelf_location VARCHAR(100),
    issue_type ENUM('Issuable', 'Reference', 'Overnight') DEFAULT 'Issuable',
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    times_issued INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: students
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(50),
    year ENUM('1', '2', '3', '4'),
    password VARCHAR(255) NOT NULL DEFAULT 'student123',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: faculties
CREATE TABLE IF NOT EXISTS faculties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(50),
    designation VARCHAR(100),
    password VARCHAR(255) NOT NULL DEFAULT 'faculty123',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: issued_books
CREATE TABLE IF NOT EXISTS issued_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    faculty_id INT,
    book_id INT NOT NULL,
    issue_date DATE NOT NULL,
    return_date DATE NOT NULL,
    actual_return_date DATE,
    status ENUM('Issued', 'Returned', 'Overdue') DEFAULT 'Issued',
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (faculty_id) REFERENCES faculties(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Table: fines
CREATE TABLE IF NOT EXISTS fines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('Student', 'Faculty') NOT NULL,
    student_id INT,
    faculty_id INT,
    issue_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (faculty_id) REFERENCES faculties(id),
    FOREIGN KEY (issue_id) REFERENCES issued_books(id)
);

-- Table: attendance
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    type ENUM('IN', 'OUT') NOT NULL,
    scan_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Table: book_requests
CREATE TABLE IF NOT EXISTS book_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    student_id INT,
    faculty_id INT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (faculty_id) REFERENCES faculties(id)
);

-- Sample Admin User (Password: admin123)
-- In a real app, passwords should be hashed.
INSERT INTO admins (username, password, email, full_name) 
VALUES ('admin', 'admin123', 'admin@lms.com', 'System Administrator');
