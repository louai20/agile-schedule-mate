
import React from 'react';
import { CalendarPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ScheduleCalendarProps {
  selectedEmployees: any[];
  selectedShifts: any[];
}

const ScheduleCalendar = ({ selectedEmployees, selectedShifts }: ScheduleCalendarProps) => {
  const hasEnoughData = selectedEmployees.length > 0 && selectedShifts.length > 0;
  
  const handleSolveSchedule = () => {
    // This would call an API to use Timefold Solver in a real application
    console.log('Solving schedule using Timefold...');
    console.log('Selected employees:', selectedEmployees);
    console.log('Selected shifts:', selectedShifts);
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

      <div className="flex justify-end mb-4">
        <Button onClick={handleSolveSchedule} className="flex items-center gap-1">
          <CalendarPlus className="h-4 w-4" />
          Generate Optimal Schedule
        </Button>
      </div>

      <div className="flex-1 glass-card overflow-hidden p-6">
        <div className="text-lg font-medium mb-4">Weekly Schedule</div>
        
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
              >
                <div className="text-xs text-muted-foreground mb-2">
                  {format(date, 'MMM d')}
                </div>
                
                {/* In a real app, we would map over assigned shifts for this day */}
                {i === 1 && (
                  <div className="text-xs p-1 bg-blue-100 rounded mb-1 border-l-2 border-blue-500">
                    <div className="font-medium">Morning Shift</div>
                    <div className="text-muted-foreground">Alice, Bob</div>
                  </div>
                )}
                
                {i === 2 && (
                  <>
                    <div className="text-xs p-1 bg-green-100 rounded mb-1 border-l-2 border-green-500">
                      <div className="font-medium">Afternoon Shift</div>
                      <div className="text-muted-foreground">Carol, David</div>
                    </div>
                    <div className="text-xs p-1 bg-purple-100 rounded mb-1 border-l-2 border-purple-500">
                      <div className="font-medium">Night Shift</div>
                      <div className="text-muted-foreground">Eve</div>
                    </div>
                  </>
                )}
                
                {i === 4 && (
                  <div className="text-xs p-1 bg-amber-100 rounded mb-1 border-l-2 border-amber-500">
                    <div className="font-medium">Special Event</div>
                    <div className="text-muted-foreground">Frank, Grace, Henry</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          In a real application, this would be powered by FullCalendar.js with interactive features.
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
