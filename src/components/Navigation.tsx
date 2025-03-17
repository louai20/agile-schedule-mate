
import React from 'react';
import { Users, Calendar, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const navItems = [
    { id: 'employees', label: 'Employees', icon: <Users className="w-4 h-4 mr-2" /> },
    { id: 'shifts', label: 'Shifts', icon: <Clock className="w-4 h-4 mr-2" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4 mr-2" /> },
  ];

  return (
    <nav className="w-full overflow-hidden bg-white/50 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
      <div className="container flex items-center h-16">
        <div className="mr-8 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary" />
          <span className="font-medium text-lg">Scheduler</span>
        </div>
        
        <div className="flex space-x-1 lg:space-x-2">
          {navItems.map((item) => (
            <button
              id={`${item.id}-tab`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "nav-link flex items-center",
                activeTab === item.id ? "active" : ""
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
