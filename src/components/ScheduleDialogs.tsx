import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { SHIFT_TYPES, ShiftType } from '@/utils/shiftTypes';

interface AddShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void; // Ensure this is a function that sets the open state
  clickedDate: Date | null;
  selectedShiftType: ShiftType;
  setSelectedShiftType: (type: ShiftType) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  selectedEmployees: any[];
  employeeToAdd: string;
  setEmployeeToAdd: (name: string) => void;
  handleAddShift: () => void;
}

export const AddShiftDialog: React.FC<AddShiftDialogProps> = ({
  open,
  onOpenChange,
  clickedDate,
  selectedShiftType,
  setSelectedShiftType,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  selectedEmployees,
  employeeToAdd,
  setEmployeeToAdd,
  handleAddShift,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md" aria-describedby="add-shift-description">
      <DialogHeader>
        <DialogTitle>Add New Shift</DialogTitle>
        <DialogDescription>
          {clickedDate && <>Add a shift for {format(clickedDate, 'MMMM d, yyyy')}</>}
        </DialogDescription>
      </DialogHeader>
      <p id="add-shift-description" className="sr-only">
        Fill out the form to add a new shift. Required fields include shift type, start time, end time, and assigned employee.
      </p>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Shift Type</label>
          <Select value={selectedShiftType} onValueChange={(value) => setSelectedShiftType(value as ShiftType)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a shift type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SHIFT_TYPES).map(([key, value]) => (
                <SelectItem key={key} value={key as ShiftType}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Time</label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Assign to Employee *</label>
          <Select onValueChange={setEmployeeToAdd}>
            <SelectTrigger>
              <SelectValue placeholder="Select an employee" />
            </SelectTrigger>
            <SelectContent>
              {selectedEmployees.map((emp: any) => {
                const preferredShiftTypes = emp.preferredShiftTypes || [];
                const isPreferred = preferredShiftTypes.includes(selectedShiftType);

                return (
                  <SelectItem key={emp.EmployeeId} value={emp.Name}>
                    <div className="flex items-center">
                      {emp.Name}
                      {isPreferred && (
                        <Badge className="ml-2 bg-green-100 text-green-800 h-5 text-[10px]">
                          Preferred
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">* Required to add a shift</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleAddShift} disabled={!employeeToAdd || !startTime || !endTime}>
          Add Shift
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);