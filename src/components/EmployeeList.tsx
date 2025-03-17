
import React, { useState } from 'react';
import { Search, Check, X, User, Briefcase, Star, PlusCircle } from 'lucide-react';
import AnimatedCard from './ui/AnimatedCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock employee data
const MOCK_EMPLOYEES = [
  { id: 1, name: 'Alice Johnson', role: 'Frontend Developer', skills: ['React', 'TypeScript', 'CSS'], availability: 'Full-time' },
  { id: 2, name: 'Bob Smith', role: 'Backend Developer', skills: ['Node.js', 'Python', 'SQL'], availability: 'Part-time' },
  { id: 3, name: 'Carol Davis', role: 'UX Designer', skills: ['Figma', 'Adobe XD', 'Sketch'], availability: 'Full-time' },
  { id: 4, name: 'David Wilson', role: 'Project Manager', skills: ['Agile', 'Scrum', 'Jira'], availability: 'Full-time' },
  { id: 5, name: 'Eve Brown', role: 'DevOps Engineer', skills: ['Docker', 'Kubernetes', 'AWS'], availability: 'Contract' },
  { id: 6, name: 'Frank Taylor', role: 'QA Engineer', skills: ['Testing', 'Selenium', 'Cypress'], availability: 'Full-time' },
  { id: 7, name: 'Grace Lee', role: 'Data Scientist', skills: ['Python', 'R', 'Machine Learning'], availability: 'Part-time' },
  { id: 8, name: 'Henry Martin', role: 'Mobile Developer', skills: ['React Native', 'Swift', 'Kotlin'], availability: 'Full-time' },
];

interface Employee {
  id: number;
  name: string;
  role: string;
  skills: string[];
  availability: string;
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

  const handleAddEmployee = () => {
    // In a real app, this would call an API to create a new employee
    console.log('New employee would be created here');
    setIsDialogOpen(false);
    // Reset form
    setNewEmployeeName('');
    setNewEmployeeRole('');
    setNewEmployeeSkills('');
    setNewEmployeeAvailability('Full-time');
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                <X className="h-3 w-3" />
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
              
              <div className="mt-3 text-xs text-right">
                <Badge variant="secondary" className="font-normal">
                  {employee.availability}
                </Badge>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EmployeeList;
