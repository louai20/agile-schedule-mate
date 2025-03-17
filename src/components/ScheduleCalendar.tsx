
import React, { useState } from 'react';
import { CalendarPlus, AlertCircle, CheckCircle, ArrowLeft, GripVertical, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ScheduleCalendarProps {
  selectedEmployees: any[];
  selectedShifts: any[];
}

interface ScheduleItem {
  id: string;
  title: string;
  employees: string[];
  dayIndex: number;
  color: string;
}

const ScheduleCalendar = ({ selectedEmployees, selectedShifts }: ScheduleCalendarProps) => {
  const hasEnoughData = selectedEmployees.length > 0 && selectedShifts.length > 0;
  
  // Sample schedule items based on the mock data
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { 
      id: '1', 
      title: 'Morning Shift', 
      employees: ['Alice', 'Bob'], 
      dayIndex: 1, 
      color: 'blue' 
    },
    { 
      id: '2', 
      title: 'Afternoon Shift', 
      employees: ['Carol', 'David'], 
      dayIndex: 2, 
      color: 'green' 
    },
    { 
      id: '3', 
      title: 'Night Shift', 
      employees: ['Eve'], 
      dayIndex: 2, 
      color: 'purple' 
    },
    { 
      id: '4', 
      title: 'Special Event', 
      employees: ['Frank', 'Grace', 'Henry'], 
      dayIndex: 4, 
      color: 'amber' 
    },
  ]);
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<ScheduleItem | null>(null);
  // Dialog state for shift details
  const [selectedShift, setSelectedShift] = useState<ScheduleItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSolveSchedule = () => {
    // This would call an API to use Timefold Solver in a real application
    console.log('Solving schedule using Timefold...');
    console.log('Selected employees:', selectedEmployees);
    console.log('Selected shifts:', selectedShifts);
    
    // For demo purposes, we could add some random new shifts to the schedule
    const newSchedule = [...scheduleItems];
    const randomDay = Math.floor(Math.random() * 7);
    const randomShift = selectedShifts[Math.floor(Math.random() * selectedShifts.length)];
    const randomEmployees = selectedEmployees
      .slice(0, Math.floor(Math.random() * selectedEmployees.length) + 1)
      .map((emp: any) => emp.name || 'Employee');
    
    if (randomShift) {
      newSchedule.push({
        id: Date.now().toString(),
        title: randomShift.name || 'New Shift',
        employees: randomEmployees,
        dayIndex: randomDay,
        color: ['blue', 'green', 'purple', 'amber', 'rose'][Math.floor(Math.random() * 5)]
      });
      
      setScheduleItems(newSchedule);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (item: ScheduleItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dayIndex: number) => {
    e.preventDefault();
    if (draggedItem) {
      const updatedItems = scheduleItems.map(item => 
        item.id === draggedItem.id ? {...item, dayIndex} : item
      );
      setScheduleItems(updatedItems);
      setDraggedItem(null);
    }
  };

  // Handler for shift click to show details
  const handleShiftClick = (shift: ScheduleItem) => {
    setSelectedShift(shift);
    setDialogOpen(true);
  };

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

  // This would show a real calendar in a production app
  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="glass-card bg-green-50/50 text-green-800 flex items-center p-3 mb-4">
        <CheckCircle className="h-4 w-4 mr-2" />
        <p className="text-sm">
          Ready to generate schedule with {selectedEmployees.length} employees and {selectedShifts.length} shifts.
        </p>
      </div>

      <div className="flex justify-between mb-4">
        <Button 
          variant="outline"
          onClick={() => document.getElementById('shifts-tab')?.click()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shifts
        </Button>

        <Button onClick={handleSolveSchedule} className="flex items-center gap-1">
          <CalendarPlus className="h-4 w-4" />
          Generate Optimal Schedule
        </Button>
      </div>

      <div className="flex-1 glass-card overflow-hidden p-6">
        <div className="text-lg font-medium mb-4">Weekly Schedule</div>
        <p className="text-xs text-muted-foreground mb-4">Drag and drop shifts to reschedule them or click for details</p>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-medium text-sm p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2 h-[400px]">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + i);
            
            return (
              <div 
                key={i} 
                className="border border-border/40 rounded-md p-2 h-full overflow-y-auto bg-white/50"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, i)}
              >
                <div className="text-xs text-muted-foreground mb-2">
                  {format(date, 'MMM d')}
                </div>
                
                {scheduleItems
                  .filter(item => item.dayIndex === i)
                  .map(item => (
                    <div 
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      onClick={() => handleShiftClick(item)}
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
                  ))
                }
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          In a real application, this would be powered by FullCalendar.js with interactive features.
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
                    <div className="text-muted-foreground">Day:</div>
                    <div>
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedShift.dayIndex]}
                    </div>
                    <div className="text-muted-foreground">ID:</div>
                    <div>{selectedShift.id}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Assigned Employees ({selectedShift.employees.length})</h4>
                  <div className="space-y-2">
                    {selectedShift.employees.map((employee, idx) => (
                      <div key={idx} className="flex items-center p-2 rounded-md bg-secondary/20">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs mr-2">
                          {employee.charAt(0)}
                        </div>
                        <div>{employee}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    In a real application, this would show detailed information from the employee and shift databases.
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleCalendar;
