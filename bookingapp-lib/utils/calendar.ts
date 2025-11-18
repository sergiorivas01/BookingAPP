/**
 * Calendar utility for displaying property availability
 */
import { Reservation } from '../models/Reservation';
import { Property } from '../Properties/Property';
import chalk from 'chalk';

export interface CalendarDay {
  date: Date;
  isAvailable: boolean;
  isReserved: boolean;
  reservation?: Reservation;
  isToday: boolean;
  isPast: boolean;
}

/**
 * Generate calendar view for a property showing availability
 */
export function generateCalendar(
  property: Property,
  reservations: Reservation[],
  startDate: Date = new Date(),
  weeks: number = 4
): CalendarDay[] {
  const days: CalendarDay[] = [];
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
export function displayCalendar(
  property: Property,
  reservations: Reservation[],
  startDate: Date = new Date(),
  weeks: number = 4
): void {
  const days = generateCalendar(property, reservations, startDate, weeks);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  console.log('\n' + chalk.bold.cyan(`📅 Availability Calendar: ${property.name}`));
  console.log(chalk.gray(`   Price: $${property.price}/night | Type: ${property.specifications.type || 'N/A'}`));
  console.log('');
  
  // Group days by month
  const months: { [key: string]: CalendarDay[] } = {};
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
    
    console.log(chalk.bold.white(`\n${monthName} ${year}`));
    console.log(chalk.gray('  ' + dayNames.join('  ')));
    
    // Find first day of week for this month
    const firstDate = new Date(firstDay);
    firstDate.setDate(1);
    const firstDayOfWeek = firstDate.getDay();
    
    // Print calendar grid
    const weeksInMonth: CalendarDay[][] = [];
    let currentWeek: (CalendarDay | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    monthDays.forEach(day => {
      if (currentWeek.length === 7) {
        weeksInMonth.push(currentWeek as CalendarDay[]);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    
    // Fill remaining week
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.some(d => d !== null)) {
      weeksInMonth.push(currentWeek as CalendarDay[]);
    }
    
    // Display weeks
    weeksInMonth.forEach(week => {
      const weekStr = week.map(day => {
        if (!day) {
          return '   ';
        }
        const dayNum = day.date.getDate().toString().padStart(2, ' ');
        if (day.isPast) {
          return chalk.gray(dayNum);
        } else if (day.isToday) {
          return chalk.bold.yellow(`[${dayNum}]`);
        } else if (day.isReserved) {
          return chalk.red.bold(dayNum);
        } else if (day.isAvailable) {
          return chalk.green(dayNum);
        } else {
          return chalk.gray(dayNum);
        }
      }).join(' ');
      console.log('  ' + weekStr);
    });
  });
  
  // Legend
  console.log(chalk.gray('\n  Legend:'));
  console.log(chalk.green('  Available') + ' | ' + chalk.red('Reserved') + ' | ' + chalk.bold.yellow('[Today]') + ' | ' + chalk.gray('Past/Unavailable'));
  console.log('');
}

