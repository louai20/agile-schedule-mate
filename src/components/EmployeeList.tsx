import { useState, useEffect } from 'react';
import { Search, User, Briefcase, Star, PlusCircle, ArrowRight, Clock, Calendar, Trash2, Check } from 'lucide-react';
import AnimatedCard from './ui/AnimatedCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ShiftType, getShiftTypeDisplayName, SHIFT_TYPES } from '@/utils/shiftTypes';
import { ApiService } from '@/services/api.service';
import { useToast } from "@/components/ui/use-toast";

interface Employee {
  Name: string;
  work_percentages: number;
  created_at: string;
  Preferences: string;
  Availability: string;
}

interface EmployeeRole {
  EmployeeRoleId: string;
  name: string;
  created_at: string;
}

interface EmployeeListProps {
  onEmployeesSelected: (employees: Employee[]) => void;
}

// REMOVE: interface EmployeeRole

const EmployeeList = ({ onEmployeesSelected }: EmployeeListProps) => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  // REMOVE: const [employeeRoles, setEmployeeRoles] = useState<Record<string, EmployeeRole>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  // REMOVE: const [newEmployeeRole, setNewEmployeeRole] = useState('');
  const [newEmployeeSkills, setNewEmployeeSkills] = useState('');
  const [newEmployeeAvailability, setNewEmployeeAvailability] = useState('');
  const [newEmployeeWorkPercentage, setNewEmployeeWorkPercentage] = useState(60);
  const [newEmployeeShiftTypes, setNewEmployeeShiftTypes] = useState<ShiftType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Add state for the Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Fetch employees and their roles on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have cached data
        const cachedEmployees = localStorage.getItem('cachedEmployees');
        const lastFetchTime = localStorage.getItem('lastFetchTime');
        const currentTime = new Date().getTime();
        
        // If we have cached data and it's less than 5 minutes old, use it
        if (cachedEmployees && lastFetchTime && 
            (currentTime - parseInt(lastFetchTime)) < 5 * 60 * 1000) {
          setEmployees(JSON.parse(cachedEmployees));
          setIsLoading(false);
          return;
        }

        // Otherwise, fetch fresh data
        const employeesData = await ApiService.getEmployees();
        setEmployees(employeesData);
        localStorage.setItem('cachedEmployees', JSON.stringify(employeesData));

        // Fetch roles for each employee
        const roles: Record<string, EmployeeRole> = {};
        for (const employee of employeesData) {
          try {
            const roleData = await ApiService.getEmployeeRoleById(employee.employeeRoleId);
            if (roleData && roleData.length > 0) {
              roles[employee.employeeRoleId] = roleData[0];
            }
          } catch (error) {
            console.error(`Error fetching role for employee ${employee.EmployeeId}:`, error);
          }
        }
        localStorage.setItem('cachedEmployeeRoles', JSON.stringify(roles));
        localStorage.setItem('lastFetchTime', currentTime.toString());
      } catch (err) {
        setError('Failed to fetch employees');
        console.error('Error fetching employees:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update cache when employees or roles change
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem('cachedEmployees', JSON.stringify(employees));
    }
  }, [employees]);

  const filteredEmployees = employees.filter((employee) => {
    const query = searchQuery.toLowerCase();
    return (
      employee.Name.toLowerCase().includes(query) ||
      (employee.Preferences && (
        Array.isArray(employee.Preferences)
          ? employee.Preferences.some(pref => pref.toString().toLowerCase().includes(query))
          : employee.Preferences.toString().toLowerCase().includes(query)
      ))
    );
  });

  // Update the handleToggleEmployee function
  const handleToggleEmployee = (employee: Employee) => {
    setSelectedEmployees((prev) => {
      const isSelected = prev.some((e) => e.Name === employee.Name);
      const newSelection = isSelected 
        ? prev.filter((e) => e.Name !== employee.Name)
        : [...prev, employee];
      
      // Move the parent update to useEffect
      return newSelection;
    });
  };

  // Add this useEffect to handle parent updates
  useEffect(() => {
    onEmployeesSelected(selectedEmployees);
  }, [selectedEmployees, onEmployeesSelected]);

  const handleToggleShiftType = (shiftType: ShiftType) => {
    setNewEmployeeShiftTypes((prev) => {
      if (prev.includes(shiftType)) {
        return prev.filter(type => type !== shiftType);
      } else {
        return [...prev, shiftType];
      }
    });
  };

  const handleAddEmployee = async () => {
      if (!newEmployeeName || !newEmployeeAvailability || !newEmployeeWorkPercentage) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields"
        });
        return;
      }
  
      const employeeData = {
        Name: newEmployeeName.charAt(0).toUpperCase() + newEmployeeName.slice(1),
        work_percentages: parseInt(newEmployeeWorkPercentage.toString()),
        Availability: [newEmployeeAvailability],
        Skills: newEmployeeSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(Boolean)
          .map(skill => skill.charAt(0).toUpperCase() + skill.slice(1)),
        Preferences: newEmployeeShiftTypes.length > 0 
          ? newEmployeeShiftTypes.map(type => type.toUpperCase())
          : ["MORNING"]
      };
  
      try {
        await ApiService.createEmployee(employeeData);
        const updatedEmployees = await ApiService.getEmployees();
        setEmployees(updatedEmployees);
        setIsDialogOpen(false);
        // Reset form fields
        setNewEmployeeName('');
        // REMOVE: setNewEmployeeRole('');
        setNewEmployeeAvailability('');
        setNewEmployeeWorkPercentage(60);
        setNewEmployeeShiftTypes([]);
        setNewEmployeeSkills('');

        toast({
          title: "Success",
          description: `Employee ${employeeData.Name} has been added successfully`,
          className: "bg-green-500 text-white",
        });
      } catch (error) {
        console.error('Error creating employee:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create employee. Please try again."
        });
      }
  };

  const handleEditEmployee = async (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployeeName(employee.Name);
    setNewEmployeeWorkPercentage(employee.work_percentages);
    setNewEmployeeShiftTypes([employee.Preferences as ShiftType]);
    setIsDialogOpen(true);
  };

  // Modify handleDeleteEmployee to use the new state and add toasts
  const handleDeleteEmployee = async (employee: Employee | null) => {
    if (!employee) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No employee selected for deletion."
      });
      return; 
    }

    try {
      await ApiService.deleteEmployee(employee.Name); 
      const updatedEmployees = await ApiService.getEmployees();
      setEmployees(updatedEmployees);
      toast({ 
        title: "Success",
        description: `Employee ${employee.Name} has been deleted successfully`,
        className: "bg-green-500 text-white",
      });
      setIsDeleteDialogOpen(false); // Close the delete dialog
      setEmployeeToDelete(null); // Reset the selection state
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({ 
        variant: "destructive",
        title: "Error",
        description: "Failed to delete employee. Please try again."
      });
      // Optionally keep dialog open on error
    }
  };

  // Function to get color based on work percentage
  const getWorkPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const renderEmployeeCard = (employee: Employee) => (
    <div key={employee.Name} className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{employee.Name}</h3>
          {/* REMOVE: <p className="text-gray-600">Role: {employee.employeeRoleId}</p> */}
          <p className="text-gray-600">Work Percentage: {employee.work_percentages}%</p>
          <p className="text-gray-600">Availability: {employee.Availability}</p>
          <p className="text-gray-600">Preferences: {employee.Preferences}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditEmployee(employee)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteEmployee(employee)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;
  }

  // Remove these duplicate declarations
  // const [isAllSelected, setIsAllSelected] = useState(false);

  // Keep the handleSelectAll function
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedEmployees([]);
      setIsAllSelected(false);
    } else {
      setSelectedEmployees(employees);
      setIsAllSelected(true);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Input
            placeholder="Search employees by name, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200/70"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="flex items-center gap-1"
            onClick={handleSelectAll}
          >
            <User className="h-4 w-4" />
            {isAllSelected ? 'Unselect All' : 'Select All'}
          </Button>

          {/* Delete Employee Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
              setIsDeleteDialogOpen(open);
              // Reset selection if dialog is closed by clicking outside or X
              if (!open) {
                setEmployeeToDelete(null);
              }
            }}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-1">
                <Trash2 className="h-4 w-4" />
                Delete Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Employee</DialogTitle>
              </DialogHeader>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Select an employee to permanently delete:</p>
                {/* Try adding explicit overflow style */}
                <ScrollArea className="max-h-60 border rounded-md" style={{ overflowY: 'auto' }}> 
                  <div className="p-2 space-y-1">
                    {/* ... console.log ... */}
                    {employees.length > 0 ? employees.map(emp => (
                      <div
                        key={emp.Name} // Assuming Name is unique identifier
                        className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer text-sm ${
                          employeeToDelete?.Name === emp.Name
                            ? 'bg-destructive/10 text-destructive font-medium ring-1 ring-destructive/30' // Highlight selected
                            : 'hover:bg-muted/50' // Hover effect
                        }`}
                        onClick={() => setEmployeeToDelete(emp)} // Set employee to delete on click
                      >
                        <span>{emp.Name}</span>
                        {employeeToDelete?.Name === emp.Name && (
                          <Check className="h-4 w-4 text-destructive" /> // Show checkmark when selected
                        )}
                      </div>
                    )) : (
                      <p className="text-center text-sm text-muted-foreground py-4">No employees found.</p>
                    )}
                  </div>
                </ScrollArea> {/* End of ScrollArea */}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                    setIsDeleteDialogOpen(false); // Close dialog
                    setEmployeeToDelete(null); // Reset selection on cancel
                  }}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={!employeeToDelete} // Disable if no employee is selected
                  onClick={() => handleDeleteEmployee(employeeToDelete)} // Call delete handler
                >
                  Delete {employeeToDelete ? ` ${employeeToDelete.Name}` : ''}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Employee Dialog (uses isDialogOpen) */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                {/* Update button text if editing */}
                {editingEmployee ? 'Edit Employee' : 'Add Employee'} 
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="glass-card sm:max-w-md"
              aria-describedby="add-employee-description"
            >
              {/* Update title if editing */}
              <DialogHeader>
                <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
              </DialogHeader>
              <p id="add-employee-description" className="sr-only">
                Fill out the form to add a new employee to the system. Required fields include name, skills, availability, and preferred shift types.
              </p>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input
                    id="name"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    placeholder="Enter employee name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="skills" className="text-sm font-medium">Skills (comma separated)</label>
                  <Input
                    id="skills"
                    value={newEmployeeSkills}
                    onChange={(e) => setNewEmployeeSkills(e.target.value)}
                    placeholder="e.g. React, TypeScript, CSS"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="availability" className="text-sm font-medium">Availability (comma separated)</label>
                  <Input
                    id="availability"
                    value={newEmployeeAvailability}
                    onChange={(e) => setNewEmployeeAvailability(e.target.value)}
                    placeholder="e.g. Monday, Tuesday, Wednesday"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="workPercentage" className="text-sm font-medium">
                    Work Percentage: {newEmployeeWorkPercentage}%
                  </label>
                  <input
                    id="workPercentage"
                    type="range"
                    min="0"
                    max="100"
                    value={newEmployeeWorkPercentage}
                    onChange={(e) => setNewEmployeeWorkPercentage(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Preferred Shift Types Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Preferred Shift Types (select at least one)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {(Object.keys(SHIFT_TYPES) as ShiftType[]).map((shiftType) => (
                      <div key={shiftType} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`shift-${shiftType}`}
                          checked={newEmployeeShiftTypes.includes(shiftType)}
                          onCheckedChange={() => handleToggleShiftType(shiftType)}
                        />
                        <label 
                          htmlFor={`shift-${shiftType}`}
                          className="text-sm cursor-pointer"
                        >
                          {getShiftTypeDisplayName(shiftType)}
                        </label>
                      </div>
                    ))}
                  </div>
                  {newEmployeeShiftTypes.length === 0 && (
                    <p className="text-xs text-red-500">Please select at least one shift type</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddEmployee}>Add Employee</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-2 mb-6">
        <div className="text-sm text-muted-foreground mb-2">
          {selectedEmployees.length} employees selected
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedEmployees.map(employee => (
            <Badge 
              key={employee.Name}
              variant="secondary"
              className="flex items-center gap-1 pl-2 pr-1 py-1 animate-fade-in"
            >
              {employee.Name}
              <button 
                onClick={() => handleToggleEmployee(employee)}
                className="ml-1 rounded-full hover:bg-muted/80 p-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee, index) => (
            <AnimatedCard 
              key={employee.Name}
              className={`employee-card relative ${
                selectedEmployees.some(e => e.Name === employee.Name) 
                  ? 'ring-2 ring-primary/60' 
                  : ''
              }`}
              animationDelay={index * 50}
              onClick={() => handleToggleEmployee(employee)}
            >
              <div className="absolute top-3 right-3">
                <Checkbox
                  checked={selectedEmployees.some(e => e.Name === employee.Name)}
                  onCheckedChange={() => handleToggleEmployee(employee)}
                />
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{employee.Name}</h3>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="mt-2">
                <div className="flex items-center mb-2">
                  <Star className="h-3 w-3 text-muted-foreground mr-1" />
                  <span className="text-xs text-muted-foreground">Skills</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {employee.Skills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Work Percentage Section */}
              <div className="mt-3">
                <div className="flex items-center mb-1">
                  <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                  <span className="text-xs text-muted-foreground">Work Load</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={employee.work_percentages} className="h-2">
                    <div 
                      className={`h-full ${getProgressColor(employee.work_percentages)} rounded-full transition-all`} 
                      style={{ width: `${employee.work_percentages}%` }}
                    />
                  </Progress>
                  <span className={`text-xs font-medium ${getWorkPercentageColor(employee.work_percentages)}`}>
                    {employee.work_percentages}%
                  </span>
                </div>
              </div>
              
              <div className="mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Availability</span>
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      try {
                        const availability = typeof employee.Availability === 'string' 
                          ? JSON.parse(employee.Availability)
                          : employee.Availability;
                        
                        return Array.isArray(availability)
                          ? availability.map((avail, index) => (
                              <Badge key={index} variant="secondary" className="font-normal">
                                {avail}
                              </Badge>
                            ))
                          : <Badge variant="secondary" className="font-normal">
                              {employee.Availability}
                            </Badge>;
                      } catch (e) {
                        return <Badge variant="secondary" className="font-normal">
                          {employee.Availability}
                        </Badge>;
                      }
                    })()}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center mb-2">
                  <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                  <span className="text-xs text-muted-foreground">Preferred Shifts</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {employee.Preferences?.map(pref => (
                    <Badge 
                      key={pref} 
                      variant="outline" 
                      className="text-xs"
                    >
                      {pref.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </ScrollArea>

      {selectedEmployees.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={() => document.getElementById('shifts-tab')?.click()}
            className="gap-2"
          >
            Continue to Shifts <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
