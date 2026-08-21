-- Database: lms_db (schema generated from lms_db.sql)
CREATE DATABASE IF NOT EXISTS lms_db;
USE lms_db;

-- Table: departments
DROP TABLE IF EXISTS `departments`;
CREATE TABLE IF NOT EXISTS `departments` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: publishers
DROP TABLE IF EXISTS `publishers`;
CREATE TABLE IF NOT EXISTS `publishers` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: subjects
DROP TABLE IF EXISTS `subjects`;
CREATE TABLE IF NOT EXISTS `subjects` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: digitalresources
DROP TABLE IF EXISTS `digitalresources`;
CREATE TABLE IF NOT EXISTS `digitalresources` (
    `digital_resource_id` int NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `description` text,
    `resource_type` enum('Journal','E-Book','Research Paper','Video Lecture','Other') DEFAULT 'Research Paper',
    `file_url` varchar(255) DEFAULT NULL,
    `file_path` varchar(255) DEFAULT NULL,
    `uploaded_by_faculty_id` int DEFAULT NULL,
    `approval_status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
    `approved_by_admin_id` int DEFAULT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`digital_resource_id`),
    KEY `uploaded_by_faculty_id` (`uploaded_by_faculty_id`),
    KEY `approved_by_admin_id` (`approved_by_admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: admins
DROP TABLE IF EXISTS `admins`;
CREATE TABLE IF NOT EXISTS `admins` (
    `id` int NOT NULL AUTO_INCREMENT,
    `username` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `full_name` varchar(255) DEFAULT NULL,
    `created_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`),
    UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: books
DROP TABLE IF EXISTS `books`;
CREATE TABLE IF NOT EXISTS `books` (
    `id` int NOT NULL AUTO_INCREMENT,
    `isbn` varchar(20) DEFAULT NULL,
    `title` varchar(255) NOT NULL,
    `subtitle` varchar(255) DEFAULT NULL,
    `author` varchar(255) DEFAULT NULL,
    `publisher` varchar(255) DEFAULT NULL,
    `edition` varchar(255) DEFAULT NULL,
    `year` int DEFAULT NULL,
    `department` varchar(255) DEFAULT NULL,
    `subject` varchar(255) DEFAULT NULL,
    `language` varchar(255) DEFAULT NULL,
    `category` varchar(255) DEFAULT NULL,
    `call_number` varchar(255) DEFAULT NULL,
    `price` decimal(10,2) DEFAULT '0.00',
    `remarks` text,
    `front_page_photo` varchar(255) DEFAULT NULL,
    `content_page_photo` varchar(255) DEFAULT NULL,
    `is_dead` tinyint(1) DEFAULT '0',
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    `publication_place` varchar(255) DEFAULT NULL,
    `indian_edition` tinyint(1) DEFAULT '0',
    `binding_type` varchar(50) DEFAULT NULL,
    `content_pages` int DEFAULT NULL,
    `text_pages` int DEFAULT NULL,
    `vendor` varchar(255) DEFAULT NULL,
    `invoice_number` varchar(255) DEFAULT NULL,
    `fund_source` varchar(50) DEFAULT NULL,
    `purchase_cost` decimal(10,2) DEFAULT NULL,
    `gift_book` tinyint(1) DEFAULT '0',
    `gift_note` text,
    `control_number` varchar(100) DEFAULT NULL,
    `keyword` text,
    `release` varchar(255) DEFAULT NULL,
    `foreign_edition` varchar(100) DEFAULT NULL,
    `library` varchar(255) DEFAULT NULL,
    `purchase_details` text,
    `academic_category` varchar(255) DEFAULT NULL,
    `total_copies` int NOT NULL DEFAULT '0',
    `department_id` int DEFAULT NULL,
    `language_id` int DEFAULT NULL,
    `subject_id` int DEFAULT NULL,
    `publisher_id` int DEFAULT NULL,
    `vendor_id` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_books_department_id` (`department_id`),
    KEY `fk_books_language_id` (`language_id`),
    KEY `fk_books_subject_id` (`subject_id`),
    KEY `fk_books_publisher_id` (`publisher_id`),
    KEY `fk_books_vendor_id` (`vendor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2784 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: issued_books
DROP TABLE IF EXISTS `issued_books`;
CREATE TABLE IF NOT EXISTS `issued_books` (
    `id` int NOT NULL AUTO_INCREMENT,
    `student_id` int DEFAULT NULL,
    `faculty_id` int DEFAULT NULL,
    `book_id` int DEFAULT NULL,
    `copy_id` int DEFAULT NULL,
    `issue_date` date NOT NULL,
    `return_date` date NOT NULL,
    `actual_return_date` date DEFAULT NULL,
    `status` enum('Issued','Returned','Overdue','Lost') DEFAULT 'Issued',
    `renewal_date` date DEFAULT NULL,
    `renewal_count` int DEFAULT '0',
    PRIMARY KEY (`id`),
    KEY `student_id` (`student_id`),
    KEY `faculty_id` (`faculty_id`),
    KEY `book_id` (`book_id`),
    KEY `copy_id` (`copy_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: languages
DROP TABLE IF EXISTS `languages`;
CREATE TABLE IF NOT EXISTS `languages` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: students
DROP TABLE IF EXISTS `students`;
CREATE TABLE IF NOT EXISTS `students` (
    `id` int NOT NULL AUTO_INCREMENT,
    `register_no` varchar(255) NOT NULL,
    `name` varchar(255) NOT NULL,
    `photo` varchar(255) DEFAULT NULL,
    `email` varchar(255) DEFAULT NULL,
    `department` varchar(10) DEFAULT NULL,
    `department_full` varchar(100) DEFAULT NULL,
    `year` int DEFAULT NULL,
    `batch` varchar(255) DEFAULT NULL,
    `gender` enum('Male','Female') DEFAULT 'Female',
    `dob` date DEFAULT NULL,
    `phone` varchar(15) DEFAULT NULL,
    `semester` int DEFAULT '1',
    `admission_date` date DEFAULT NULL,
    `student_id` varchar(255) DEFAULT NULL,
    `status` enum('Active','Inactive') DEFAULT 'Active',
    `password` varchar(255) DEFAULT NULL,
    `is_first_login` tinyint(1) DEFAULT '1',
    `created_at` datetime NOT NULL,
    `category` enum('UG Student','PG Student') DEFAULT 'UG Student',
    PRIMARY KEY (`id`),
    UNIQUE KEY `register_no` (`register_no`),
    UNIQUE KEY `email` (`email`),
    UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=543 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: faculties
DROP TABLE IF EXISTS `faculties`;
CREATE TABLE IF NOT EXISTS `faculties` (
    `id` int NOT NULL AUTO_INCREMENT,
    `faculty_id` varchar(255) NOT NULL,
    `name` varchar(255) NOT NULL,
    `photo` varchar(255) DEFAULT NULL,
    `email` varchar(255) NOT NULL,
    `department` varchar(255) DEFAULT NULL,
    `department_full` varchar(100) DEFAULT NULL,
    `designation` varchar(255) DEFAULT NULL,
    `qualification` varchar(20) DEFAULT NULL,
    `joining_date` date DEFAULT NULL,
    `experience_years` int DEFAULT NULL,
    `specialization` varchar(100) DEFAULT NULL,
    `phone` varchar(15) DEFAULT NULL,
    `gender` enum('Male','Female') DEFAULT 'Male',
    `password` varchar(255) DEFAULT NULL,
    `is_first_login` tinyint(1) DEFAULT '1',
    `created_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `faculty_id` (`faculty_id`),
    UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=772 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: fines
DROP TABLE IF EXISTS `fines`;
CREATE TABLE IF NOT EXISTS `fines` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_type` enum('Student','Faculty') NOT NULL,
    `student_id` int DEFAULT NULL,
    `faculty_id` int DEFAULT NULL,
    `issue_id` int DEFAULT NULL,
    `amount` decimal(10,2) NOT NULL,
    `reason` text,
    `status` enum('Pending','Paid') DEFAULT 'Pending',
    `created_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    KEY `student_id` (`student_id`),
    KEY `faculty_id` (`faculty_id`),
    KEY `issue_id` (`issue_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: book_requests
DROP TABLE IF EXISTS `book_requests`;
CREATE TABLE IF NOT EXISTS `book_requests` (
    `id` int NOT NULL AUTO_INCREMENT,
    `book_id` int DEFAULT NULL,
    `student_id` int DEFAULT NULL,
    `faculty_id` int DEFAULT NULL,
    `request_date` datetime DEFAULT NULL,
    `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
    PRIMARY KEY (`id`),
    KEY `book_id` (`book_id`),
    KEY `student_id` (`student_id`),
    KEY `faculty_id` (`faculty_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: holidays
DROP TABLE IF EXISTS `holidays`;
CREATE TABLE IF NOT EXISTS `holidays` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `date` date NOT NULL,
    `created_at` datetime NOT NULL,
    `updated_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `date` (`date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Constraints for table `books` (foreign keys)
ALTER TABLE `books`
    ADD CONSTRAINT `fk_books_department_id` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_books_language_id` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_books_publisher_id` FOREIGN KEY (`publisher_id`) REFERENCES `publishers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_books_subject_id` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_books_vendor_id` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;


