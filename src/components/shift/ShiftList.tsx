import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Trash2, Plus, Search, User } from 'lucide-react';
import ShiftCard from './ShiftCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { getShiftType } from './ShiftUtils';
import { useToast } from "@/components/ui/use-toast";
import { ApiService } from '@/services/api.service';

interface Shift {
  ShiftID: string;
  StartTime: string;
  EndTime: string;
  ShiftStatus: string;
  RequiredSkill: string;
  created_at: string;
  location: string;
}

interface ShiftListProps {
  filteredShifts: Shift[];
  selectedShifts: Shift[];
  handleToggleShift: (shift: Shift) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsDialogOpen: (open: boolean) => void;
  allShifts: Shift[];
  refreshShifts: () => void; // <-- Add this prop
}

const ShiftList: React.FC<ShiftListProps> = ({ 
  filteredShifts, 
  selectedShifts, 
  handleToggleShift,
  searchQuery,
  setSearchQuery,
  setIsDialogOpen,
  allShifts, // Use this for the delete dialog
  refreshShifts // <-- Add this here
}) => {
  // Move the useToast hook inside the component function
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);

  // Handle select all shifts
  const handleSelectAll = () => {
    // If not all selected, select all that aren't already selected
    filteredShifts.forEach(shift => {
      if (!selectedShifts.some(s => s.ShiftID === shift.ShiftID)) {
        handleToggleShift(shift);
      }
    });
  };

  // Handle unselect all shifts
  const handleUnselectAll = () => {
    // Deselect all selected shifts
    [...selectedShifts].forEach(shift => handleToggleShift(shift));
  };

  // Handle delete selected shifts
  const handleDeleteSelected = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (shiftToDelete) {
      try {
        await ApiService.deleteShift(shiftToDelete.ShiftID);

        if (selectedShifts.some(s => s.ShiftID === shiftToDelete.ShiftID)) {
          handleToggleShift(shiftToDelete);
        }

        toast({
          title: "Success",
          description: "Shift deleted successfully",
          variant: "default",
        });

        setShiftToDelete(null);
        setIsDeleteDialogOpen(false);

        // Instead of reloading, refresh shifts from parent
        refreshShifts();
      } catch (error) {
        console.error('Error deleting shift:', error);
        toast({
          title: "Error",
          description: "Failed to delete shift. Please try again.",
          variant: "destructive",
        });
      }
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full max-w-md">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder="Search shifts by name, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200/70"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {selectedShifts.length > 0 ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUnselectAll}
              className="flex items-center gap-1"
            >
              <User className="h-4 w-4" />
              Unselect All
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              className="flex items-center gap-1"
            >
              <User className="h-4 w-4" />
              Select All
            </Button>
          )}
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteSelected}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete Shift
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Shift
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        {selectedShifts.length} shifts selected
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedShifts.map(shift => (
          <Badge 
            key={shift.ShiftID} 
            variant="secondary"
            className="flex items-center gap-1 pl-2 pr-1 py-1 animate-fade-in"
          >
            {shift.RequiredSkill}
            <button 
              onClick={() => handleToggleShift(shift)}
              className="ml-1 rounded-full hover:bg-muted/80 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredShifts.map((shift) => (
            <ShiftCard
              key={shift.ShiftID}
              shift={shift}
              isSelected={selectedShifts.some(s => s.ShiftID === shift.ShiftID)}
              onToggle={handleToggleShift}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Shift</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">Select a shift to permanently delete:</p>
            <ScrollArea className="h-[300px] pr-4 border rounded-md">
              <div className="p-4 space-y-2">
                {allShifts && allShifts.length > 0 ? (
                  allShifts.map((shift) => (
                    <div 
                      key={shift.ShiftID} 
                      className={`p-3 border rounded-md hover:bg-muted/50 cursor-pointer ${
                        shiftToDelete?.ShiftID === shift.ShiftID ? 'bg-muted/50 border-primary' : ''
                      }`}
                      onClick={() => setShiftToDelete(shift)}
                    >
                      <div className="font-medium">{getShiftType(shift.StartTime, shift.EndTime)}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <div className="flex justify-between">
                          <span>Required Skill:</span>
                          <span className="font-medium">{shift.RequiredSkill}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span className="font-medium">{format(new Date(shift.StartTime), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span className="font-medium">
                            {format(new Date(shift.StartTime), 'h:mm a')} - {format(new Date(shift.EndTime), 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="font-medium">{shift.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="font-medium">{shift.ShiftStatus}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No shifts available to delete
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={!shiftToDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShiftList;
