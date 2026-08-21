const GOVERNMENT_HOLIDAYS = [
    '01-01', // New Year's Day
    '01-26', // Republic Day
    '04-14', // Ambedkar Jayanti / Tamil New Year
    '05-01', // May Day
    '08-15', // Independence Day
    '10-02', // Gandhi Jayanti
    '12-25', // Christmas
];

function parseLocalDate(dateInput) {
    if (!dateInput) return new Date();
    if (typeof dateInput === 'string') {
        const parts = dateInput.split('T')[0].split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 0, 0, 0, 0);
        }
    }
    const d = new Date(dateInput);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function getOverdueDaysCount(dueDate, returnDate) {
    const start = parseLocalDate(dueDate);
    const end = parseLocalDate(returnDate);
    
    if (end <= start) return 0;
    
    const diffTime = Math.abs(end - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getFineableOverdueDays(dueDate, returnDate, holidays = []) {
    const due = parseLocalDate(dueDate);
    const returned = parseLocalDate(returnDate);
    if (returned <= due) return 0;

    const holidayDates = new Set(holidays.map((holiday) => {
        const value = typeof holiday === 'object' ? holiday.date : holiday;
        const date = parseLocalDate(value);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }));

    let fineableDays = 0;
    const cursor = new Date(due);
    cursor.setDate(cursor.getDate() + 1);
    while (cursor <= returned) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
        if (!holidayDates.has(key)) fineableDays += 1;
        cursor.setDate(cursor.getDate() + 1);
    }
    return fineableDays;
}

module.exports = {
    GOVERNMENT_HOLIDAYS,
    getOverdueDaysCount,
    getFineableOverdueDays,
    parseLocalDate
};
