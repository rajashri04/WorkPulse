export const TODAY_DATE = '2026-10-19';

export function getTodayDateString(): string {
  return TODAY_DATE;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateRange(startDate: string, endDate: string, isHalfDay?: boolean, halfDayPeriod?: 'AM' | 'PM'): string {
  if (!startDate) return '';
  if (isHalfDay) {
    return `${formatDisplayDate(startDate)} (${halfDayPeriod === 'AM' ? 'First Half (AM)' : 'Second Half (PM)'})`;
  }
  if (startDate === endDate) {
    return formatDisplayDate(startDate);
  }
  return `${formatShortDate(startDate)} – ${formatDisplayDate(endDate)}`;
}

/**
 * Calculates number of working business days between two dates inclusive (skipping Sat & Sun).
 */
export function calculateBusinessDays(startDateStr: string, endDateStr: string, isHalfDay?: boolean): number {
  if (!startDateStr || !endDateStr) return 0;
  if (isHalfDay) return 0.5;

  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const [ey, em, ed] = endDateStr.split('-').map(Number);

  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  if (start > end) return 0;

  let count = 0;
  const cur = new Date(start.getTime());

  while (cur <= end) {
    const dayOfWeek = cur.getDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return Math.max(1, count);
}

export function isDateInRange(targetDateStr: string, startDateStr: string, endDateStr: string): boolean {
  return targetDateStr >= startDateStr && targetDateStr <= endDateStr;
}

export interface CalendarDay {
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export function generateMonthCalendar(year: number, monthIndex: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInCurrentMonth = lastDayOfMonth.getDate();

  // Days from previous month
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDayNum = prevMonthLastDay - i;
    const prevDate = new Date(year, monthIndex - 1, prevDayNum);
    const dateString = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDayNum).padStart(2, '0')}`;
    const dayOfWeek = prevDate.getDay();
    days.push({
      dateString,
      dayNumber: prevDayNum,
      isCurrentMonth: false,
      isToday: dateString === TODAY_DATE,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // Days of current month
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(year, monthIndex, day);
    const dayOfWeek = date.getDay();
    days.push({
      dateString,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateString === TODAY_DATE,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // Days from next month to round out to 35 or 42 grid slots
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, monthIndex + 1, i);
    const dateString = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayOfWeek = nextDate.getDay();
    days.push({
      dateString,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateString === TODAY_DATE,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  return days;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
