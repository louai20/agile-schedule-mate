
import React, { useState, useEffect } from 'react';
import { CalendarPlus, AlertCircle, CheckCircle, ArrowLeft, GripVertical, Info, Trash2, UserPlus, Users, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

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
}

const ScheduleCalendar = ({ selectedEmployees, selectedShifts }: ScheduleCalendarProps) => {
  const hasEnoughData = selectedEmployees.length > 0 && selectedShifts.length > 0;
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  
  // Schedule items state
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [pendingSchedule, setPendingSchedule] = useState<ScheduleItem[]>([]);
  const [generatedSchedule, setGeneratedSchedule] = useState(false);
  
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
  
  // Initialize calendar days
  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    setCalendarDays(days);
  }, [currentMonth]);
  
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
  const handleAddShift = (shiftTitle: string, employee: string) => {
    if (clickedDate && shiftTitle && employee) {
      const newShift: ScheduleItem = {
        id: Date.now().toString(),
        title: shiftTitle,
        employees: [employee],
        date: clickedDate,
        color: ['blue', 'green', 'purple', 'amber', 'rose'][Math.floor(Math.random() * 5)]
      };
      
      setScheduleItems([...scheduleItems, newShift]);
      setAddShiftDialogOpen(false);
      toast.success(`New shift added on ${format(clickedDate, 'MMMM d, yyyy')}`);
    } else {
      if (!employee) {
        toast.error("Please select an employee for this shift");
      }
    }
  };

  // Auto-generate a schedule
  const handleSolveSchedule = () => {
    console.log('Solving schedule using Timefold...');
    console.log('Selected employees:', selectedEmployees);
    console.log('Selected shifts:', selectedShifts);
    
    // For demo purposes, prepare a random schedule
    const newSchedule: ScheduleItem[] = [];
    
    // Add a few random shifts for the selected employees
    selectedEmployees.forEach((employee: any) => {
      // Add 2-3 shifts for each employee
      const shiftsToAdd = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < shiftsToAdd; i++) {
        const randomDay = calendarDays[Math.floor(Math.random() * calendarDays.length)];
        const randomShift = selectedShifts[Math.floor(Math.random() * selectedShifts.length)];
        
        if (randomShift) {
          newSchedule.push({
            id: Date.now().toString() + i,
            title: randomShift.title || 'New Shift',
            employees: [employee.name || 'Employee'],
            date: randomDay,
            color: ['blue', 'green', 'purple', 'amber', 'rose'][Math.floor(Math.random() * 5)]
          });
        }
      }
    });
    
    // Store the generated schedule but don't apply it yet
    setPendingSchedule(newSchedule);
    setGeneratedSchedule(true);
    toast.success('Schedule generated! Review and apply when ready.');
  };

  // Apply the generated schedule
  const handleApplySchedule = () => {
    setScheduleItems([...scheduleItems, ...pendingSchedule]);
    setPendingSchedule([]);
    setGeneratedSchedule(false);
    toast.success('Schedule applied successfully!');
  };

  // Clear the pending schedule
  const handleClearPendingSchedule = () => {
    setPendingSchedule([]);
    setGeneratedSchedule(false);
    toast.info('Generated schedule discarded');
  };

  // Get shifts for a specific day
  const getShiftsForDay = (day: Date) => {
    return scheduleItems.filter(item => {
      // Filter by employee if one is selected
      const matchesEmployee = selectedEmployee === 'all' || 
        item.employees.includes(selectedEmployee);
      
      // Filter by date
      const matchesDate = isSameDay(item.date, day);
      
      return matchesDate && matchesEmployee;
    });
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
                  key={employee.name} 
                  onClick={() => setSelectedEmployee(employee.name)}
                >
                  {employee.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
                const workload = getEmployeeWorkload(employee.name);
                const pendingShifts = getPendingShiftsForEmployee(employee.name);
                
                return (
                  <div key={employee.name} className="bg-white/50 rounded-md p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{employee.name}</div>
                      <Badge variant="outline">{workload}%</Badge>
                    </div>
                    <Progress 
                      value={workload} 
                      className="h-2" 
                      indicatorClassName={getWorkloadColor(workload)}
                    />
                    
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
                                {format(shift.date, 'MMM d')}
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
          
          <div className="grid grid-cols-7 gap-2 h-[500px]">
            {calendarDays.map((day, i) => {
              const dayShifts = getShiftsForDay(day);
              
              return (
                <div 
                  key={i} 
                  className="border border-border/40 rounded-md p-2 h-full overflow-y-auto bg-white/50 relative"
                  onClick={() => handleDayClick(day)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  <div className="text-xs text-muted-foreground mb-2 sticky top-0 bg-white/70 backdrop-blur-sm p-1 z-10 rounded-sm">
                    {format(day, 'MMM d')}
                  </div>
                  
                  {dayShifts.map(item => (
                    <div 
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      onClick={(e) => handleShiftClick(item, e)}
                      className={`text-xs p-1 bg-${item.color}-100 rounded mb-1 border-l-2 border-${item.color}-500 cursor-pointer hover:brightness-95 active:brightness-90 transition-all group`}
                    >
                      <div className="font-medium flex items-center justify-between">
                        {item.title}
                        <div className="flex items-center">
                          <Info className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="text-muted-foreground">{item.employees.join(', ')}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Click on a day to add a shift or drag and drop existing shifts to reschedule
          </div>
        </div>
      </div>

      {/* Shift Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedShift?.title}
              <Badge className={`bg-${selectedShift?.color}-500`}>Shift Details</Badge>
            </DialogTitle>
            <DialogDescription>
              Information about this scheduled shift and assigned employees.
            </DialogDescription>
          </DialogHeader>
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
                    {selectedShift.employees.map((employee, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-secondary/20">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs mr-2">
                            {employee.charAt(0)}
                          </div>
                          <div>{employee}</div>
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
                    ))}
                  </div>
                  
                  {availableEmployees.length > 0 && (
                    <div className="flex items-center mt-4 space-x-2">
                      <Select value={employeeToAdd} onValueChange={setEmployeeToAdd}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an employee to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableEmployees.map((emp: string) => (
                            <SelectItem key={emp} value={emp}>{emp}</SelectItem>
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
      <Dialog open={addShiftDialogOpen} onOpenChange={setAddShiftDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Shift</DialogTitle>
            <DialogDescription>
              {clickedDate && (
                <>Add a shift for {format(clickedDate, 'MMMM d, yyyy')}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select a Shift Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a shift type" />
                </SelectTrigger>
                <SelectContent>
                  {selectedShifts.map((shift: any) => (
                    <SelectItem key={shift.id} value={shift.title}>
                      {shift.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign to Employee *</label>
              <Select onValueChange={setEmployeeToAdd}>
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
              <p className="text-xs text-muted-foreground">
                * Required to add a shift
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddShiftDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (employeeToAdd && selectedShifts.length > 0) {
                  handleAddShift(selectedShifts[0].title, employeeToAdd);
                } else {
                  toast.error("Please select both a shift type and an employee");
                }
              }} 
              disabled={!employeeToAdd}
            >
              Add Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleCalendar;
