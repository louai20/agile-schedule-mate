import { isSameDay } from 'date-fns';
import { ScheduleItem, ShiftType } from './ScheduleCalendar';

export function getShiftsForDay(day: Date, scheduleItems: ScheduleItem[], pendingSchedule: ScheduleItem[], generatedSchedule: boolean, selectedEmployee: string) {
  return [...scheduleItems, ...(generatedSchedule ? pendingSchedule : [])].filter(item => {
    const matchesEmployee = selectedEmployee === 'all' || item.employees.includes(selectedEmployee);
    const matchesDate = isSameDay(item.date, day);
    return matchesDate && matchesEmployee;
  });
}

// Move other utility functions here similarly...