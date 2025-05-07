import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Remove the DialogTrigger completely */}
      <DialogContent 
        className="glass-card sm:max-w-md"
        aria-describedby="add-shift-description"
      >
        <DialogHeader>
          <DialogTitle>Add New Shift</DialogTitle>
        </DialogHeader>
        <p id="add-shift-description" className="sr-only">
          Fill out the form to add a new shift. Required fields include start time, end time, location, and required skills.
        </p>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Shift Title</label>
            <Input
              id="title"
              value={newShiftStartTime}
              onChange={(e) => setNewShiftStartTime(e.target.value)}
              placeholder="Enter shift start time"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium">Department</label>
            <Input
              id="department"
              value={newShiftEndTime}
              onChange={(e) => setNewShiftEndTime(e.target.value)}
              placeholder="Enter shift end time"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">Location</label>
            <Input
              id="location"
              value={newShiftLocation}
              onChange={(e) => setNewShiftLocation(e.target.value)}
              placeholder="Enter location"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="requiredSkill" className="text-sm font-medium">Required Skill</label>
            <Input
              id="requiredSkill"
              value={newShiftRequiredSkill}
              onChange={(e) => setNewShiftRequiredSkill(e.target.value)}
              placeholder="Enter required skill"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select
              id="status"
              value={newShiftStatus}
              onChange={(e) => setNewShiftStatus(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAddShift}>Add Shift</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftForm;