
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import EmployeeList from '@/components/EmployeeList';
import ShiftManager from '@/components/ShiftManager';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import { ShiftType } from '@/utils/shiftTypes';

// Update Employee interface to match the one in EmployeeList
interface Employee {
  id: number;
  name: string;
  role: string;
  skills: string[];
  availability: string;
  workPercentage: number;
  preferredShiftTypes?: ShiftType[];
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<any[]>([]);

  const handleEmployeesSelected = (employees: Employee[]) => {
    setSelectedEmployees(employees);
  };

  const handleShiftsSelected = (shifts: any[]) => {
    setSelectedShifts(shifts);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 container py-6">
        <div className="h-[calc(100vh-8rem)]">
          {activeTab === 'employees' && (
            <EmployeeList onEmployeesSelected={handleEmployeesSelected} />
          )}
          
          {activeTab === 'shifts' && (
            <ShiftManager 
              onShiftsSelected={handleShiftsSelected} 
              selectedEmployees={selectedEmployees}
            />
          )}
          
          {activeTab === 'schedule' && (
            <ScheduleCalendar 
              selectedEmployees={selectedEmployees} 
              selectedShifts={selectedShifts}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
