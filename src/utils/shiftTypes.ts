
// Shift type definitions for the application
export const SHIFT_TYPES = {
  MORNING: 'Morning Shift',
  EVENING: 'Evening Shift',
  NIGHT: 'Night Shift',
  AFTERNOON: 'Afternoon Shift',
  MORNING_AFTERNOON: 'Morning-Afternoon Shift',
  AFTERNOON_EVENING: 'Afternoon-Evening Shift',
  EVENING_NIGHT: 'Evening-Night Shift',
  LONG_SHIFT: 'Long Shift'
} as const;

export type ShiftType = keyof typeof SHIFT_TYPES;

// Get the display name for a shift type
export const getShiftTypeDisplayName = (type: ShiftType): string => {
  return SHIFT_TYPES[type];
};

// Get shift type from display name
export const getShiftTypeFromDisplayName = (displayName: string): ShiftType | undefined => {
  const entry = Object.entries(SHIFT_TYPES).find(([_, value]) => value === displayName);
  return entry ? entry[0] as ShiftType : undefined;
};

// Get default hours for each shift type
export const getDefaultShiftHours = (type: ShiftType): { start: string; end: string } => {
  switch (type) {
    case 'MORNING':
      return { start: '06:00', end: '14:00' };
    case 'AFTERNOON':
      return { start: '12:00', end: '20:00' };
    case 'EVENING':
      return { start: '16:00', end: '00:00' };
    case 'NIGHT':
      return { start: '22:00', end: '06:00' };
    case 'MORNING_AFTERNOON':
      return { start: '08:00', end: '16:00' };
    case 'AFTERNOON_EVENING':
      return { start: '14:00', end: '22:00' };
    case 'EVENING_NIGHT':
      return { start: '18:00', end: '02:00' };
    case 'LONG_SHIFT':
      return { start: '08:00', end: '20:00' };
    default:
      return { start: '09:00', end: '17:00' };
  }
};

// Get color for each shift type
export const getShiftTypeColor = (type: ShiftType): string => {
  switch (type) {
    case 'MORNING':
      return 'blue';
    case 'AFTERNOON':
      return 'green';
    case 'EVENING':
      return 'purple';
    case 'NIGHT':
      return 'slate';
    case 'MORNING_AFTERNOON':
      return 'teal';
    case 'AFTERNOON_EVENING':
      return 'amber';
    case 'EVENING_NIGHT':
      return 'indigo';
    case 'LONG_SHIFT':
      return 'rose';
    default:
      return 'gray';
  }
};
