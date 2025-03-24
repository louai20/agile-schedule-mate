import React, { useState } from 'react';
import { Clock, Calendar as CalendarIcon, MapPin, Users, Plus, AlertCircle, X, ArrowRight, ArrowLeft, Search } from 'lucide-react';
import AnimatedCard from './ui/AnimatedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FormItem, FormLabel } from '@/components/ui/form';

const MOCK_SHIFTS = [
  {
    id: 1,
    title: 'Morning Shift',
    department: 'Engineering',
    location: 'Main Office',
    startTime: new Date(2023, 5, 15, 8, 0),
    endTime: new Date(2023, 5, 15, 16, 0),
    requiredEmployees: 3,
    priority: 'High'
  },
  {
    id: 2,
    title: 'Afternoon Shift',
    department: 'Customer Support',
    location: 'Remote',
    startTime: new Date(2023, 5, 15, 12, 0),
    endTime: new Date(2023, 5, 15, 20, 0),
    requiredEmployees: 2,
    priority: 'Medium'
  },
  {
    id: 3,
    title: 'Night Shift',
    department: 'Operations',
    location: 'Warehouse',
    startTime: new Date(2023, 5, 15, 20, 0),
    endTime: new Date(2023, 5, 16, 4, 0),
    requiredEmployees: 4,
    priority: 'High'
  },
  {
    id: 4,
    title: 'Weekend Shift',
    department: 'Sales',
    location: 'Retail Store',
    startTime: new Date(2023, 5, 17, 9, 0),
    endTime: new Date(2023, 5, 17, 17, 0),
    requiredEmployees: 2,
    priority: 'Low'
  },
  {
    id: 5,
    title: 'Special Event',
    department: 'Marketing',
    location: 'Conference Center',
    startTime: new Date(2023, 5, 18, 10, 0),
    endTime: new Date(2023, 5, 18, 18, 0),
    requiredEmployees: 5,
    priority: 'High'
  }
];

interface Shift {
  id: number;
  title: string;
  department: string;
  location: string;
  startTime: Date;
  endTime: Date;
  requiredEmployees: number;
  priority: string;
}

interface ShiftManagerProps {
  onShiftsSelected: (shifts: Shift[]) => void;
  selectedEmployees: any[];
}

const ShiftManager = ({ onShiftsSelected, selectedEmployees }: ShiftManagerProps) => {
  const [shifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [selectedShifts, setSelectedShifts] = useState<Shift[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newShiftTitle, setNewShiftTitle] = useState('');
  const [newShiftDepartment, setNewShiftDepartment] = useState('');
  const [newShiftLocation, setNewShiftLocation] = useState('');
  const [newShiftRequiredEmployees, setNewShiftRequiredEmployees] = useState(1);
  const [newShiftPriority, setNewShiftPriority] = useState('Medium');
  const [newShiftDate, setNewShiftDate] = useState<Date | undefined>(new Date());
  const [newShiftStartTime, setNewShiftStartTime] = useState('09:00');
  const [newShiftEndTime, setNewShiftEndTime] = useState('17:00');
  
  const filteredShifts = shifts.filter((shift) => {
    const query = searchQuery.toLowerCase();
    return (
      shift.title.toLowerCase().includes(query) ||
      shift.department.toLowerCase().includes(query) ||
      shift.location.toLowerCase().includes(query)
    );
  });

  const handleToggleShift = (shift: Shift) => {
    setSelectedShifts((prev) => {
      const isSelected = prev.some((s) => s.id === shift.id);
      
      let newSelection;
      if (isSelected) {
        newSelection = prev.filter((s) => s.id !== shift.id);
      } else {
        newSelection = [...prev, shift];
      }
      
      onShiftsSelected(newSelection);
      return newSelection;
    });
  };

  const handleAddShift = () => {
    console.log('New shift would be created here with date:', newShiftDate);
    setIsDialogOpen(false);
    
    setNewShiftTitle('');
    setNewShiftDepartment('');
    setNewShiftLocation('');
    setNewShiftRequiredEmployees(1);
    setNewShiftPriority('Medium');
    setNewShiftDate(new Date());
    setNewShiftStartTime('09:00');
    setNewShiftEndTime('17:00');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

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
            <DialogContent className="glass-card sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Shift</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Shift Title</label>
                  <Input
                    id="title"
                    value={newShiftTitle}
                    onChange={(e) => setNewShiftTitle(e.target.value)}
                    placeholder="Enter shift title"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium">Department</label>
                  <Input
                    id="department"
                    value={newShiftDepartment}
                    onChange={(e) => setNewShiftDepartment(e.target.value)}
                    placeholder="Enter department"
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
                  <FormLabel htmlFor="date">Shift Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newShiftDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newShiftDate ? format(newShiftDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newShiftDate}
                        onSelect={setNewShiftDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="startTime" className="text-sm font-medium">Start Time</label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newShiftStartTime}
                      onChange={(e) => setNewShiftStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="endTime" className="text-sm font-medium">End Time</label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newShiftEndTime}
                      onChange={(e) => setNewShiftEndTime(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="employees" className="text-sm font-medium">Required Employees</label>
                  <Input
                    id="employees"
                    type="number"
                    min="1"
                    value={newShiftRequiredEmployees}
                    onChange={(e) => setNewShiftRequiredEmployees(parseInt(e.target.value))}
                  />
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
              key={shift.id} 
              variant="secondary"
              className="flex items-center gap-1 pl-2 pr-1 py-1 animate-fade-in"
            >
              {shift.title}
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
          {filteredShifts.map((shift, index) => (
            <AnimatedCard 
              key={shift.id} 
              className={`shift-card relative cursor-pointer ${
                selectedShifts.some(s => s.id === shift.id) 
                  ? 'ring-2 ring-primary/60' 
                  : ''
              }`}
              animationDelay={index * 50}
              onClick={() => handleToggleShift(shift)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{shift.title}</h3>
                <Badge className={getPriorityColor(shift.priority)}>
                  {shift.priority}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground mt-1">
                {shift.department}
              </div>
              
              <Separator className="my-3" />
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <span>
                    {format(shift.startTime, 'MMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <span>
                    {format(shift.startTime, 'h:mm a')} - {format(shift.endTime, 'h:mm a')}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <MapPin className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <span>{shift.location}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Users className="h-3 w-3 mr-1.5 text-muted-foreground" />
                  <span>{shift.requiredEmployees} employees needed</span>
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
