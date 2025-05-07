import React, { useState, useEffect, useRef } from 'react';
import { CalendarPlus, AlertCircle, CheckCircle, ArrowLeft, GripVertical, Info, Trash2, UserPlus, Users, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Clock, Printer } from 'lucide-react';
import { AddShiftDialog } from './ScheduleDialogs';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameDay, parseISO, setHours, setMinutes, startOfWeek, endOfWeek, addWeeks, isSameMonth } from 'date-fns';
import { getShiftsForDay } from './ScheduleCalendarUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { SHIFT_TYPES, ShiftType, getShiftTypeColor, getDefaultShiftHours, getShiftTypeDisplayName } from '@/utils/shiftTypes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiService } from '@/services/api.service'; // Import ApiService

interface ScheduleCalendarProps {
  selectedEmployees: any[];
  selectedShifts: any[];
}

interface ScheduleItem {
  id: string;
  title: string;
  employees: string[];
  date: Date;
  color: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
}

// Define polling interval (e.g., 1 seconds)
const POLLING_INTERVAL_MS = 1000;
// Define a maximum number of polling attempts to prevent infinite loops
const MAX_POLLING_ATTEMPTS = 30; // e.g., 30 attempts * 2 seconds = 1 minute timeout

const ScheduleCalendar = ({ selectedEmployees, selectedShifts }: ScheduleCalendarProps) => {
  // Log the received props when they change
  useEffect(() => {
    console.log("ScheduleCalendar received props:", {
      employees: selectedEmployees,
      shifts: selectedShifts,
    });
  }, [selectedEmployees, selectedShifts]); // Dependency array ensures this runs when props change

  const hasEnoughData = selectedEmployees.length > 0 && selectedShifts.length > 0;
  const printRef = useRef<HTMLDivElement>(null);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [calendarWeeks, setCalendarWeeks] = useState<Date[][]>([]);
  
  // Schedule items state
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [pendingSchedule, setPendingSchedule] = useState<ScheduleItem[]>([]);
  const [generatedSchedule, setGeneratedSchedule] = useState(false);
  const [isSolving, setIsSolving] = useState(false); // Ensure this line exists and is correct
  const [pollingAttempts, setPollingAttempts] = useState(0); // State to track polling attempts

  // Filter state
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  
  // Dialog state
  const [draggedItem, setDraggedItem] = useState<ScheduleItem | null>(null);
  const [selectedShift, setSelectedShift] = useState<ScheduleItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [employeeToAdd, setEmployeeToAdd] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [employeeToPrint, setEmployeeToPrint] = useState<string>('');
  
  // New shift state
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType>('MORNING');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  
  // Initialize calendar days and weeks
  useEffect(() => {
    // Get all days of the month
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    setCalendarDays(days);
    
    // Generate 4 weeks starting from the first day of the month
    // Make sure to include days from previous/next month to fill the week
    const firstDayOfMonth = startOfMonth(currentMonth);
    const startOfFirstWeek = startOfWeek(firstDayOfMonth);
    
    const weeks: Date[][] = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = i === 0 ? startOfFirstWeek : addWeeks(startOfFirstWeek, i);
      const weekEnd = endOfWeek(weekStart);
      const week = eachDayOfInterval({ start: weekStart, end: weekEnd });
      weeks.push(week);
    }
    
    setCalendarWeeks(weeks);
  }, [currentMonth]);
  
  // Update time based on shift type selection
  useEffect(() => {
    if (selectedShiftType) {
      const defaultHours = getDefaultShiftHours(selectedShiftType);
      setStartTime(defaultHours.start);
      setEndTime(defaultHours.end);
    }
  }, [selectedShiftType]);
  
  // Navigate between months
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Handle shift assignment
  const handleDayClick = (day: Date) => {
    if (!hasEnoughData) return;
    
    setClickedDate(day);
    setEmployeeToAdd(''); // Reset employee selection
    setSelectedShiftType('MORNING'); // Default shift type
    const defaultHours = getDefaultShiftHours('MORNING');
    setStartTime(defaultHours.start);
    setEndTime(defaultHours.end);
    setAddShiftDialogOpen(true);
  };

  // Drag and drop handlers
  const handleDragStart = (item: ScheduleItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: Date) => {
    e.preventDefault();
    if (draggedItem) {
      const updatedItems = scheduleItems.map(item => 
        item.id === draggedItem.id ? {...item, date: day} : item
      );
      setScheduleItems(updatedItems);
      setDraggedItem(null);
      toast.success(`Shift moved to ${format(day, 'MMMM d, yyyy')}`);
    }
  };

  // Handler for shift click to show details
  const handleShiftClick = (shift: ScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the day click
    setSelectedShift(shift);
    setEmployeeToAdd(''); // Reset selected employee
    setDialogOpen(true);
  };

  // Handle adding an employee to a shift
  const handleAddEmployee = () => {
    if (selectedShift && employeeToAdd && !selectedShift.employees.includes(employeeToAdd)) {
      const updatedItems = scheduleItems.map(item => 
        item.id === selectedShift.id 
          ? {...item, employees: [...item.employees, employeeToAdd]} 
          : item
      );
      setScheduleItems(updatedItems);
      setSelectedShift({...selectedShift, employees: [...selectedShift.employees, employeeToAdd]});
      toast.success(`${employeeToAdd} added to ${selectedShift.title}`);
      setEmployeeToAdd(''); // Reset selection
    }
  };

  // Handle removing an employee from a shift
  const handleRemoveEmployee = (employeeName: string) => {
    if (selectedShift) {
      const updatedEmployees = selectedShift.employees.filter(e => e !== employeeName);
      const updatedItems = scheduleItems.map(item => 
        item.id === selectedShift.id 
          ? {...item, employees: updatedEmployees} 
          : item
      );
      setScheduleItems(updatedItems);
      setSelectedShift({...selectedShift, employees: updatedEmployees});
      toast.success(`${employeeName} removed from ${selectedShift.title}`);
    }
  };

  // Handle deleting a shift
  const handleDeleteShift = () => {
    if (selectedShift) {
      const updatedItems = scheduleItems.filter(item => item.id !== selectedShift.id);
      setScheduleItems(updatedItems);
      setDeleteDialogOpen(false);
      setDialogOpen(false);
      toast.success(`${selectedShift.title} has been removed from the schedule`);
    }
  };

  // Add a new shift
  const handleAddShift = () => {
    if (clickedDate && selectedShiftType && employeeToAdd && startTime && endTime) {
      const newShift: ScheduleItem = {
        id: Date.now().toString(),
        title: getShiftTypeDisplayName(selectedShiftType),
        employees: [employeeToAdd],
        date: clickedDate,
        color: getShiftTypeColor(selectedShiftType),
        shiftType: selectedShiftType,
        startTime,
        endTime
      };
      
      setScheduleItems([...scheduleItems, newShift]);
      setAddShiftDialogOpen(false);
      toast.success(`New ${newShift.title} added on ${format(clickedDate, 'MMMM d, yyyy')}`);
    } else {
      if (!employeeToAdd) {
        toast.error("Please select an employee for this shift");
      }
    }
  };

  // Function to process the final schedule result
  const processScheduleResult = (result: any) => {
    if (result && result.solverStatus === "NOT_SOLVING") {
      setGeneratedSchedule(true);
      setIsSolving(false);
      return;
    }
    if (result && Array.isArray(result.assignments)) {
      const newShifts: ScheduleItem[] = result.assignments.map((assignment: any) => {
        const originalShift = selectedShifts.find(s => s.ShiftID === assignment.shiftId);
        if (!originalShift) {
          console.warn(`Original shift not found for assignment with shiftId: ${assignment.shiftId}`);
          return null;
        }
        let shiftType: ShiftType = 'MORNING';
        if (originalShift.StartTime) {
            try {
                const startHour = parseISO(originalShift.StartTime).getHours();
                if (startHour >= 12 && startHour < 18) shiftType = 'AFTERNOON';
                else if (startHour >= 18 || startHour < 6) shiftType = 'NIGHT';
            } catch (parseError) {
                console.error("Error parsing shift StartTime:", originalShift.StartTime, parseError);
            }
        } else {
             console.warn(`Shift with ID ${assignment.shiftId} has no StartTime.`);
        }

        const color = getShiftTypeColor(shiftType);
        const title = getShiftTypeDisplayName(shiftType);
        return {
          id: `${assignment.shiftId}-${assignment.employeeName}`,
          title: title,
          employees: [assignment.employeeName],
          date: originalShift.StartTime ? parseISO(originalShift.StartTime) : new Date(),
          color: color,
          shiftType: shiftType,
          startTime: originalShift.StartTime ? format(parseISO(originalShift.StartTime), 'HH:mm') : 'N/A',
          endTime: originalShift.EndTime ? format(parseISO(originalShift.EndTime), 'HH:mm') : 'N/A'
        };
      }).filter((item: ScheduleItem | null): item is ScheduleItem => item !== null);

      setScheduleItems(prev => [...prev, ...newShifts]);
      setGeneratedSchedule(true);
      toast.success('Optimal schedule generated and added to calendar!');
    } else {
      console.error("Unexpected response structure from Timefold:", result);
      toast.error("Received unexpected data from the schedule solver.");
      setPendingSchedule([]);
      setGeneratedSchedule(false);
    }
  };

  // Polling function to check schedule status
  const pollForResult = async (scheduleId: string, attempt: number) => {
    console.log(`Polling for schedule ${scheduleId}, attempt ${attempt + 1}`);

    if (attempt >= MAX_POLLING_ATTEMPTS) {
        toast.error("Schedule generation timed out. Please try again later.");
        setIsSolving(false);
        return;
    }

    try {
        const result = await ApiService.getScheduleResult(scheduleId);

        // Check if the score object is feasible
        if (result.score && result.score.feasible === false) {
            toast.error("The schedule is not feasible. No shifts will be added to the calendar.");
            // Continue polling but do not add shifts
            if (result.solverStatus === "SOLVING_ACTIVE") {
                console.log(`Solver is still running (Status: ${result.solverStatus}). Polling again soon...`);
                setTimeout(() => pollForResult(scheduleId, attempt + 1), POLLING_INTERVAL_MS);
            }
            return; // Exit early from adding shifts
        }

        const newShifts: ScheduleItem[] = result.shifts.map((shift: any) => {
            if (!shift.employee) {
                console.warn(`Shift with ID ${shift.id} has no employee assigned.`);
                return null; // Skip shifts without employees
            }
            return {
                id: shift.id,
                title: shift.shiftType,
                employees: [shift.employee.name], // Assuming each shift has one employee
                date: parseISO(shift.start),
                color: getShiftTypeColor(shift.shiftType),
                shiftType: shift.shiftType,
                startTime: format(parseISO(shift.start), 'HH:mm'),
                endTime: format(parseISO(shift.end), 'HH:mm'),
            };
        }).filter((item: ScheduleItem | null): item is ScheduleItem => item !== null);

        // Update existing schedule items or add new ones
        setScheduleItems(prevItems => {
            const updatedItems = prevItems.filter(item => !newShifts.some(newShift => newShift.id === item.id));
            return [...updatedItems, ...newShifts];
        });

        if (result.solverStatus === "NOT_SOLVING") {
            toast.success("Solving is completed");
            console.log("Solver finished. Processing results:", result);
            processScheduleResult(result);
            setIsSolving(false);
        } else if (result.solverStatus === "SOLVING_ACTIVE") {
            console.log(`Solver is still running (Status: ${result.solverStatus}). Polling again soon...`);
            setTimeout(() => pollForResult(scheduleId, attempt + 1), POLLING_INTERVAL_MS);
        } else {
            const unknownStatus = result.solverStatus || "UNKNOWN";
            console.warn(`Unknown solver status received: ${unknownStatus}`);
            toast.warning(`Received unexpected status: ${unknownStatus}. Continuing to check...`);
            setTimeout(() => pollForResult(scheduleId, attempt + 1), POLLING_INTERVAL_MS);
        }
    } catch (error) {
        console.error(`Error polling for schedule result (ID: ${scheduleId}):`, error);
        toast.error(`Failed to get schedule status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsSolving(false);
    }
};

  // Auto-generate a schedule - Initiates solving and polling
  const handleSolveSchedule = async () => {
    if (!hasEnoughData) {
      toast.error("Please select at least one employee and one shift first.");
      return;
    }

    setIsSolving(true);
    setGeneratedSchedule(false);
    setPendingSchedule([]);
    setPollingAttempts(0);

    try {
      toast.info("Initiating schedule generation...");
      const scheduleId = await ApiService.solveSchedule(selectedEmployees, selectedShifts);
      console.log("Received schedule ID:", scheduleId);
      toast.info(`Schedule generation started (ID: ${scheduleId}). Checking status...`);

      pollForResult(scheduleId, 0);

    } catch (error) {
      console.error('Error initiating schedule generation:', error);
      toast.error(`Failed to start schedule generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSolving(false);
    }
  };

  // Apply the generated schedule
  const handleApplySchedule = () => {
    setScheduleItems([...scheduleItems, ...pendingSchedule]);
    setPendingSchedule([]);
    setGeneratedSchedule(false);
    toast.success('Schedule applied successfully!');
  };

  // Clear the pending schedule and all schedule items
  const handleClearPendingSchedule = () => {
      setPendingSchedule([]);
      setScheduleItems([]); // Clear all schedule items
      setGeneratedSchedule(false);
      toast.info('All changes discarded and schedule cleared');
  };

  // Get shifts for a specific day
  const getShiftsForDay = (day: Date) => {
    return [...scheduleItems, ...(generatedSchedule ? pendingSchedule : [])].filter(item => {
      // Filter by employee if one is selected
      const matchesEmployee = selectedEmployee === 'all' || 
        item.employees.includes(selectedEmployee);
      
      // Filter by date
      const matchesDate = isSameDay(item.date, day);
      
      return matchesDate && matchesEmployee;
    });
  };

  // Get shifts for a specific employee
  const getShiftsForEmployee = (employeeName: string) => {
    return [...scheduleItems, ...(generatedSchedule ? pendingSchedule : [])].filter(item => 
      item.employees.includes(employeeName)
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Calculate employee workload percentages
  const getEmployeeWorkload = (employeeName: string) => {
    const totalDays = calendarDays.length;
    const employeeShifts = scheduleItems.filter(item => 
      item.employees.includes(employeeName)
    ).length;
    
    return Math.round((employeeShifts / totalDays) * 100);
  };

  // Get color for workload percentage
  const getWorkloadColor = (percentage: number) => {
    if (percentage <= 30) return 'bg-green-500';
    if (percentage <= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Get pending shifts for an employee
  const getPendingShiftsForEmployee = (employeeName: string) => {
    return pendingSchedule.filter(item => 
      item.employees.includes(employeeName)
    );
  };

  // Get an employee's preferred shift types
  const getEmployeePreferredShiftTypes = (employeeName: string) => {
    const employee = selectedEmployees.find((emp: any) => emp.name === employeeName);
    return employee?.preferredShiftTypes || [];
  };

  // Format shift types for display
  const formatPreferredShiftTypes = (shiftTypes: ShiftType[]) => {
    if (!shiftTypes || shiftTypes.length === 0) return 'Any shift type';
    return shiftTypes.map(type => SHIFT_TYPES[type]).join(', ');
  };

  // Handle printing individual employee schedule
  const handlePrintEmployeeSchedule = () => {
    if (!employeeToPrint) {
      toast.error("Please select an employee to print schedule");
      return;
    }
    
    setPrintDialogOpen(false);
    
    // Delay printing to ensure the dialog is closed
    setTimeout(() => {
      const printContent = document.getElementById('print-schedule-content');
      if (printContent) {
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
      }
    }, 300);
  };

  // Available employees for shift assignment
  const availableEmployees = selectedEmployees
    .map((emp: any) => emp.name)
    .filter((name: string) => selectedShift && !selectedShift.employees.includes(name));

  if (!hasEnoughData) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in">
        <div className="glass-card max-w-xl w-full p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-medium mb-2">Not Enough Data</h2>
          <p className="text-muted-foreground mb-6">
            Please select both employees and shifts before generating a schedule.
          </p>
          <div className="flex flex-col space-y-2">
            {selectedEmployees.length === 0 && (
              <div className="flex items-center justify-center text-sm bg-amber-50 text-amber-800 rounded-md p-2">
                <span className="mr-2">•</span> No employees selected
              </div>
            )}
            {selectedShifts.length === 0 && (
              <div className="flex items-center justify-center text-sm bg-amber-50 text-amber-800 rounded-md p-2">
                <span className="mr-2">•</span> No shifts selected
              </div>
            )}
          </div>
          <div className="mt-6">
            <Button 
              variant="outline"
              onClick={() => document.getElementById('shifts-tab')?.click()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Shifts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="glass-card bg-green-50/50 text-green-800 flex items-center p-3 mb-4">
        <CheckCircle className="h-4 w-4 mr-2" />
        <p className="text-sm">
          Ready to generate schedule with {selectedEmployees.length} employees and {selectedShifts.length} shifts.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Button 
          variant="outline"
          onClick={() => document.getElementById('shifts-tab')?.click()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shifts
        </Button>
        
        <div className="flex-1 flex flex-wrap gap-2 items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {selectedEmployee === 'all' ? 'All Employees' : selectedEmployee}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedEmployee('all')}>
                All Employees
              </DropdownMenuItem>
              {selectedEmployees.map((employee: any) => (
                <DropdownMenuItem 
                  key={employee.Name} 
                  onClick={() => setSelectedEmployee(employee.Name)}
                >
                  {employee.Name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setPrintDialogOpen(true)}
          >
            <Printer className="h-4 w-4" />
            Print Schedule
          </Button>

          {generatedSchedule ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClearPendingSchedule}>
                Discard Generated Schedule
              </Button>
              <Button onClick={handleApplySchedule} className="gap-2">
                Apply Generated Schedule
              </Button>
            </div>
          ) : (
            <Button onClick={handleSolveSchedule} className="gap-2">
              <CalendarPlus className="h-4 w-4" />
              Generate Optimal Schedule
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Employee list with workload */}
        <div className="w-full lg:w-64 glass-card p-4 overflow-hidden flex flex-col">
          <h2 className="text-lg font-medium mb-4">Employees</h2>
          <div className="mb-2 text-xs text-muted-foreground">
            Monthly workload
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              {selectedEmployees.map((employee: any) => {
                const workload = getEmployeeWorkload(employee.Name);
                const pendingShifts = getPendingShiftsForEmployee(employee.Name);
                const preferredShiftTypes = employee.preferredShiftTypes || [];
                
                return (
                  <div key={employee.Name} className="bg-white/50 rounded-md p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{employee.Name}</div>
                      <Badge variant="outline">{workload}%</Badge>
                    </div>
                    <Progress 
                      value={workload} 
                      className="h-2" 
                      indicatorClassName={getWorkloadColor(workload)}
                    />
                    
                    {/* Show preferred shift types */}
                    {preferredShiftTypes.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Preferred shifts:</span>{' '}
                        <span className="text-xs">
                          {preferredShiftTypes.map(type => (
                            <Badge key={type} variant="secondary" className="mr-1 mb-1">
                              {SHIFT_TYPES[type as ShiftType]}
                            </Badge>
                          ))}
                        </span>
                      </div>
                    )}
                    
                    {/* Show pending shifts for this employee if any */}
                    {pendingShifts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          Pending Shifts ({pendingShifts.length})
                        </div>
                        <div className="space-y-1">
                          {pendingShifts.map((shift, idx) => (
                            <div 
                              key={idx} 
                              className={`text-xs p-1 bg-${shift.color}-100 rounded border-l-2 border-${shift.color}-500`}
                            >
                              <div className="font-medium">{shift.title}</div>
                              <div className="text-muted-foreground">
                                {format(shift.date, 'MMM d')} • {shift.startTime}-{shift.endTime}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Monthly calendar */}
        <div className="flex-1 glass-card overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xl font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-medium text-sm p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* 4-Week View */}
          <div className="space-y-4">
            {calendarWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-2 h-[120px]">
                {week.map((day, dayIndex) => {
                  const dayShifts = getShiftsForDay(day);
                  const isPendingDay = generatedSchedule && pendingSchedule.some(item => isSameDay(item.date, day));
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`border border-border/40 rounded-md p-2 h-full overflow-y-auto ${
                        isPendingDay ? 'bg-blue-50/70' : 'bg-white/50'
                      } ${!isCurrentMonth ? 'opacity-40' : ''} relative`}
                      onClick={() => handleDayClick(day)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day)}
                    >
                      <div className={`text-xs ${isCurrentMonth ? 'text-muted-foreground' : 'text-gray-400'} mb-2 sticky top-0 bg-white/70 backdrop-blur-sm p-1 z-10 rounded-sm`}>
                        {format(day, 'MMM d')}
                      </div>
                      
                      {dayShifts.map(item => {
                        const isPending = pendingSchedule.some(p => p.id === item.id);
                        return (
                          <div 
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(item)}
                            onClick={(e) => handleShiftClick(item, e)}
                            className={`text-xs p-1 bg-${item.color}-100 rounded mb-1 border-l-2 border-${item.color}-500 cursor-pointer hover:brightness-95 active:brightness-90 transition-all group ${
                              isPending ? 'border border-blue-500 bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="font-medium flex items-center justify-between">
                              {item.title}
                              <div className="flex items-center">
                                {isPending && <Badge variant="outline" className="h-4 text-[10px] mr-1">Pending</Badge>}
                                <Info className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                                <GripVertical className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.startTime}-{item.endTime}
                            </div>
                            <div className="text-muted-foreground text-[10px] truncate">{item.employees.join(', ')}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Click on a day to add a shift or drag and drop existing shifts to reschedule
          </div>
        </div>
      </div>

      {/* Shift Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent 
          className="sm:max-w-md"
          aria-describedby="shift-details-description"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedShift?.title}
              <Badge className={`bg-${selectedShift?.color}-500`}>Shift Details</Badge>
            </DialogTitle>
          </DialogHeader>
          <p id="shift-details-description" className="sr-only">
            View and manage shift details including assigned employees, time, and location.
          </p>
          <div className="space-y-4 py-4">
            {selectedShift && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Shift Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Date:</div>
                    <div>
                      {format(selectedShift.date, 'MMMM d, yyyy')}
                    </div>
                    <div className="text-muted-foreground">Time:</div>
                    <div>
                      {selectedShift.startTime} - {selectedShift.endTime}
                    </div>
                    <div className="text-muted-foreground">Type:</div>
                    <div>{selectedShift.title}</div>
                    <div className="text-muted-foreground">ID:</div>
                    <div>{selectedShift.id}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center justify-between">
                    <span>Assigned Employees ({selectedShift.employees.length})</span>
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="h-7">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove Shift
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the shift "{selectedShift.title}" from the schedule.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteShift} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </h4>
                  
                  <div className="space-y-2">
                    {selectedShift.employees.map((employee, idx) => {
                      const preferredShiftTypes = getEmployeePreferredShiftTypes(employee);
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-secondary/20">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs mr-2">
                              {employee.charAt(0)}
                            </div>
                            <div>
                              <div>{employee}</div>
                              {preferredShiftTypes.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Prefers: {preferredShiftTypes.map(type => (
                                    <Badge key={type} variant="secondary" className="mr-1">
                                      {SHIFT_TYPES[type as ShiftType]}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 text-red-500 hover:text-red-700 hover:bg-red-100"
                            onClick={() => handleRemoveEmployee(employee)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  
                  {availableEmployees.length > 0 && (
                    <div className="flex items-center mt-4 space-x-2">
                      <Select value={employeeToAdd} onValueChange={setEmployeeToAdd}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an employee to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedEmployees.map((emp: any) => (
                            <SelectItem key={emp.EmployeeId} value={emp.Name}>{emp.Name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        onClick={handleAddEmployee} 
                        disabled={!employeeToAdd}
                        className="flex-shrink-0"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Shift Dialog */}
      <AddShiftDialog
        open={addShiftDialogOpen}
        onOpenChange={setAddShiftDialogOpen}
        clickedDate={clickedDate}
        selectedShiftType={selectedShiftType}
        setSelectedShiftType={setSelectedShiftType}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        selectedEmployees={selectedEmployees}
        employeeToAdd={employeeToAdd}
        setEmployeeToAdd={setEmployeeToAdd}
        handleAddShift={handleAddShift}
        setAddShiftDialogOpen={setAddShiftDialogOpen}
      />
      {/* Print Schedule Dialog */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent 
          className="sm:max-w-md"
          aria-describedby="print-schedule-description"
        >
          <DialogHeader>
            <DialogTitle>Print Employee Schedule</DialogTitle>
            <DialogDescription>
              Select an employee to print their monthly schedule
            </DialogDescription>
          </DialogHeader>
          <p id="print-schedule-description" className="sr-only">
            Select an employee to print their monthly schedule. You can preview the schedule before printing.
          </p>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Employee</label>
              <Select value={employeeToPrint} onValueChange={setEmployeeToPrint}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {selectedEmployees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.name}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {employeeToPrint && (
              <div className="border rounded-md p-3 bg-gray-50">
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                <div className="text-xs">
                  <p><strong>Employee:</strong> {employeeToPrint}</p>
                  <p><strong>Month:</strong> {format(currentMonth, 'MMMM yyyy')}</p>
                  <p><strong>Total Shifts:</strong> {getShiftsForEmployee(employeeToPrint).length}</p>
                </div>
              </div>
            )}

            {/* Hidden print content that will be used when printing */}
            <div id="print-schedule-content" className="hidden">
              <div className="p-8">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Employee Schedule</h1>
                  <p className="text-lg">{format(currentMonth, 'MMMM yyyy')}</p>
                  <div className="mt-2">
                    <p className="text-lg font-medium">{employeeToPrint}</p>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeToPrint && getShiftsForEmployee(employeeToPrint).map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>{format(shift.date, 'EEEE, MMMM d, yyyy')}</TableCell>
                        <TableCell>{shift.title}</TableCell>
                        <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                      </TableRow>
                    ))}
                    {employeeToPrint && getShiftsForEmployee(employeeToPrint).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          No shifts scheduled for this employee
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <div className="mt-8 text-sm text-center">
                  <p>Printed on {format(new Date(), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePrintEmployeeSchedule} 
              disabled={!employeeToPrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleCalendar;
