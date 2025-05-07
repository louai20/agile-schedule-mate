import React, { useState, useEffect } from 'react';
import { AlertCircle, Users, ArrowRight, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiService } from '@/services/api.service';
import { useToast } from "@/components/ui/use-toast";
import ShiftForm from './shift/ShiftForm';
import ShiftList from './shift/ShiftList';

interface Shift {
  ShiftID: string;
  StartTime: string;
  EndTime: string;
  ShiftStatus: string;
  RequiredSkill: string;
  created_at: string;
  location: string;
}

interface Employee {
  EmployeeID: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Role: string;
  Availability: string[];
  Skills: string[];
}

interface ShiftManagerProps {
  onShiftsSelected: (shifts: Shift[]) => void;
  selectedEmployees: Employee[];
}

const ShiftManager = ({ onShiftsSelected, selectedEmployees }: ShiftManagerProps) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<Shift[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New shift form state
  const [newShiftStartTime, setNewShiftStartTime] = useState('');
  const [newShiftEndTime, setNewShiftEndTime] = useState('');
  const [newShiftLocation, setNewShiftLocation] = useState('');
  const [newShiftRequiredSkill, setNewShiftRequiredSkill] = useState('');
  const [newShiftStatus, setNewShiftStatus] = useState('Scheduled');

  // Fetch shifts on component mount
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have cached data
        const cachedShifts = localStorage.getItem('cachedShifts');
        const lastFetchTime = localStorage.getItem('lastShiftsFetchTime');
        const currentTime = new Date().getTime();
        
        // If we have cached data and it's less than 5 minutes old, use it
        if (cachedShifts && lastFetchTime && 
            (currentTime - parseInt(lastFetchTime)) < 5 * 60 * 1000) {
          setShifts(JSON.parse(cachedShifts));
          setIsLoading(false);
          return;
        }

        // Otherwise, fetch fresh data
        const shiftsData = await ApiService.getShifts();
        setShifts(shiftsData);
        localStorage.setItem('cachedShifts', JSON.stringify(shiftsData));
        localStorage.setItem('lastShiftsFetchTime', currentTime.toString());
      } catch (err) {
        setError('Failed to fetch shifts');
        console.error('Error fetching shifts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShifts();
  }, []);

  // Update cache when shifts change
  useEffect(() => {
    if (shifts.length > 0) {
      localStorage.setItem('cachedShifts', JSON.stringify(shifts));
    }
  }, [shifts]);

  const filteredShifts = shifts.filter((shift) => {
    const query = searchQuery.toLowerCase();
    return (
      shift.location.toLowerCase().includes(query) ||
      shift.RequiredSkill.toLowerCase().includes(query) ||
      shift.ShiftStatus.toLowerCase().includes(query)
    );
  });

  const handleToggleShift = (shift: Shift) => {
    setSelectedShifts((prev) => {
      const isSelected = prev.some((s) => s.ShiftID === shift.ShiftID);
      
      let newSelection;
      if (isSelected) {
        newSelection = prev.filter((s) => s.ShiftID !== shift.ShiftID);
      } else {
        newSelection = [...prev, shift];
      }
      
      onShiftsSelected(newSelection);
      return newSelection;
    });
  };

  const { toast } = useToast(); // <-- Add this line

  const handleAddShift = async () => {
    try {
      // Validate that all required fields are filled
      if (!newShiftStartTime || !newShiftEndTime || !newShiftLocation || !newShiftRequiredSkill) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Create the shift object with proper timestamp format
      const newShift = {
        StartTime: newShiftStartTime,
        EndTime: newShiftEndTime,
        location: newShiftLocation,
        RequiredSkill: newShiftRequiredSkill,
        ShiftStatus: newShiftStatus
      };

      console.log("Sending shift to database:", newShift);
      await ApiService.createShift(newShift);
      
      // Refresh the shift list
      const updatedShifts = await ApiService.getShifts();
      setShifts(updatedShifts);
      
      setIsDialogOpen(false);
      
      // Reset form
      setNewShiftStartTime('');
      setNewShiftEndTime('');
      setNewShiftLocation('');
      setNewShiftRequiredSkill('');
      setNewShiftStatus('Scheduled');

      // Show success toast
      toast({
        title: "Success",
        description: "Shift added successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error creating shift:', error);
      toast({
        title: "Error",
        description: "Failed to create shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  const refreshShifts = async () => {
    try {
      setIsLoading(true);
      const shiftsData = await ApiService.getShifts();
      setShifts(shiftsData);
      localStorage.setItem('cachedShifts', JSON.stringify(shiftsData));
      localStorage.setItem('lastShiftsFetchTime', new Date().getTime().toString());
    } catch (err) {
      setError('Failed to fetch shifts');
      console.error('Error fetching shifts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="mb-4">
        {selectedEmployees.length === 0 ? (
          <div className="glass-card bg-amber-50/50 text-amber-800 flex items-center p-3 mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p className="text-sm">No employees selected. Please select employees to assign to shifts.</p>
          </div>
        ) : (
          <div className="glass-card bg-blue-50/50 text-blue-800 flex items-center p-3 mb-4">
            <Users className="h-4 w-4 mr-2" />
            <p className="text-sm">{selectedEmployees.length} employees selected for scheduling.</p>
          </div>
        )}
      </div>

      <ShiftList
        filteredShifts={filteredShifts}
        selectedShifts={selectedShifts}
        handleToggleShift={handleToggleShift}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsDialogOpen={setIsDialogOpen}
        allShifts={shifts}
        refreshShifts={refreshShifts} // <-- Pass the function here
      />

      <div className="mt-4">
        <Button 
          variant="outline"
          onClick={() => document.getElementById('employees-tab')?.click()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Employees
        </Button>
        
        {selectedShifts.length > 0 && (
          <Button 
            onClick={() => document.getElementById('schedule-tab')?.click()}
            className="gap-2 float-right"
          >
            Go to Schedule <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    
      <ShiftForm
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        newShiftStartTime={newShiftStartTime}
        setNewShiftStartTime={setNewShiftStartTime}
        newShiftEndTime={newShiftEndTime}
        setNewShiftEndTime={setNewShiftEndTime}
        newShiftLocation={newShiftLocation}
        setNewShiftLocation={setNewShiftLocation}
        newShiftRequiredSkill={newShiftRequiredSkill}
        setNewShiftRequiredSkill={setNewShiftRequiredSkill}
        newShiftStatus={newShiftStatus}
        setNewShiftStatus={setNewShiftStatus}
        handleAddShift={handleAddShift}
      />
    </div>
  );
};

export default ShiftManager;
