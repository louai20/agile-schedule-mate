
import React, { useState } from 'react';
import { Search, User, Briefcase, Star, PlusCircle, ArrowRight, Clock } from 'lucide-react';
import AnimatedCard from './ui/AnimatedCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ShiftType, getShiftTypeDisplayName, SHIFT_TYPES } from '@/utils/shiftTypes';

// Mock employee data with work percentage and preferred shift types
const MOCK_EMPLOYEES = [
  { id: 1, name: 'Alice Johnson', role: 'Frontend Developer', skills: ['React', 'TypeScript', 'CSS'], availability: 'Full-time', workPercentage: 85, preferredShiftTypes: ['MORNING', 'AFTERNOON'] as ShiftType[] },
  { id: 2, name: 'Bob Smith', role: 'Backend Developer', skills: ['Node.js', 'Python', 'SQL'], availability: 'Part-time', workPercentage: 45, preferredShiftTypes: ['EVENING'] as ShiftType[] },
  { id: 3, name: 'Carol Davis', role: 'UX Designer', skills: ['Figma', 'Adobe XD', 'Sketch'], availability: 'Full-time', workPercentage: 90, preferredShiftTypes: ['MORNING_AFTERNOON'] as ShiftType[] },
  { id: 4, name: 'David Wilson', role: 'Project Manager', skills: ['Agile', 'Scrum', 'Jira'], availability: 'Full-time', workPercentage: 78, preferredShiftTypes: ['MORNING', 'AFTERNOON_EVENING'] as ShiftType[] },
  { id: 5, name: 'Eve Brown', role: 'DevOps Engineer', skills: ['Docker', 'Kubernetes', 'AWS'], availability: 'Contract', workPercentage: 60, preferredShiftTypes: ['EVENING_NIGHT'] as ShiftType[] },
  { id: 6, name: 'Frank Taylor', role: 'QA Engineer', skills: ['Testing', 'Selenium', 'Cypress'], availability: 'Full-time', workPercentage: 88, preferredShiftTypes: ['MORNING', 'AFTERNOON'] as ShiftType[] },
  { id: 7, name: 'Grace Lee', role: 'Data Scientist', skills: ['Python', 'R', 'Machine Learning'], availability: 'Part-time', workPercentage: 50, preferredShiftTypes: ['NIGHT'] as ShiftType[] },
  { id: 8, name: 'Henry Martin', role: 'Mobile Developer', skills: ['React Native', 'Swift', 'Kotlin'], availability: 'Full-time', workPercentage: 72, preferredShiftTypes: ['LONG_SHIFT'] as ShiftType[] },
];

interface Employee {
  id: number;
  name: string;
  role: string;
  skills: string[];
  availability: string;
  workPercentage: number;
  preferredShiftTypes?: ShiftType[];
}

interface EmployeeListProps {
  onEmployeesSelected: (employees: Employee[]) => void;
}

const EmployeeList = ({ onEmployeesSelected }: EmployeeListProps) => {
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('');
  const [newEmployeeSkills, setNewEmployeeSkills] = useState('');
  const [newEmployeeAvailability, setNewEmployeeAvailability] = useState('Full-time');
  const [newEmployeeWorkPercentage, setNewEmployeeWorkPercentage] = useState(100);
  const [newEmployeeShiftTypes, setNewEmployeeShiftTypes] = useState<ShiftType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredEmployees = employees.filter((employee) => {
    const query = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(query) ||
      employee.role.toLowerCase().includes(query) ||
      employee.skills.some((skill) => skill.toLowerCase().includes(query))
    );
  });

  const handleToggleEmployee = (employee: Employee) => {
    setSelectedEmployees((prev) => {
      const isSelected = prev.some((e) => e.id === employee.id);
      
      let newSelection;
      if (isSelected) {
        newSelection = prev.filter((e) => e.id !== employee.id);
      } else {
        newSelection = [...prev, employee];
      }
      
      // Update parent component
      onEmployeesSelected(newSelection);
      return newSelection;
    });
  };

  const handleToggleShiftType = (shiftType: ShiftType) => {
    setNewEmployeeShiftTypes((prev) => {
      if (prev.includes(shiftType)) {
        return prev.filter(type => type !== shiftType);
      } else {
        return [...prev, shiftType];
      }
    });
  };

  const handleAddEmployee = () => {
    // Validation: ensure at least one shift type is selected
    if (newEmployeeShiftTypes.length === 0) {
      alert("Please select at least one preferred shift type");
      return;
    }

    // In a real app, this would call an API to create a new employee
    console.log('New employee would be created here with shift preferences:', newEmployeeShiftTypes);
    setIsDialogOpen(false);
    
    // Reset form
    setNewEmployeeName('');
    setNewEmployeeRole('');
    setNewEmployeeSkills('');
    setNewEmployeeAvailability('Full-time');
    setNewEmployeeWorkPercentage(100);
    setNewEmployeeShiftTypes([]);
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-2 flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
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
                <label htmlFor="role" className="text-sm font-medium">Role</label>
                <Input
                  id="role"
                  value={newEmployeeRole}
                  onChange={(e) => setNewEmployeeRole(e.target.value)}
                  placeholder="Enter employee role"
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
                <label htmlFor="availability" className="text-sm font-medium">Availability</label>
                <select
                  id="availability"
                  value={newEmployeeAvailability}
                  onChange={(e) => setNewEmployeeAvailability(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
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

      <div className="mt-2 mb-6">
        <div className="text-sm text-muted-foreground mb-2">
          {selectedEmployees.length} employees selected
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedEmployees.map(employee => (
            <Badge 
              key={employee.id} 
              variant="secondary"
              className="flex items-center gap-1 pl-2 pr-1 py-1 animate-fade-in"
            >
              {employee.name}
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
              key={employee.id} 
              className={`employee-card relative ${
                selectedEmployees.some(e => e.id === employee.id) 
                  ? 'ring-2 ring-primary/60' 
                  : ''
              }`}
              animationDelay={index * 50}
              onClick={() => handleToggleEmployee(employee)}
            >
              <div className="absolute top-3 right-3">
                <Checkbox
                  checked={selectedEmployees.some(e => e.id === employee.id)}
                  onCheckedChange={() => handleToggleEmployee(employee)}
                />
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{employee.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {employee.role}
                  </div>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="mt-2">
                <div className="flex items-center mb-2">
                  <Star className="h-3 w-3 text-muted-foreground mr-1" />
                  <span className="text-xs text-muted-foreground">Skills</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {employee.skills.map(skill => (
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
                  <Progress value={employee.workPercentage} className="h-2">
                    <div 
                      className={`h-full ${getProgressColor(employee.workPercentage)} rounded-full transition-all`} 
                      style={{ width: `${employee.workPercentage}%` }}
                    />
                  </Progress>
                  <span className={`text-xs font-medium ${getWorkPercentageColor(employee.workPercentage)}`}>
                    {employee.workPercentage}%
                  </span>
                </div>
              </div>
              
              {/* Preferred Shift Types Section */}
              <div className="mt-3">
                <div className="flex items-center mb-1">
                  <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                  <span className="text-xs text-muted-foreground">Preferred Shifts</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {employee.preferredShiftTypes?.map(shiftType => (
                    <Badge key={shiftType} variant="secondary" className="text-xs">
                      {getShiftTypeDisplayName(shiftType)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-3 text-xs text-right">
                <Badge variant="secondary" className="font-normal">
                  {employee.availability}
                </Badge>
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
