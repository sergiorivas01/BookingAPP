"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCalendar = generateCalendar;
exports.displayCalendar = displayCalendar;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Generate calendar view for a property showing availability
 */
function generateCalendar(property, reservations, startDate = new Date(), weeks = 4) {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (weeks * 7));
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        const isToday = date.getTime() === today.getTime();
        const isPast = date < today;
        // Find if there's a reservation for this date
        const reservation = reservations.find(res => {
            const resStart = new Date(res.date);
            resStart.setHours(0, 0, 0, 0);
            const resEnd = new Date(res.endDate);
            resEnd.setHours(0, 0, 0, 0);
            return date >= resStart && date < resEnd;
        });
        const isReserved = !!reservation;
        const isAvailable = !isPast && !isReserved && property.availability === 'available';
        days.push({
            date,
            isAvailable,
            isReserved,
            reservation,
            isToday,
            isPast,
        });
    }
    return days;
}
/**
 * Display calendar in console
 */
function displayCalendar(property, reservations, startDate = new Date(), weeks = 4) {
    const days = generateCalendar(property, reservations, startDate, weeks);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    console.log('\n' + chalk_1.default.bold.cyan(`📅 Availability Calendar: ${property.name}`));
    console.log(chalk_1.default.gray(`   Price: $${property.price}/night | Type: ${property.specifications.type || 'N/A'}`));
    console.log('');
    // Group days by month
    const months = {};
    days.forEach(day => {
        const monthKey = `${day.date.getFullYear()}-${day.date.getMonth()}`;
        if (!months[monthKey]) {
            months[monthKey] = [];
        }
        months[monthKey].push(day);
    });
    // Display each month
    Object.keys(months).sort().forEach(monthKey => {
        const monthDays = months[monthKey];
        const firstDay = monthDays[0].date;
        const monthName = monthNames[firstDay.getMonth()];
        const year = firstDay.getFullYear();
        console.log(chalk_1.default.bold.white(`\n${monthName} ${year}`));
        console.log(chalk_1.default.gray('  ' + dayNames.join('  ')));
        // Find first day of week for this month
        const firstDate = new Date(firstDay);
        firstDate.setDate(1);
        const firstDayOfWeek = firstDate.getDay();
        // Print calendar grid
        const weeksInMonth = [];
        let currentWeek = [];
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null);
        }
        monthDays.forEach(day => {
            if (currentWeek.length === 7) {
                weeksInMonth.push(currentWeek);
                currentWeek = [];
            }
            currentWeek.push(day);
        });
        // Fill remaining week
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        if (currentWeek.some(d => d !== null)) {
            weeksInMonth.push(currentWeek);
        }
        // Display weeks
        weeksInMonth.forEach(week => {
            const weekStr = week.map(day => {
                if (!day) {
                    return '   ';
                }
                const dayNum = day.date.getDate().toString().padStart(2, ' ');
                if (day.isPast) {
                    return chalk_1.default.gray(dayNum);
                }
                else if (day.isToday) {
                    return chalk_1.default.bold.yellow(`[${dayNum}]`);
                }
                else if (day.isReserved) {
                    return chalk_1.default.red.bold(dayNum);
                }
                else if (day.isAvailable) {
                    return chalk_1.default.green(dayNum);
                }
                else {
                    return chalk_1.default.gray(dayNum);
                }
            }).join(' ');
            console.log('  ' + weekStr);
        });
    });
    // Legend
    console.log(chalk_1.default.gray('\n  Legend:'));
    console.log(chalk_1.default.green('  Available') + ' | ' + chalk_1.default.red('Reserved') + ' | ' + chalk_1.default.bold.yellow('[Today]') + ' | ' + chalk_1.default.gray('Past/Unavailable'));
    console.log('');
}
//# sourceMappingURL=calendar.js.map