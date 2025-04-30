import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, Users, Plus, AlertCircle, X, ArrowRight, ArrowLeft, Search } from 'lucide-react';
import AnimatedCard from './ui/AnimatedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

  const handleAddShift = async () => {
    try {
      const newShift = {
        StartTime: newShiftStartTime,
        EndTime: newShiftEndTime,
        location: newShiftLocation,
        RequiredSkill: newShiftRequiredSkill,
        ShiftStatus: newShiftStatus
      };

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
    } catch (error) {
      console.error('Error creating shift:', error);
      alert('Failed to create shift. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
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

  const getShiftType = (startTime: string, endTime: string) => {
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

        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4">
              <Search className="h-4 w-4" />
            </div>
            <Input
              placeholder="Search shifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200/70"
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ml-2 flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Shift
              </Button>
            </DialogTrigger>
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
        </div>
      </div>

      <div className="mt-2 mb-6">
        <div className="text-sm text-muted-foreground mb-2">
          {selectedShifts.length} shifts selected
        </div>
        <div className="flex flex-wrap gap-2">
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
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredShifts.map((shift) => (
            <AnimatedCard
              key={shift.ShiftID}
              className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                selectedShifts.some(s => s.ShiftID === shift.ShiftID)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleToggleShift(shift)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{getShiftType(shift.StartTime, shift.EndTime)}</h3>
                <Badge variant={shift.ShiftStatus === 'open' ? 'default' : 'secondary'}>
                  {shift.ShiftStatus}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground mt-1">
                {shift.RequiredSkill}
              </div>
              
              <Separator className="my-3" />
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <span>
                    {format(new Date(shift.StartTime), 'MMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <span>
                    {format(new Date(shift.StartTime), 'HH:mm a')} - {format(new Date(shift.EndTime), 'HH:mm a')}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <MapPin className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <span>{shift.location}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Users className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <span>-</span>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 flex justify-between">
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
            className="gap-2"
          >
            Go to Schedule <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ShiftManager;
