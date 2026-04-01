const { Book, Student, Faculty, Issue, Fine, Request, Attendance, sequelize } = require('../models/admin/adminModels');

async function seedData() {
    try {
        await sequelize.sync({ force: false }); // Don't wipe everything, just add
        console.log('Seeding data...');

        // 1. Students
        const students = await Student.bulkCreate([
            { rollNo: 'CS001', name: 'Arjun Das', email: 'arjun@example.com', department: 'CSE', year: '3' },
            { rollNo: 'IT002', name: 'Meera Nair', email: 'meera@example.com', department: 'IT', year: '2' },
            { rollNo: 'EC003', name: 'Sanjay Kumar', email: 'sanjay@example.com', department: 'ECE', year: '4' },
            { rollNo: 'CS004', name: 'Priya Dharshini', email: 'priya@example.com', department: 'CSE', year: '1' }
        ], { ignoreDuplicates: true });

        // 2. Faculty
        const faculties = await Faculty.bulkCreate([
            { employeeId: 'FAC001', name: 'Dr. Sam', email: 'sam@example.com', department: 'CSE', designation: 'Professor' },
            { employeeId: 'FAC002', name: 'Mrs. Anitha', email: 'anitha@example.com', department: 'IT', designation: 'Asst. Professor' }
        ], { ignoreDuplicates: true });

        // 3. Books
        const books = await Book.bulkCreate([
            { accessionNo: 'B001', title: 'The Lean Startup', author: 'Eric Ries', department: 'Management', totalCopies: 5, availableCopies: 4, category: 'Business' },
            { accessionNo: 'B002', title: 'Clean Code', author: 'Robert C. Martin', department: 'CSE', totalCopies: 3, availableCopies: 2, category: 'Programming' },
            { accessionNo: 'B003', title: 'Refactoring', author: 'Martin Fowler', department: 'CSE', totalCopies: 2, availableCopies: 0, category: 'Software Engineering' },
            { accessionNo: 'B004', title: 'Pragmatic Programmer', author: 'Andrew Hunt', department: 'CSE', totalCopies: 4, availableCopies: 3, category: 'Computer Science' },
            { accessionNo: 'B005', title: 'Introduction to Algorithms', author: 'CLRS', department: 'CSE', totalCopies: 10, availableCopies: 10, category: 'Core' }
        ], { ignoreDuplicates: true });

        // 4. Issues (Transactions)
        const b3 = await Book.findOne({ where: { accessionNo: 'B003' } });
        const s1 = await Student.findOne({ where: { rollNo: 'CS001' } });
        const f1 = await Faculty.findOne({ where: { employeeId: 'FAC001' } });

        // Overdue Issue for Dr. Sam (Refactoring book)
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 20);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() - 6);

        await Issue.create({
            bookId: b3.id,
            facultyId: f1.id,
            userType: 'Faculty',
            issueDate: pastDate,
            returnDate: dueDate,
            status: 'Overdue'
        });

        // 5. Fines
        await Fine.create({
            userType: 'Faculty',
            facultyId: f1.id,
            amount: 150.00,
            reason: 'Lost book',
            status: 'Paid'
        });

        await Fine.create({
            userType: 'Student',
            studentId: s1.id,
            amount: 70.00,
            reason: 'Late Return - 7 days',
            status: 'Unpaid'
        });

        // 6. Requests
        await Request.bulkCreate([
            { bookId: b3.id, studentId: s1.id, status: 'Pending', requestDate: new Date() },
            { bookId: books[0].id, studentId: students[1].id, status: 'Pending', requestDate: new Date(new Date().setDate(new Date().getDate() - 1)) },
            { bookId: books[1].id, studentId: students[2].id, status: 'Pending', requestDate: new Date(new Date().setDate(new Date().getDate() - 2)) },
            { bookId: books[4].id, facultyId: f1.id, userType: 'Faculty', status: 'Pending', requestDate: new Date() }
        ], { ignoreDuplicates: true });

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        process.exit();
    }
}

seedData();
