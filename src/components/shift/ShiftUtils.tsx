export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Completed':
      return 'bg-gray-100 text-gray-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getShiftType = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const startHour = start.getHours();
  const endHour = end.getHours();
  
  // Calculate duration in hours
  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  
  // If shift is longer than 8 hours
  if (duration > 8) {
    return "Long Shift";
  }
  
  // Determine shift type based on start time
  let shiftType = "";
  if (startHour >= 6 && startHour < 12) {
    shiftType = "Morning Shift";
  } else if (startHour >= 12 && startHour < 18) {
    shiftType = "Afternoon Shift";
  } else if (startHour >= 18 && startHour < 22) {
    shiftType = "Evening Shift";
  } else {
    shiftType = "Night Shift";
  }
  
  // Check for overlapping periods
  if (startHour < 12 && endHour >= 12 && endHour < 18) {
    shiftType = "Morning-Afternoon Shift";
  } else if (startHour < 18 && endHour >= 18 && endHour < 22) {
    shiftType = "Afternoon-Evening Shift";
  } else if (startHour < 22 && endHour >= 22) {
    shiftType = "Evening-Night Shift";
  }
  
  return shiftType;
};