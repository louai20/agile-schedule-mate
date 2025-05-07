import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parse, set, isAfter, isBefore } from 'date-fns';
import { AlertCircle } from 'lucide-react';

interface ShiftFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newShiftStartTime: string;
  setNewShiftStartTime: (time: string) => void;
  newShiftEndTime: string;
  setNewShiftEndTime: (time: string) => void;
  newShiftLocation: string;
  setNewShiftLocation: (location: string) => void;
  newShiftRequiredSkill: string;
  setNewShiftRequiredSkill: (skill: string) => void;
  newShiftStatus: string;
  setNewShiftStatus: (status: string) => void;
  handleAddShift: () => void;
}

const ShiftForm: React.FC<ShiftFormProps> = ({
  isOpen,
  setIsOpen,
  newShiftStartTime,
  setNewShiftStartTime,
  newShiftEndTime,
  setNewShiftEndTime,
  newShiftLocation,
  setNewShiftLocation,
  newShiftRequiredSkill,
  setNewShiftRequiredSkill,
  newShiftStatus,
  setNewShiftStatus,
  handleAddShift
}) => {
  // Local state for form inputs
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form with existing values when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Initialize with current date/time if empty
      const now = new Date();
      const todayFormatted = format(now, 'yyyy-MM-dd');
      const currentTimeFormatted = format(now, 'HH:mm');
      
      // Set start date/time
      if (newShiftStartTime) {
        try {
          const date = new Date(newShiftStartTime);
          setStartDate(format(date, 'yyyy-MM-dd'));
          setStartTime(format(date, 'HH:mm'));
        } catch (e) {
          setStartDate(todayFormatted);
          setStartTime(currentTimeFormatted);
        }
      } else {
        setStartDate(todayFormatted);
        setStartTime(currentTimeFormatted);
      }
      
      // Set end date/time
      if (newShiftEndTime) {
        try {
          const date = new Date(newShiftEndTime);
          setEndDate(format(date, 'yyyy-MM-dd'));
          setEndTime(format(date, 'HH:mm'));
        } catch (e) {
          // Default end time is 8 hours after start time
          const endDefault = new Date(now);
          endDefault.setHours(now.getHours() + 8);
          setEndDate(todayFormatted);
          setEndTime(format(endDefault, 'HH:mm'));
        }
      } else {
        // Default end time is 8 hours after start time
        const endDefault = new Date(now);
        endDefault.setHours(now.getHours() + 8);
        setEndDate(todayFormatted);
        setEndTime(format(endDefault, 'HH:mm'));
      }
      
      // Clear any previous validation errors
      setValidationError(null);
    }
  }, [isOpen, newShiftStartTime, newShiftEndTime]);

  // Validate date and time
  const validateDateTime = () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      setValidationError('Please fill in all date and time fields');
      return false;
    }
    
    try {
      // Parse start date/time
      const startDateObj = parse(startDate, 'yyyy-MM-dd', new Date());
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const fullStartDateTime = set(startDateObj, { hours: startHours, minutes: startMinutes, seconds: 0 });
      
      // Parse end date/time
      const endDateObj = parse(endDate, 'yyyy-MM-dd', new Date());
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const fullEndDateTime = set(endDateObj, { hours: endHours, minutes: endMinutes, seconds: 0 });
      
      // Check if end date/time is before start date/time
      if (isBefore(fullEndDateTime, fullStartDateTime)) {
        setValidationError('End date/time cannot be before start date/time');
        return false;
      }
      
      // Clear validation error if everything is valid
      setValidationError(null);
      return true;
    } catch (e) {
      setValidationError('Invalid date or time format');
      return false;
    }
  };

  // Update the ISO string when date or time changes
  const updateStartDateTime = () => {
    if (startDate && startTime) {
      try {
        // Parse the date and time inputs
        const dateObj = parse(startDate, 'yyyy-MM-dd', new Date());
        const [hours, minutes] = startTime.split(':').map(Number);
        
        // Set the time on the date object
        const fullDateTime = set(dateObj, { hours, minutes, seconds: 0 });
        
        // Update the parent state with ISO string
        setNewShiftStartTime(fullDateTime.toISOString());
        
        // Validate after updating
        validateDateTime();
        
        console.log('Updated start time:', fullDateTime.toISOString());
      } catch (e) {
        console.error('Error parsing start date/time:', e);
      }
    }
  };

  const updateEndDateTime = () => {
    if (endDate && endTime) {
      try {
        // Parse the date and time inputs
        const dateObj = parse(endDate, 'yyyy-MM-dd', new Date());
        const [hours, minutes] = endTime.split(':').map(Number);
        
        // Set the time on the date object
        const fullDateTime = set(dateObj, { hours, minutes, seconds: 0 });
        
        // Update the parent state with ISO string
        setNewShiftEndTime(fullDateTime.toISOString());
        
        // Validate after updating
        validateDateTime();
        
        console.log('Updated end time:', fullDateTime.toISOString());
      } catch (e) {
        console.error('Error parsing end date/time:', e);
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate date/time before submitting
    if (!validateDateTime()) {
      return; // Don't submit if validation fails
    }
    
    // Make sure both date/time fields are updated
    updateStartDateTime();
    updateEndDateTime();
    
    // Call the parent's handleAddShift function
    setTimeout(handleAddShift, 100); // Small delay to ensure state updates
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Shift</DialogTitle>
        </DialogHeader>
        
        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p className="text-sm">{validationError}</p>
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                // Don't update parent state immediately to avoid interference
              }}
              onBlur={updateStartDateTime}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              Start Time
            </Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                // Don't update parent state immediately to avoid interference
              }}
              onBlur={updateStartDateTime}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                // Don't update parent state immediately to avoid interference
              }}
              onBlur={updateEndDateTime}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-time" className="text-right">
              End Time
            </Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                // Don't update parent state immediately to avoid interference
              }}
              onBlur={updateEndDateTime}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={newShiftLocation}
              onChange={(e) => setNewShiftLocation(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="required-skill" className="text-right">
              Required Skill
            </Label>
            <Input
              id="required-skill"
              value={newShiftRequiredSkill}
              onChange={(e) => setNewShiftRequiredSkill(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={newShiftStatus}
              onValueChange={setNewShiftStatus}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Shift</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftForm;